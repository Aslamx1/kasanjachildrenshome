const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all donations
router.get('/', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [donations] = await conn.query(
      'SELECT * FROM donations ORDER BY donation_date DESC'
    );
    conn.release();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get donation stats
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [stats] = await conn.query(`
      SELECT 
        COUNT(*) as total_donations,
        SUM(amount) as total_raised,
        AVG(amount) as avg_donation,
        MAX(amount) as largest_donation
      FROM donations WHERE status = 'Received'
    `);
    conn.release();
    res.json(stats[0] || { total_donations: 0, total_raised: 0, avg_donation: 0, largest_donation: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create donation (anyone can submit, admin/staff records)
router.post('/', async (req, res) => {
  try {
    const { donor_name, donor_email, amount, method, status, notes, donation_date } = req.body;

    if (!donor_name || !amount) {
      return res.status(400).json({ message: 'Donor name and amount required' });
    }

    const conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO donations (donor_name, donor_email, amount, method, status, notes, donation_date) VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))',
      [donor_name, donor_email || null, amount, method || 'bank_transfer', status || 'Pending', notes || '', donation_date || null]
    );
    conn.release();

    res.status(201).json({ message: 'Donation recorded', id: result[0].insertId });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update donation (admin only)
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { donor_name, donor_email, amount, method, status, notes, donation_date } = req.body;

    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE donations SET donor_name = ?, donor_email = ?, amount = ?, method = ?, status = ?, notes = ?, donation_date = COALESCE(?, donation_date), updated_at = NOW() WHERE id = ?',
      [donor_name, donor_email || null, amount, method, status, notes || '', donation_date || null, req.params.id]
    );
    conn.release();

    res.json({ message: 'Donation updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete donation (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM donations WHERE id = ?', [req.params.id]);
    conn.release();

    res.json({ message: 'Donation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
