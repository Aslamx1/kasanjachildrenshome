const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ===== NAMECHEAP SERVICES MANAGEMENT =====

// Get all services
router.get('/services', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [services] = await conn.query(`
      SELECT 
        id,
        service_type,
        service_name,
        domain_name,
        purchase_date,
        expiry_date,
        renewal_date,
        status,
        auto_renew,
        price,
        renewal_price,
        notes,
        created_at
      FROM namecheap_services
      ORDER BY expiry_date ASC
    `);
    
    conn.release();
    
    res.json({
      success: true,
      services: services,
      total: services.length
    });
  } catch (error) {
    console.error('Services list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get service by ID
router.get('/services/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    const [service] = await conn.query(
      'SELECT * FROM namecheap_services WHERE id = ?',
      [id]
    );
    
    conn.release();
    
    if (service.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({
      success: true,
      service: service[0]
    });
  } catch (error) {
    console.error('Service get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new service
router.post('/services', verifyToken, async (req, res) => {
  try {
    const {
      service_type,
      service_name,
      domain_name,
      purchase_date,
      expiry_date,
      renewal_date,
      auto_renew,
      price,
      renewal_price,
      notes
    } = req.body;

    if (!service_type || !service_name || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'service_type, service_name, and expiry_date are required'
      });
    }

    const conn = await pool.getConnection();
    
    const [result] = await conn.query(
      `INSERT INTO namecheap_services 
       (service_type, service_name, domain_name, purchase_date, expiry_date, renewal_date, status, auto_renew, price, renewal_price, notes, last_synced)
       VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, NOW())`,
      [service_type, service_name, domain_name, purchase_date, expiry_date, renewal_date, auto_renew !== false ? 1 : 0, price, renewal_price, notes]
    );
    
    conn.release();
    
    res.json({
      success: true,
      message: 'Service added successfully',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Service add error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update service
router.put('/services/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conn = await pool.getConnection();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updates);
    values.push(id);

    await conn.query(
      `UPDATE namecheap_services SET ${fields}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    conn.release();
    
    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Service update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete service
router.delete('/services/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    await conn.query('DELETE FROM namecheap_services WHERE id = ?', [id]);
    
    conn.release();
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Service delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== RENEWAL MANAGEMENT =====

// Get renewal reminders
router.get('/renewals', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [renewals] = await conn.query(`
      SELECT 
        id,
        service_id,
        service_type,
        service_name,
        current_expiry,
        next_renewal,
        days_until_renewal,
        reminder_sent,
        renewal_status,
        notes
      FROM namecheap_renewals
      WHERE renewal_status = 'Pending'
      ORDER BY days_until_renewal ASC
    `);
    
    conn.release();
    
    res.json({
      success: true,
      renewals: renewals,
      urgent: renewals.filter(r => r.days_until_renewal <= 30).length
    });
  } catch (error) {
    console.error('Renewals list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get upcoming renewals (next 90 days)
router.get('/renewals/upcoming', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [upcomingRenewals] = await conn.query(`
      SELECT 
        s.id,
        s.service_type,
        s.service_name,
        s.domain_name,
        s.expiry_date,
        s.renewal_date,
        DATEDIFF(s.renewal_date, CURDATE()) as days_until_renewal,
        CASE 
          WHEN DATEDIFF(s.renewal_date, CURDATE()) <= 0 THEN 'Overdue'
          WHEN DATEDIFF(s.renewal_date, CURDATE()) <= 14 THEN 'Critical'
          WHEN DATEDIFF(s.renewal_date, CURDATE()) <= 30 THEN 'Urgent'
          ELSE 'Normal'
        END as priority,
        s.auto_renew,
        s.price,
        s.renewal_price
      FROM namecheap_services s
      WHERE s.renewal_date IS NOT NULL 
      AND s.renewal_date > CURDATE()
      AND s.renewal_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
      ORDER BY s.renewal_date ASC
    `);
    
    conn.release();
    
    const stats = {
      total_upcoming: upcomingRenewals.length,
      overdue: upcomingRenewals.filter(r => r.priority === 'Overdue').length,
      critical: upcomingRenewals.filter(r => r.priority === 'Critical').length,
      urgent: upcomingRenewals.filter(r => r.priority === 'Urgent').length,
      normal: upcomingRenewals.filter(r => r.priority === 'Normal').length,
      total_renewal_cost: upcomingRenewals.reduce((sum, r) => sum + (r.renewal_price || r.price || 0), 0)
    };
    
    res.json({
      success: true,
      renewals: upcomingRenewals,
      stats: stats
    });
  } catch (error) {
    console.error('Upcoming renewals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark renewal reminder as sent
router.put('/renewals/:id/mark-sent', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    await conn.query(
      'UPDATE namecheap_renewals SET reminder_sent = TRUE, updated_at = NOW() WHERE id = ?',
      [id]
    );
    
    conn.release();
    
    res.json({
      success: true,
      message: 'Renewal marked as sent'
    });
  } catch (error) {
    console.error('Mark renewal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync services status with Namecheap API
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const namecheap = require('../config/namecheap');
    const conn = await pool.getConnection();
    
    const [services] = await conn.query(
      'SELECT id, domain_name FROM namecheap_services WHERE domain_name IS NOT NULL'
    );
    
    let syncedCount = 0;
    for (const service of services) {
      try {
        const domainInfo = await namecheap.listDomains();
        if (domainInfo.success) {
          syncedCount++;
          await conn.query(
            'UPDATE namecheap_services SET last_synced = NOW() WHERE id = ?',
            [service.id]
          );
        }
      } catch (err) {
        console.error(`Error syncing service ${service.id}:`, err);
      }
    }
    
    conn.release();
    
    res.json({
      success: true,
      message: `Synced ${syncedCount} services with Namecheap`,
      synced_count: syncedCount
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard overview stats
router.get('/overview/stats', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [stats] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM namecheap_services WHERE status = 'Active') as active_services,
        (SELECT COUNT(*) FROM namecheap_services WHERE status = 'Expiring Soon') as expiring_soon,
        (SELECT COUNT(*) FROM namecheap_services WHERE status = 'Expired') as expired,
        (SELECT SUM(renewal_price) FROM namecheap_services WHERE status = 'Active') as total_renewal_cost,
        (SELECT COUNT(*) FROM namecheap_renewals WHERE days_until_renewal <= 30 AND renewal_status = 'Pending') as urgent_renewals,
        (SELECT COUNT(*) FROM namecheap_services WHERE service_type = 'Domain') as total_domains,
        (SELECT COUNT(*) FROM namecheap_services WHERE service_type = 'SSL') as total_ssl,
        (SELECT COUNT(*) FROM namecheap_services WHERE service_type = 'Hosting') as total_hosting,
        (SELECT MIN(expiry_date) FROM namecheap_services) as first_expiry_date,
        (SELECT MAX(expiry_date) FROM namecheap_services) as last_expiry_date
    `);
    
    conn.release();
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
