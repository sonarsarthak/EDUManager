const Teacher = require('../models/Teacher');

// Get teacher's tasks by user ID or teacher ID
exports.getTeacherTasks = async (req, res) => {
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

    // Get today's date
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get today's tasks from dailyTasks
    const dailyTasks = teacher.dailyTasks || {};
    const todayTasks = dailyTasks[today] || [];
    
    // Convert to task format
    const tasks = todayTasks.map(task => ({
      title: `${task.subject} - ${task.class}`,
      description: `Period: ${task.period}`,
      time: task.time || 'TBD'
    }));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teacher tasks (for admin)
exports.getAllTeacherTasks = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('department', 'name');
    const allTasks = teachers.map(teacher => ({
      teacherId: teacher._id,
      teacherName: teacher.fullName,
      department: teacher.department?.name,
      dailyTasks: teacher.dailyTasks || {}
    }));
    
    res.json(allTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 