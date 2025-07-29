const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const { spawn } = require('child_process');

// POST /departments/upload-excel
exports.handleExcelUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Maps for quick lookup
    const subjectMap = {};
    const departmentMap = {};
    const teacherMap = {};

    // First pass: create/update subjects and departments
    for (const row of rows) {
      // Example columns: Branch, Semester, Course Code, Course Name, L/T/P, Main Faculty, Co-Faculty
      const deptName = row['Branch'];
      const semester = row['Semester'];
      if (!deptName || !semester) {
        console.warn('Skipping row due to missing department or semester:', row);
        continue;
      }
      const code = row['Course Code'];
      const name = row['Course Name'];
      const weeklyHours = row['L/T/P'] ? parseInt(row['L/T/P'].split('/')[0] || '0', 10) : 0;

      // Subject
      let subject = null;
      if (code && name) {
        subject = await Subject.findOneAndUpdate(
          { code },
          { name, code, weeklyHours },
          { upsert: true, new: true }
        );
        subjectMap[code] = subject;
      } else {
        console.warn('Skipping row due to missing subject code or name:', row);
      }

      // Department (by name+semester)
      const deptKey = `${deptName}_${semester}`;
      let department = await Department.findOneAndUpdate(
        { name: deptName, semester },
        { name: deptName, semester },
        { upsert: true, new: true }
      );
      departmentMap[deptKey] = department;
      // Add subject to department if not already present
      if (subject && department && subject._id && department.subjects && !department.subjects.includes(subject._id)) {
        department.subjects.push(subject._id);
        await department.save();
      }
    }

    // Second pass: create/update teachers and assign subjects
    for (const row of rows) {
      const deptName = row['Branch'];
      const semester = row['Semester'];
      const code = row['Course Code'];
      const mainFaculty = row['Main Faculty'];
      const coFaculty = row['Co-Faculty'];
      const deptKey = `${deptName}_${semester}`;
      let department = departmentMap[deptKey];
      // PATCH: If department is not found, create it on the fly
      if (!department) {
        department = await Department.findOneAndUpdate(
          { name: deptName, semester },
          { name: deptName, semester },
          { upsert: true, new: true }
        );
        departmentMap[deptKey] = department;
      }
      const subject = subjectMap[code];

      // Main Faculty
      if (mainFaculty && mainFaculty !== 'N.R.' && subject && subject._id && department && department.subjects) {
        let teacher = await Teacher.findOneAndUpdate(
          { fullName: mainFaculty },
          { fullName: mainFaculty, department: deptName },
          { upsert: true, new: true }
        );
        teacherMap[mainFaculty] = teacher;
        // Assign subject to teacher (loadAssigned)
        if (!teacher.loadAssigned.includes(subject._id.toString())) {
          teacher.loadAssigned.push(subject._id);
          await teacher.save();
        }
      }
      // Co-Faculty
      if (coFaculty && coFaculty !== 'N.R.' && coFaculty !== mainFaculty && subject && subject._id && department && department.subjects) {
        let teacher = await Teacher.findOneAndUpdate(
          { fullName: coFaculty },
          { fullName: coFaculty, department: deptName },
          { upsert: true, new: true }
        );
        teacherMap[coFaculty] = teacher;
        if (!teacher.loadAssigned.includes(subject._id.toString())) {
          teacher.loadAssigned.push(subject._id);
          await teacher.save();
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    res.json({ message: 'Excel data imported successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import Excel data', details: err.message });
  }
};

// POST /departments/generate-timetable
exports.generateTimetableFromDb = async (req, res) => {
  try {
    // 1. Collect all data
    const departments = await Department.find({}).populate('subjects');
    const subjects = await Subject.find({});
    const teachers = await Teacher.find({});

    // 2. Build rows for Excel (Branch, Semester, Course Code, Course Name, L/T/P, Main Faculty, Co-Faculty)
    const rows = [];
    for (const dept of departments) {
      for (const subject of dept.subjects) {
        // Find all teachers who teach this subject in this department
        const assignedTeachers = teachers.filter(t => t.department === dept.name && t.loadAssigned.map(String).includes(String(subject._id)));
        // For now, assign the first teacher as Main Faculty, second as Co-Faculty (if any)
        const mainFaculty = assignedTeachers[0]?.fullName || '';
        const coFaculty = assignedTeachers[1]?.fullName || '';
        rows.push({
          'Branch': dept.name,
          'Semester': dept.semester,
          'Course Code': subject.code,
          'Course Name': subject.name,
          'L/T/P': `${subject.weeklyHours}/0/0`,
          'Main Faculty': mainFaculty,
          'Co-Faculty': coFaculty
        });
      }
    }

    // 3. Write to Excel file
    const xlsx = require('xlsx');
    const outputDir = path.join(__dirname, '../uploads/');
    const outputPath = path.join(outputDir, 'timetable_input.xlsx');
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, outputPath);

    // 4. Call Python script with better error handling
    const pyPath = path.join(__dirname, '../excel_timetable_generator.py');
    
    return new Promise((resolve, reject) => {
      const py = spawn('python', [pyPath, outputPath]);
      let pyOutput = '';
      let pyError = '';
      
      py.stdout.on('data', data => { 
        pyOutput += data.toString(); 
        console.log('Python stdout:', data.toString());
      });
      
      py.stderr.on('data', data => { 
        pyError += data.toString(); 
        console.error('Python stderr:', data.toString());
      });
      
      py.on('close', code => {
        console.log(`Python process exited with code ${code}`);
        
        if (code !== 0) {
          console.error('Python script failed:', pyError);
          return res.status(500).json({ 
            error: 'Timetable generation failed', 
            details: pyError || 'Unknown error occurred',
            output: pyOutput 
          });
        }
        
        // Try to parse the output for stats
        try {
          // Look for the stats in the output
          const statsMatch = pyOutput.match(/Returned stats: ({.*})/);
          let stats = null;
          if (statsMatch) {
            stats = JSON.parse(statsMatch[1]);
          }
          
          res.json({ 
            message: 'Timetable generated successfully!', 
            output: pyOutput,
            stats: stats,
            downloadLinks: {
              faculty: '/api/departments/download/faculty_timetable.csv',
              class: '/api/departments/download/class_timetable.csv',
              summary: '/api/departments/download/department_summary.csv'
            }
          });
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError);
          res.json({ 
            message: 'Timetable generated successfully!', 
            output: pyOutput,
            downloadLinks: {
              faculty: '/api/departments/download/faculty_timetable.csv',
              class: '/api/departments/download/class_timetable.csv',
              summary: '/api/departments/download/department_summary.csv'
            }
          });
        }
      });
      
      py.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        res.status(500).json({ 
          error: 'Failed to start timetable generation process', 
          details: error.message 
        });
      });
    });
    
      } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate timetable', details: err.message });
    }
  };

