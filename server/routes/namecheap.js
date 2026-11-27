const express = require('express');
const router = express.Router();
const namecheap = require('../config/namecheap');
const { verifyToken } = require('../middleware/auth');

// ===== DOMAIN MANAGEMENT =====

// Check domain availability
router.get('/domain/check/:domainName', verifyToken, async (req, res) => {
  try {
    const { domainName } = req.params;
    const result = await namecheap.checkDomainAvailability(domainName);
    res.json(result);
  } catch (error) {
    console.error('Domain check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List all domains
router.get('/domains/list', verifyToken, async (req, res) => {
  try {
    const result = await namecheap.listDomains();
    res.json(result);
  } catch (error) {
    console.error('Domain list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register new domain
router.post('/domain/register', verifyToken, async (req, res) => {
  try {
    const { domainName, years, contactInfo } = req.body;
    
    if (!domainName) {
      return res.status(400).json({ success: false, error: 'Domain name required' });
    }

    const result = await namecheap.registerDomain(domainName, years || 1, contactInfo);
    res.json(result);
  } catch (error) {
    console.error('Domain register error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== DNS MANAGEMENT =====

// Get DNS records
router.get('/dns/:domain', verifyToken, async (req, res) => {
  try {
    const { domain } = req.params;
    const result = await namecheap.getDNSRecords(domain);
    res.json(result);
  } catch (error) {
    console.error('DNS get error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set DNS records
router.post('/dns/:domain', verifyToken, async (req, res) => {
  try {
    const { domain } = req.params;
    const { records } = req.body;

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Records array required' });
    }

    const result = await namecheap.setDNSRecords(domain, records);
    res.json(result);
  } catch (error) {
    console.error('DNS set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== ACCOUNT MANAGEMENT =====

// Get account balance
router.get('/account/balance', verifyToken, async (req, res) => {
  try {
    const result = await namecheap.getAccountInfo();
    res.json(result);
  } catch (error) {
    console.error('Account info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== SSL CERTIFICATES =====

// List SSL certificates
router.get('/ssl/list', verifyToken, async (req, res) => {
  try {
    const result = await namecheap.listSSLCertificates();
    res.json(result);
  } catch (error) {
    console.error('SSL list error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== HOSTING =====

// Get hosting account info
router.get('/hosting/info/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const result = await namecheap.getHostingInfo(username);
    res.json(result);
  } catch (error) {
    console.error('Hosting info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
