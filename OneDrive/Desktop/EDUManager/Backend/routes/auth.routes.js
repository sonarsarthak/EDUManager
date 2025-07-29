const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
// Optional: check if loginId/email is available
router.get('/check', async (req, res) => {
  const { email, loginId } = req.query;
  if (email) {
    const exists = await User.findOne({ email });
    return res.json({ available: !exists });
  }
  if (loginId) {
    const exists = await User.findOne({ loginId });
    return res.json({ available: !exists });
  }
  res.status(400).json({ error: 'No email or loginId provided' });
});

module.exports = router;
