const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// GET all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new subject
router.post("/", async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update subject
router.put("/:id", async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE subject
router.delete("/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects/upload-timetable
router.post('/upload-timetable', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const pythonProcess = spawn('D:\\Projects\\Load management\\.venv\\Scripts\\python.exe', [
      path.join(__dirname, '../excel_timetable_generator.py'),
      req.file.path
    ]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Python script error', details: errorOutput });
      }
      
      // Try to extract JSON from output
      let stats = null;
      try {
        const match = output.match(/Returned stats: ({.*})/s);
        if (match) {
          // Replace single quotes with double quotes for valid JSON
          const jsonStr = match[1].replace(/'/g, '"');
          stats = JSON.parse(jsonStr);
        } else {
          return res.status(500).json({ error: 'Failed to parse stats from Python output', details: output });
        }
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse stats', details: output, parseError: e.message });
      }
      
      res.json({ status: 'success', stats });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/subjects/download-template
router.get('/download-template', (req, res) => {
  const templatePath = path.join(__dirname, '../sample_timetable_template.xlsx');
  res.download(templatePath, 'timetable_template.xlsx', (err) => {
    if (err) {
      res.status(404).json({ error: 'Template file not found' });
    }
  });
});

module.exports = router; 