const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const XLSX = require('xlsx');
const path = require('path');

// Get teacher's timetable by user ID or teacher ID
exports.getTeacherTimetable = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Try to find the teacher by user ID first, then by teacher ID
    let teacher = await Teacher.findOne({ userId }).populate('department', 'name');
    
    if (!teacher) {
      // If not found by userId, try to find by teacher ID directly
      teacher = await Teacher.findById(userId).populate('department', 'name');
    }
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get teacher's daily tasks from the teacher model
    const dailyTasks = teacher.dailyTasks || {};
    
    // Convert daily tasks to timetable format
    const timetable = [];
    Object.keys(dailyTasks).forEach(day => {
      const dayTasks = dailyTasks[day];
      if (Array.isArray(dayTasks)) {
        dayTasks.forEach(task => {
          timetable.push({
            day: day,
            time: task.time || 'TBD',
            subject: task.subject || 'TBD',
            class: task.class || 'TBD',
            period: task.period || 'TBD'
          });
        });
      }
    });

    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all timetables (for admin)
exports.getAllTimetables = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('department', 'name');
    const timetables = teachers.map(teacher => ({
      teacherId: teacher._id,
      teacherName: teacher.fullName,
      department: teacher.department?.name,
      dailyTasks: teacher.dailyTasks || {}
    }));
    
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate comprehensive timetable with faculty names
exports.generateComprehensiveTimetable = async (req, res) => {
  try {
    // Get all teachers with their assigned subjects and classes
    const teachers = await Teacher.find()
      .populate('department', 'name')
      .populate('subjects', 'name code');

    // Get all subjects
    const subjects = await Subject.find();

    console.log(`Found ${teachers.length} teachers and ${subjects.length} subjects`);

    // Create a comprehensive timetable structure
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

    // Initialize timetable matrix
    const timetable = {};
    days.forEach(day => {
      timetable[day] = {};
      periods.forEach(period => {
        timetable[day][period] = '';
      });
    });

    // Process each teacher's assignments
    teachers.forEach(teacher => {
      console.log(`Processing teacher: ${teacher.fullName} (ID: ${teacher._id})`);
      if (teacher.dailyTasks) {
        console.log('  dailyTasks:', JSON.stringify(teacher.dailyTasks));
        Object.keys(teacher.dailyTasks).forEach(day => {
          const dayTasks = teacher.dailyTasks[day];
          if (Array.isArray(dayTasks)) {
            dayTasks.forEach(task => {
              console.log(`    Task: period=${task.period}, subject=${task.subject}, class=${task.class}`);
              const period = task.period || 'P1';
              const subjectId = task.subject;
              const className = task.class || '';
              
              // Find subject details
              const subject = subjects.find(s => s._id.toString() === subjectId);
              if (subject) {
                const courseInfo = `${subject.code}:${subject.name} (${className})`;
                const facultyInfo = teacher.fullName;
                
                // Format: CourseInfo - FacultyName
                const cellContent = `${courseInfo} - ${facultyInfo}`;
                
                // Only assign if slot is empty or add to existing content
                if (!timetable[day][period]) {
                  timetable[day][period] = cellContent;
                } else {
                  timetable[day][period] += `\n${cellContent}`;
                }
              } else {
                console.log(`      Subject not found for ID: ${subjectId}`);
                // If subject not found, still include teacher info
                const cellContent = `Subject ID: ${subjectId} (${className}) - ${teacher.fullName}`;
                if (!timetable[day][period]) {
                  timetable[day][period] = cellContent;
                } else {
                  timetable[day][period] += `\n${cellContent}`;
                }
              }
            });
          }
        });
      } else {
        console.log('  No dailyTasks for this teacher.');
      }
    });

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = [];
    
    // Add header row
    const headerRow = ['Day', ...periods];
    excelData.push(headerRow);
    
    // Add data rows
    days.forEach(day => {
      const row = [day];
      periods.forEach(period => {
        row.push(timetable[day][period] || '');
      });
      excelData.push(row);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 10 }, // Day column
      { wch: 50 }, // P1
      { wch: 50 }, // P2
      { wch: 50 }, // P3
      { wch: 50 }, // P4
      { wch: 50 }, // P5
      { wch: 50 }  // P6
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `comprehensive_timetable_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, '../generated_timetables', filename);

    // Write file
    XLSX.writeFile(workbook, filepath);

    // Create download link
    const downloadUrl = `/api/timetable/download/${filename}`;

    res.json({
      success: true,
      message: 'Comprehensive timetable generated successfully',
      filename: filename,
      downloadUrl: downloadUrl,
      timetable: timetable,
      stats: {
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        days: days.length,
        periods: periods.length
      }
    });

  } catch (err) {
    console.error('Error generating comprehensive timetable:', err);
    res.status(500).json({ error: err.message });
  }
};

// Download generated timetable file
exports.downloadTimetable = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../generated_timetables', filename);
    
    res.download(filepath, filename, (err) => {
      if (err) {
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 