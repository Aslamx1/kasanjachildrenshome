# KCH Admin System - Integration Guide

## Backend is Now Ready!

Your KCH Admin System now has a complete backend with:
✓ Express.js REST API
✓ MySQL database schema
✓ JWT authentication
✓ All CRUD endpoints for data management
✓ Production-ready structure

## Next Steps: Frontend Integration

The frontend reads and writes admin data through the MySQL-backed API.

### 1. Add API Script to index.html
Add this before the closing `</body>` tag in index.html:
```html
<script src="js/api.js"></script>
```

### 2. Update Admin Dashboard Integration

#### Option A: Keep Demo Data (Recommended for Testing)
Current setup: Demo data loads by default
- Tests UI without database
- Useful for local development
- When backend is ready, switch to API calls

#### Option B: Switch to API Calls Immediately
Uncomment/use these functions in script.js instead of hardcoded data:

**Example:**
```javascript
// OLD: Hardcoded data
function renderCampaignsTable() {
  const tbody = document.querySelector('#admin-campaigns-tbody');
  const campaigns = [...hardcoded data...];
}

// NEW: API data
async function renderCampaignsTable() {
  try {
    const campaigns = await apiCall('/campaigns');
    const tbody = document.querySelector('#admin-campaigns-tbody');
    tbody.innerHTML = campaigns.map(c => `...`).join('');
  } catch (error) {
    showToast('Error loading campaigns: ' + error.message, 'error');
  }
}
```

### 3. Backend API Endpoints (Ready to Use)

#### Authentication
```
POST   /api/auth/login           - Login user
POST   /api/auth/register        - Register new user (admin only)
GET    /api/auth/me              - Get current user
POST   /api/auth/logout          - Logout
```

#### Children Management
```
GET    /api/children              - List all children
POST   /api/children              - Create child
PUT    /api/children/:id          - Update child
DELETE /api/children/:id          - Delete child
```

#### Donations
```
GET    /api/donations             - List donations
GET    /api/donations/stats/summary - Get donation stats
POST   /api/donations             - Create donation
PUT    /api/donations/:id         - Update donation
DELETE /api/donations/:id         - Delete donation
```

#### Dashboard
```
GET    /api/dashboard/overview    - Get stats (children, donations, staff, volunteers)
GET    /api/dashboard/activity    - Get activity stream
```

### 4. Quick Start - Run Locally

```bash
# Terminal 1: Start MySQL (if not running)
# Windows: Use MySQL command line or MySQL Workbench

# Terminal 2: Start Node.js server
npm install
npm run dev

# Your admin system is now:
# Frontend: http://localhost:3000
# API: http://localhost:3000/api

# Create an administrator with npm run create-admin before login.
```

### 5. Test API Directly

Using curl or Postman:

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_ADMIN_PASSWORD"}'

# Response: { "token": "eyJhbGc...", "user": {...} }

# Get children (use token from above)
curl -X GET http://localhost:3000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Frontend to Backend Flow

```
User Login → localStorage → API Call → JWT Token
             ↓
Admin Dashboard → API Calls → Express Routes → MySQL
                  ↓
              Response JSON ← Database Results
                  ↓
          Render Tables/Charts
```

### 7. Important Notes

1. **CORS**: Currently allows all origins (development). Update in `.env` for production:
   ```
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Authentication**: JWT tokens expire in 7 days (configurable in `.env`)

3. **Database**: User accounts are stored in MySQL with bcrypt-hashed passwords.

4. **Error Handling**: All API errors include clear messages in frontend

5. **Security**: In production, change `JWT_SECRET` to a cryptographically secure random string

### 8. Creating Additional Endpoints

To add more endpoints (campaigns, events, etc.):

1. Create route file: `server/routes/campaigns.js`
2. Add controller logic (query database)
3. Import in `server.js`: `app.use('/api/campaigns', campaignsRoutes);`
4. Call from frontend: `await apiCall('/campaigns')`

Example route template in `server/routes/campaigns.js`:
```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all campaigns
router.get('/', verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [campaigns] = await conn.query('SELECT * FROM campaigns ORDER BY name');
    conn.release();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add more CRUD operations...

module.exports = router;
```

### 9. Status Check

Monitor your system:
```
GET /api/health
```

Returns: `{ "status": "Server is running", "timestamp": "..." }`

---

## What's Next?

1. ✅ Backend API created
2. ✅ Database schema ready
3. ✅ Authentication system ready
4. ⚪ Frontend integration (use api.js functions)
5. ⚪ Add remaining CRUD endpoints (campaigns, events, etc.)
6. ⚪ Deploy to Namecheap

Ready to integrate and test? Let me know!
