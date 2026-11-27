const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all children (staff and above can view)
router.get('/', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [children] = await conn.query('SELECT * FROM children ORDER BY name');
    conn.release();
    res.json(children);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single child
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [children] = await conn.query('SELECT * FROM children WHERE id = ?', [req.params.id]);
    conn.release();

    if (children.length === 0) {
      return res.status(404).json({ message: 'Child not found' });
    }

    res.json(children[0]);
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create child (admin and staff)
router.post('/', verifyToken, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, age, gender, status, sponsor_id, bio, medical_info } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ message: 'Name, age, and gender required' });
    }

    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO children (name, age, gender, status, sponsor_id, bio, medical_info, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, age, gender, status || 'Active', sponsor_id || null, bio || '', medical_info || '']
    );
    conn.release();

    res.status(201).json({ message: 'Child created', id: result[0].insertId });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update child (admin and staff)
router.put('/:id', verifyToken, checkRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, age, gender, status, sponsor_id, bio, medical_info } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE children SET name = ?, age = ?, gender = ?, status = ?, sponsor_id = ?, bio = ?, medical_info = ?, updated_at = NOW() WHERE id = ?',
      [name, age, gender, status, sponsor_id, bio, medical_info, req.params.id]
    );
    conn.release();

    res.json({ message: 'Child updated' });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete child (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM children WHERE id = ?', [req.params.id]);
    conn.release();

    res.json({ message: 'Child deleted' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
