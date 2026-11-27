const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Migrate data from localStorage
router.post('/from-localstorage', verifyToken, async (req, res) => {
  try {
    // Only admins can migrate data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can migrate data' });
    }

    const { users, children, donations, staff } = req.body;
    const conn = await pool.getConnection();
    
    let usersMigrated = 0;
    let childrenMigrated = 0;
    let donationsMigrated = 0;
    let staffMigrated = 0;

    // Migrate users
    if (users && Array.isArray(users)) {
      for (const user of users) {
        try {
          // Hash password if plain text
          let passwordHash = user.password_hash;
          if (user.password && !user.password_hash) {
            passwordHash = await bcrypt.hash(user.password, 10);
          }

          const [result] = await conn.query(
            `INSERT INTO users (email, password_hash, name, role, phone, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
             name=VALUES(name), role=VALUES(role), status=VALUES(status), phone=VALUES(phone)`,
            [
              user.email,
              passwordHash || 'placeholder_hash',
              user.name || 'Migrated User',
              user.role || 'donor',
              user.phone || null,
              'active'
            ]
          );
          
          if (result.affectedRows > 0) usersMigrated++;
        } catch (e) {
          console.error(`Error migrating user ${user.email}:`, e.message);
        }
      }
    }

    // Migrate children
    if (children && Array.isArray(children)) {
      for (const child of children) {
        try {
          const [result] = await conn.query(
            `INSERT INTO children (name, age, status, date_of_birth, created_at) 
             VALUES (?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
             name=VALUES(name), age=VALUES(age), status=VALUES(status)`,
            [
              child.name || 'Unknown',
              child.age || 0,
              child.status || 'active',
              child.date_of_birth || null
            ]
          );
          
          if (result.affectedRows > 0) childrenMigrated++;
        } catch (e) {
          console.error(`Error migrating child ${child.name}:`, e.message);
        }
      }
    }

    // Migrate donations
    if (donations && Array.isArray(donations)) {
      for (const donation of donations) {
        try {
          const [result] = await conn.query(
            `INSERT INTO donations (donor_name, amount, currency, donation_type, status, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              donation.donor_name || 'Anonymous',
              donation.amount || 0,
              donation.currency || 'UGX',
              donation.donation_type || 'one-time',
              'completed'
            ]
          );
          
          if (result.affectedRows > 0) donationsMigrated++;
        } catch (e) {
          console.error(`Error migrating donation:`, e.message);
        }
      }
    }

    // Migrate staff
    if (staff && Array.isArray(staff)) {
      for (const member of staff) {
        try {
          const [result] = await conn.query(
            `INSERT INTO users (email, password_hash, name, role, phone, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
             name=VALUES(name), phone=VALUES(phone), status=VALUES(status)`,
            [
              member.email || `staff_${Date.now()}@kch.org`,
              'placeholder_hash',
              member.name || 'Staff Member',
              'staff',
              member.phone || null,
              'active'
            ]
          );
          
          if (result.affectedRows > 0) staffMigrated++;
        } catch (e) {
          console.error(`Error migrating staff ${member.name}:`, e.message);
        }
      }
    }

    conn.release();

    res.json({
      message: 'Migration completed',
      usersMigrated,
      childrenMigrated,
      donationsMigrated,
      staffMigrated,
      totalMigrated: usersMigrated + childrenMigrated + donationsMigrated + staffMigrated
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
});

module.exports = router;