// POST /departments/generate-from-excel
exports.generateTimetableFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Processing Excel file:', filePath);

    // Call Python script directly with the uploaded file
    const pyPath = path.join(__dirname, '../excel_timetable_generator.py');
    
    return new Promise((resolve, reject) => {
      const py = spawn('python', [pyPath, filePath]);
      let pyOutput = '';
      let pyError = '';
      
      py.stdout.on('data', data => { 
        pyOutput += data.toString(); 
        console.log('Python stdout:', data.toString());
      });
      
      py.stderr.on('data', data => { 
        pyError += data.toString(); 
        console.error('Python stderr:', data.toString());
      });
      
      py.on('close', code => {
        console.log(`Python process exited with code ${code}`);
        
        // Clean up uploaded file
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        
        if (code !== 0) {
          console.error('Python script failed:', pyError);
          return res.status(500).json({ 
            error: 'Timetable generation failed', 
            details: pyError || 'Unknown error occurred',
            output: pyOutput 
          });
        }
        
        // Try to parse the output for stats
        try {
          // Look for the stats in the output
          const statsMatch = pyOutput.match(/Returned stats: ({.*})/);
          let stats = null;
          if (statsMatch) {
            stats = JSON.parse(statsMatch[1]);
          }
          
          res.json({ 
            message: 'Timetable generated successfully from Excel!', 
            output: pyOutput,
            stats: stats,
            downloadLinks: {
              faculty: '/api/departments/download/faculty_timetable.csv',
              class: '/api/departments/download/class_timetable.csv',
              summary: '/api/departments/download/department_summary.csv'
            }
          });
        } catch (parseError) {
          console.error('Error parsing Python output:', parseError);
          res.json({ 
            message: 'Timetable generated successfully from Excel!', 
            output: pyOutput,
            downloadLinks: {
              faculty: '/api/departments/download/faculty_timetable.csv',
              class: '/api/departments/download/class_timetable.csv',
              summary: '/api/departments/download/department_summary.csv'
            }
          });
        }
      });
      
      py.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        // Clean up uploaded file
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        res.status(500).json({ 
          error: 'Failed to start timetable generation process', 
          details: error.message 
        });
      });
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file', details: err.message });
  }
};

// GET /departments/download-template
exports.downloadTemplate = async (req, res) => {
  try {
    // Sample data for the template
    const sampleData = [
      {
        'Branch': 'CSE',
        'Semester': 5,
        'Course Code': 'CS501',
        'Course Name': 'Data Structures',
        'L/T/P': '3/1/2',
        'Main Faculty': 'Dr. John Smith',
        'Co-Faculty': 'Dr. Jane Doe'
      },
      {
        'Branch': 'CSE',
        'Semester': 5,
        'Course Code': 'CS502',
        'Course Name': 'Database Management',
        'L/T/P': '3/0/2',
        'Main Faculty': 'Dr. Jane Doe',
        'Co-Faculty': ''
      },
      {
        'Branch': 'ECE',
        'Semester': 3,
        'Course Code': 'EC301',
        'Course Name': 'Digital Electronics',
        'L/T/P': '2/1/2',
        'Main Faculty': 'Dr. Mike Johnson',
        'Co-Faculty': 'Dr. Sarah Wilson'
      },
      {
        'Branch': 'ECE',
        'Semester': 3,
        'Course Code': 'EC302',
        'Course Name': 'Signals and Systems',
        'L/T/P': '3/1/0',
        'Main Faculty': 'Dr. Sarah Wilson',
        'Co-Faculty': ''
      },
      {
        'Branch': 'ME',
        'Semester': 4,
        'Course Code': 'ME401',
        'Course Name': 'Thermodynamics',
        'L/T/P': '3/0/2',
        'Main Faculty': 'Dr. Robert Brown',
        'Co-Faculty': ''
      },
      {
        'Branch': 'ME',
        'Semester': 4,
        'Course Code': 'ME402',
        'Course Name': 'Mechanics of Materials',
        'L/T/P': '2/1/2',
        'Main Faculty': 'Dr. Robert Brown',
        'Co-Faculty': 'Dr. Lisa Davis'
      }
    ];

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sampleData);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, 'Timetable Data');

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="timetable_template.xlsx"');

    // Write to buffer and send
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (err) {
    console.error('Error generating template:', err);
    res.status(500).json({ error: 'Failed to generate template', details: err.message });
  }
}; 