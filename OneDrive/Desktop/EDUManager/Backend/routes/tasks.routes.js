const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const auth = require('../middleware/auth');

// Get teacher's tasks by user ID
router.get('/teacher/:userId', auth, tasksController.getTeacherTasks);

// Get all teacher tasks (admin only)
router.get('/', auth, tasksController.getAllTeacherTasks);

module.exports = router; 