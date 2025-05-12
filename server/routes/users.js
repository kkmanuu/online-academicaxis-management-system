const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Debug middleware to log all requests
const logRequest = (req, res, next) => {
  console.log('User route - Request:', {
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
};

// Apply authentication middleware
router.use(auth);

// Get user by ID (accessible to teachers for student details)
router.get('/:id', logRequest, checkRole(['teacher', 'admin']), async (req, res) => {
  try {
    console.log('getUserById - Start:', { userId: req.params.id });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('name email profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`getUserById - Found user: ${id}`);
    res.json(user);
  } catch (error) {
    console.error('getUserById - Error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;