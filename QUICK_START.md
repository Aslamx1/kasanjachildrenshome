# 🚀 Quick Start Guide - KCH Admin System

## One-Minute Overview

Your KCH Admin System is now **production-ready** with a complete backend!

### What You Have
✅ Express.js backend API
✅ MySQL database schema (13 tables)
✅ JWT authentication system
✅ CRUD endpoints for all major features
✅ Frontend ready for API integration
✅ Deployment guides for Namecheap

---

## Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd "c:\Users\LensNetwork\Desktop\KCH_Organized_Project 1231 asslam"
npm install
```

### Step 2: Setup MySQL Database
```bash
mysql -u root -p
CREATE DATABASE kch_database;
USE kch_database;
SOURCE server/database-setup.sql;
```

### Step 3: Start the Server
```bash
npm run dev
```

**Done!** Visit http://localhost:3000

---

## Administrator Setup

Configure `KCH_ADMIN_EMAIL`, `KCH_ADMIN_NAME`, and `KCH_ADMIN_PASSWORD` in the environment, then run `npm run create-admin`.

---

## File Structure Reminder

```
Your Project/
├── 📄 index.html              ← Frontend
├── 📁 js/
│  ├── script.js              ← Main logic
│  └── api.js                 ← NEW! API client
│
├── 🖥️  server.js              ← Backend entry
├── 📁 server/
│  ├── config/database.js     ← Database connection
│  ├── middleware/auth.js     ← Auth system
│  ├── routes/
│  │  ├── auth.js             ← Login/Register
│  │  ├── children.js         ← Children CRUD
│  │  ├── donations.js        ← Donations CRUD
│  │  └── dashboard.js        ← Dashboard stats
│  └── database-setup.sql     ← Database schema
│
├── 📋 .env                    ← Configuration
├── 📦 package.json            ← Dependencies
│
└── 📚 Documentation/
   ├── README.md               ← Full docs
   ├── DEPLOYMENT_GUIDE.md     ← Deploy to Namecheap
   ├── INTEGRATION_GUIDE.md    ← Frontend-backend integration
   └── IMPLEMENTATION_COMPLETE.md ← What was built
```

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/login        - Login
POST   /api/auth/register     - Register (admin only)
GET    /api/auth/me           - Current user
POST   /api/auth/logout       - Logout
```

### Children
```
GET    /api/children          - List children
POST   /api/children          - Create child
PUT    /api/children/:id      - Update child
DELETE /api/children/:id      - Delete child
```

### Donations
```
GET    /api/donations         - List donations
POST   /api/donations         - Create donation
PUT    /api/donations/:id     - Update donation
DELETE /api/donations/:id     - Delete donation
```

### Dashboard
```
GET    /api/dashboard/overview - Stats
GET    /api/dashboard/activity - Activity log
```

### Health Check
```
GET    /api/health            - Server status
```

---

## Using the API from Frontend

### Example 1: Fetch Children
```javascript
async function loadChildren() {
  const children = await apiCall('/children');
  console.log(children);
}
```

### Example 2: Create Donation
```javascript
async function addDonation() {
  const donation = await apiCall('/donations', 'POST', {
    donor_name: 'John Doe',
    amount: 500000,
    method: 'mobile_money'
  });
  console.log('Donation created:', donation);
}
```

### Example 3: Login
```javascript
async function userLogin() {
  const result = await loginUser(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('Logged in:', result.user);
}
```

---

## Test with curl

### Test Server
```bash
curl http://localhost:3000/api/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_ADMIN_PASSWORD"}'
```

### Get Children (use token from login)
```bash
curl -X GET http://localhost:3000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Tables Created

| Table | Purpose |
|-------|---------|
| users | Admin/staff users |
| children | Child records |
| donations | Donation ledger |
| campaigns | Fundraising campaigns |
| sponsorships | Sponsor-child relationships |
| events | Event management |
| volunteers | Volunteer tracking |
| inventory | Stock management |
| logistics | Shipment tracking |
| budget | Budget allocations |
| blog_posts | CMS content |
| correspondence | Letters & reports |
| grants | Grant tracking |

---

## Common Commands

### Start Development
```bash
npm run dev
```

### Start Production
```bash
npm start
```

### Install Packages
```bash
npm install
```

### Update Packages
```bash
npm update
```

---

## Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=kch_database
DB_PORT=3306

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=*
```

**For Production, change:**
- `NODE_ENV=production`
- `JWT_SECRET` to random string
- `CORS_ORIGIN` to your domain
- Database credentials

---

## Troubleshooting

### ❌ "Cannot find module 'express'"
**Solution:** Run `npm install`

### ❌ "ECONNREFUSED - MySQL not running"
**Solution:** Start MySQL server

### ❌ "Port 3000 already in use"
**Solution:** Change PORT in .env or kill process on port 3000

### ❌ "401 Unauthorized"
**Solution:** Login first to get JWT token

### ❌ "CORS error"
**Solution:** Update CORS_ORIGIN in .env

---

## Deploy to Namecheap

When ready, follow `DEPLOYMENT_GUIDE.md`:

1. Upload files to cPanel
2. Create MySQL database
3. Configure Node.js app
4. Set environment variables
5. Enable SSL/TLS
6. Start application

Takes about 30-60 minutes!

---

## What's Next?

### Option 1: Test Locally
```bash
npm install
npm run dev
# Visit http://localhost:3000
# Create the initial administrator with npm run create-admin before login
# Test features
```

### Option 2: Deploy Now
Follow `DEPLOYMENT_GUIDE.md` to deploy to Namecheap

### Option 3: Add More Features
Create new routes in `server/routes/` and call them from `js/api.js`

---

## Key Points to Remember

✅ **Backend is complete** - Express API ready to use
✅ **Database is ready** - 13 tables with proper schema
✅ **Authentication works** - JWT tokens for security
✅ **API client ready** - js/api.js functions
✅ **Documentation complete** - README, guides included
✅ **Production ready** - Deploy to Namecheap anytime

---

## Files You Need to Understand

1. **server.js** - Express app setup
2. **server/routes/*.js** - API endpoints
3. **js/api.js** - Frontend API calls
4. **server/database-setup.sql** - Database schema
5. **.env** - Configuration

---

## Security Checklist for Production

- [ ] Change JWT_SECRET
- [ ] Change default passwords
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Update DB_PASSWORD
- [ ] Update CORS_ORIGIN
- [ ] Backup database
- [ ] Monitor logs
- [ ] Setup error alerts

---

## Support Resources

📖 **Documentation Files:**
- README.md - Full project overview
- DEPLOYMENT_GUIDE.md - Deploy to Namecheap
- INTEGRATION_GUIDE.md - Connect frontend to backend
- IMPLEMENTATION_COMPLETE.md - Detailed summary

🔗 **External Resources:**
- Express.js: https://expressjs.com/
- MySQL: https://dev.mysql.com/doc/
- JWT: https://jwt.io/
- Node.js: https://nodejs.org/

---

## Ready to Go! 🎉

Your system is **100% production-ready**!

### Next Action:
```bash
npm install
npm run dev
```

Then open http://localhost:3000 and sign in with the administrator account you created.

**Enjoy your new admin system!** 🚀
