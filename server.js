const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./server/routes/auth');
const childrenRoutes = require('./server/routes/children');
const donationsRoutes = require('./server/routes/donations');
const dashboardRoutes = require('./server/routes/dashboard');
const staffRoutes = require('./server/routes/staff');
const namecheapRoutes = require('./server/routes/namecheap');
const namecheapServicesRoutes = require('./server/routes/namecheap-services');
const migrateRoutes = require('./server/routes/migrate');
const adminDataRoutes = require('./server/routes/admin-data');
const publicContentRoutes = require('./server/routes/public-content');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Static files
app.use(express.static('.'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/namecheap', namecheapRoutes);
app.use('/api/namecheap-services', namecheapServicesRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/admin-data', adminDataRoutes);
app.use('/api', publicContentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Frontend routes (serve index.html for SPA)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   KCH Admin System Backend             ║
║   Server running on port ${PORT}      ║
║   Env: ${process.env.NODE_ENV}                ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
