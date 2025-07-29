const Teacher = require('../models/Teacher');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      // If email query parameter is provided, filter by email
      const teacher = await Teacher.findOne({ email }).populate('department', 'name').populate('subjects', 'name code');
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      return res.json([teacher]); // Return as array for consistency
    }
    
    // Otherwise return all teachers
    const teachers = await Teacher.find().populate('department', 'name').populate('subjects', 'name code');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new teacher
exports.addTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, department, subjects, loadAssigned, weeklyHours, classAssigned, userId } = req.body;
    if (!fullName || !email || !department) {
      return res.status(400).json({ error: 'Full name, email, and department are required' });
    }
    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Teacher email already exists' });
    const teacher = new Teacher({ fullName, email, phone, department, subjects, loadAssigned, weeklyHours, classAssigned, userId });
    await teacher.save();
    const populatedTeacher = await Teacher.findById(teacher._id).populate('department', 'name').populate('subjects', 'name code');
    res.status(201).json(populatedTeacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, department, subjects, loadAssigned, weeklyHours, classAssigned, dailyTasks } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { fullName, email, phone, department, subjects, loadAssigned, weeklyHours, classAssigned, dailyTasks },
      { new: true, runValidators: true }
    ).populate('department', 'name').populate('subjects', 'name code');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update only daily tasks
exports.updateDailyTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyTasks } = req.body;
    if (!dailyTasks) return res.status(400).json({ error: 'dailyTasks is required' });
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { dailyTasks },
      { new: true, runValidators: true }
    ).populate('department', 'name');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get teacher by user ID
exports.getTeacherByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const teacher = await Teacher.findOne({ userId }).populate('department', 'name');
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 