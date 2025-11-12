const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Dummy user data — replace with DB lookup
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' },
];

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Find user
    const user = users.find(u => u.username === username);

    // Handle user not found
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(403).json({ error: 'Incorrect password. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'secret_key', // replace with env variable
      { expiresIn: '1h' }
    );

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });

  } catch (err) {
    console.error('Login Error:', err);
    // Generic catch-all for unexpected server errors
    res.status(500).json({ error: 'Unexpected server error occurred during login.' });
  }
});

module.exports = router;
