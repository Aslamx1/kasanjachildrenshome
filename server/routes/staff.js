const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken, checkRole(['admin']));

// GET all staff members
router.get('/', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [staff] = await connection.query(
      'SELECT id, email, name, role, phone, status, created_at FROM users WHERE role IN ("staff", "manager", "coordinator") ORDER BY created_at DESC'
    );
    connection.release();
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST add new staff member
router.post('/', async (req, res) => {
  const { name, email, role, phone } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await db.getConnection();
    
    // Check if email already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Generate random secure password
    const tempPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, name, role, phone, status, created_at) VALUES (?, ?, ?, ?, ?, "active", NOW())',
      [email, hashedPassword, name, role, phone || null]
    );

    connection.release();
    
    res.json({
      id: result.insertId,
      email,
      name,
      role,
      phone,
      status: 'active',
      tempPassword, // Return temporary password to display to admin
      message: 'Staff member created successfully'
    });
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// PUT update staff member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, status } = req.body;

  try {
    const connection = await db.getConnection();
    
    let query = 'UPDATE users SET ';
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    query += updates.join(', ') + ' WHERE id = ? AND role IN ("staff", "manager", "coordinator")';
    params.push(id);

    const [result] = await connection.query(query, params);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// DELETE staff member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    
    const [result] = await connection.query(
      'DELETE FROM users WHERE id = ? AND role IN ("staff", "manager", "coordinator")',
      [id]
    );
    
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// Reset staff password
router.post('/:id/reset-password', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    
    const tempPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await connection.query(
      'UPDATE users SET password_hash = ? WHERE id = ? AND role IN ("staff", "manager", "coordinator")',
      [hashedPassword, id]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      message: 'Password reset successfully',
      tempPassword
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Helper function to generate secure random password
function generateSecurePassword() {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

module.exports = router;
