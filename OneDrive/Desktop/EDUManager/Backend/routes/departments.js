const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { handleExcelUpload, generateTimetableFromDb, generateTimetableFromExcel, downloadTemplate } = require('../controllers/departmentExcel.controller');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// GET all departments with populated subjects
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().populate('subjects');
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new department
router.post("/", async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    
    // Populate subjects before sending response
    await department.populate('subjects');
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update department
router.put("/:id", async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('subjects');
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE department
router.delete("/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all subjects (for dropdown in frontend)
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find().select('name code department semester');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download Excel template
router.get('/download-template', downloadTemplate);

// Download generated timetable files
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../generated_timetables', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// GET department by ID with populated subjects
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('subjects');
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Excel for department/subject/teacher data collection
router.post('/upload-excel', upload.single('file'), handleExcelUpload);

// Generate timetable from DB data
router.post('/generate-timetable', generateTimetableFromDb);

// Generate timetable directly from Excel upload
router.post('/generate-from-excel', upload.single('file'), generateTimetableFromExcel);

module.exports = router; 