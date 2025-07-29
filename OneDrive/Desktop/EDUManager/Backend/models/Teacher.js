const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  period: String,
  subject: String,
  class: String,
  time: String
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Add subjects field
  loadAssigned: { type: [String], default: [] },
  weeklyHours: { type: Number, default: 0 },
  classAssigned: { type: String, default: '' },
  dailyTasks: { type: Map, of: [taskSchema], default: {} },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema); 