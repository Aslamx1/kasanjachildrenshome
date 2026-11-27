const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const conn = await pool.getConnection();
    const [users] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register (admin only)
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create users' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO users (email, password_hash, name, role, phone) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, name, role || 'staff', phone || null]
    );
    conn.release();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUBLIC SIGNUP - Anyone can create an account
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, joinAs } = req.body;
    
    // Use firstName + lastName if provided, otherwise use name
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and name required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const userRole = joinAs || 'donor';
    if (!['donor', 'volunteer'].includes(userRole)) {
      return res.status(400).json({ message: 'Choose a supported account type.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    
    try {
      const [result] = await conn.query(
        'INSERT INTO users (email, password_hash, name, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [email, passwordHash, fullName, userRole, 'active']
      );
      
      conn.release();

      // Create JWT token for auto-login
      const token = jwt.sign(
        { id: result.insertId, email, role: userRole, name: fullName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: { id: result.insertId, email, role: userRole, name: fullName }
      });
    } catch (dbError) {
      conn.release();
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Logout (frontend just deletes token)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
