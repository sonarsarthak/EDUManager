const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/subjects', require('./routes/subjects.js'));
app.use('/api/departments', require('./routes/departments.js'));
app.use('/api/timetable', require('./routes/timetable.routes.js'));
app.use('/api/tasks', require('./routes/tasks.routes.js'));
// Add other routes as needed

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV
});

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/timetable_db';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ DB Error:', err));

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
