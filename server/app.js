const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { getRuntimeValue } = require('./config/runtime-env');

const authRoutes = require('./routes/auth');
const childrenRoutes = require('./routes/children');
const donationsRoutes = require('./routes/donations');
const dashboardRoutes = require('./routes/dashboard');
const staffRoutes = require('./routes/staff');
const namecheapRoutes = require('./routes/namecheap');
const namecheapServicesRoutes = require('./routes/namecheap-services');
const migrateRoutes = require('./routes/migrate');
const adminDataRoutes = require('./routes/admin-data');
const publicContentRoutes = require('./routes/public-content');

function createApp({ serveStatic = false } = {}) {
  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: getRuntimeValue('CORS_ORIGIN', '*'),
    credentials: true
  }));

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

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
  });

  if (serveStatic) {
    app.use(express.static(path.resolve(__dirname, '..')));
    app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Internal server error',
      error: getRuntimeValue('NODE_ENV') === 'development' ? error : {}
    });
  });

  return app;
}

module.exports = { createApp };
