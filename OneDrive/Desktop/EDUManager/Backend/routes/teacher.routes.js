const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');

// Get all teachers
router.get('/', teacherController.getAllTeachers);

// Add new teacher
router.post('/', teacherController.addTeacher);

// Update teacher
router.put('/:id', teacherController.updateTeacher);

// Update only daily tasks
router.put('/:id/dailyTasks', teacherController.updateDailyTasks);

// Get teacher by user ID
router.get('/by-user/:userId', teacherController.getTeacherByUserId);

// Delete teacher
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router; 