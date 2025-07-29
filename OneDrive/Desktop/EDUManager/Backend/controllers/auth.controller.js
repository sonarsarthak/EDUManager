const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, loginId, password, role } = req.body;
    if (!name || !email || !loginId || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ error: 'Email already exists' });
    const existingLogin = await User.findOne({ loginId });
    if (existingLogin) return res.status(409).json({ error: 'Login ID already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, loginId, password: hashed, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginId, email, password } = req.body;
    if ((!loginId && !email) || !password) {
      return res.status(400).json({ error: 'Login ID or email and password are required' });
    }
    const user = await User.findOne(loginId ? { loginId } : { email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
