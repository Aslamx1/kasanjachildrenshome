const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Get dashboard overview
router.get('/overview', verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [[childrenStats], [donationStats], [staffStats], [volunteersStats]] = await Promise.all([
      conn.query("SELECT COUNT(*) AS count FROM children WHERE status = 'Active'"),
      conn.query("SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE status = 'Received'"),
      conn.query("SELECT COUNT(*) AS count FROM users WHERE role IN ('staff', 'manager', 'coordinator') AND status = 'active'"),
      conn.query("SELECT COUNT(*) AS count FROM volunteers WHERE status = 'Active'")
    ]);

    res.json({
      children_enrolled: Number(childrenStats[0].count),
      total_donations: Number(donationStats[0].total),
      active_staff: Number(staffStats[0].count),
      volunteers: Number(volunteersStats[0].count),
      last_updated: new Date()
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Failed to load dashboard overview.' });
  } finally {
    if (conn) conn.release();
  }
});

// Get activity stream
router.get('/activity', verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [activities] = await conn.query(`
      SELECT 
        'Donation' as type, 
        CONCAT(COALESCE(donor_name, 'Anonymous'), ' donated UGX ', FORMAT(amount, 0)) as action,
        donation_date as timestamp
      FROM donations
      UNION ALL
      SELECT 
        'Child', 
        CONCAT('Registered ', name),
        created_at
      FROM children
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    res.json(activities);
  } catch (error) {
    console.error('Activity stream error:', error);
    res.status(500).json({ message: 'Failed to load activity.' });
  } finally {
    if (conn) conn.release();
  }
});

// Get user registrations (all users who have created accounts)
router.get('/user-registrations', verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    const [users] = await conn.query(`
      SELECT 
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json({
      total_users: users.length,
      users: users
    });
  } catch (error) {
    console.error('User registrations error:', error);
    res.status(500).json({ message: 'Failed to load user registrations.' });
  } finally {
    if (conn) conn.release();
  }
});

// Get recently registered users (last 7 days)
router.get('/user-registrations/recent', verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    const [users] = await conn.query(`
      SELECT 
        id,
        name,
        email,
        role,
        created_at
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
    `);
    
    res.json({
      recently_registered: users.length,
      users: users
    });
  } catch (error) {
    console.error('Recent user registrations error:', error);
    res.status(500).json({ message: 'Failed to load recent registrations.' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
