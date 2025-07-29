const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetable.controller');
const auth = require('../middleware/auth');

// Get teacher's timetable by user ID
router.get('/teacher/:userId', auth, timetableController.getTeacherTimetable);

// Get all timetables (admin only)
router.get('/', auth, timetableController.getAllTimetables);

// Generate comprehensive timetable with faculty names
router.post('/generate-comprehensive', auth, timetableController.generateComprehensiveTimetable);

// Download generated timetable file (no auth required for download)
router.get('/download/:filename', timetableController.downloadTimetable);

module.exports = router; 