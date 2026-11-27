# KCH (Kasanja Children's Home) Admin System

A production-ready admin dashboard system for managing operations, fundraising, and child welfare records at Kasanja Children's Home in Uganda.

## 🎯 Features

### Admin Dashboard
- ✅ Live overview with real-time statistics
- ✅ Children management (enrollment, tracking, sponsorship)
- ✅ Donation tracking and ledger
- ✅ Campaign management
- ✅ Event management
- ✅ Volunteer tracking
- ✅ Inventory management
- ✅ Logistics & shipping tracking
- ✅ Budget allocation & monitoring
- ✅ Blog & gallery CMS
- ✅ Staff & user management
- ✅ Correspondence tracking
- ✅ Grant management

### Technical Features
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT token-based with role-based access
- **Security**: bcrypt password hashing, CORS, helmet.js
- **API**: RESTful API with proper error handling
- **Frontend**: Vanilla JavaScript, responsive design
- **Deployment**: Ready for Namecheap shared hosting

## 📋 Project Structure

```
KCH_Project/
├── index.html              # Frontend SPA
├── css/                    # Stylesheets
├── js/
│   ├── script.js          # Main frontend logic
│   ├── api.js             # API client functions
├── server.js              # Express app entry point
├── server/create-admin.js # Initial administrator setup
├── server/
│   ├── config/
│   │   └── database.js    # MySQL pool configuration
│   ├── middleware/
│   │   └── auth.js        # JWT verification & role checking
│   ├── routes/
│   │   ├── auth.js        # Login/register endpoints
│   │   ├── children.js    # Children CRUD
│   │   ├── donations.js   # Donations CRUD
│   │   └── dashboard.js   # Dashboard stats
│   └── database-setup.sql # MySQL schema
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
├── INTEGRATION_GUIDE.md   # Frontend-backend integration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- MySQL 8.0+
- npm

### Installation

1. **Clone/Extract Project**
```bash
cd KCH_Project
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
# Create database in MySQL
mysql -u root -p
CREATE DATABASE kch_database;
USE kch_database;
SOURCE server/database-setup.sql;
```
The schema creates tables only; it does not insert sample accounts or records.
For an existing database that already contains the old setup examples, run `server/remove-seeded-data.sql` once. It targets only those exact sample rows and preserves linked accounts.

4. **Configure Environment**
Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kch_database
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

5. **Start Server**
```bash
npm run dev
```

6. **Access Application**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Health check: http://localhost:3000/api/health

7. **Create the initial admin account**
```
# Set KCH_ADMIN_EMAIL, KCH_ADMIN_NAME, and KCH_ADMIN_PASSWORD
npm run create-admin
```
Use a unique password of at least 12 characters. Do not commit the credential values.
After the first administrator exists, add staff through the admin interface.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

### Available Endpoints

#### Auth
```
POST /auth/login              - Login user
POST /auth/register           - Register new user (admin only)
GET  /auth/me                 - Get current user info
POST /auth/logout             - Logout
```

#### Children
```
GET    /children              - List all children
GET    /children/:id          - Get single child
POST   /children              - Create new child
PUT    /children/:id          - Update child
DELETE /children/:id          - Delete child
```

#### Donations
```
GET    /donations             - List donations
GET    /donations/stats/summary - Get donation statistics
POST   /donations             - Create donation
PUT    /donations/:id         - Update donation
DELETE /donations/:id         - Delete donation
```

#### Dashboard
```
GET /dashboard/overview       - Get overview statistics
GET /dashboard/activity       - Get activity stream
```

## 🔐 User Roles

- **Admin**: Full access to all features and user management
- **Staff**: Can manage children, view donations, create reports
- **Donor**: Can view their donation history and impact
- **Volunteer**: Can track volunteer hours and opportunities
- **Engineer**: Technical maintenance access

## 🗄️ Database Tables

- `users` - Admin/staff users
- `children` - Enrolled children
- `donations` - Donation transactions
- `campaigns` - Fundraising campaigns
- `sponsorships` - Child-sponsor relationships
- `events` - Fundraising events
- `volunteers` - Volunteer records
- `inventory` - Stock management
- `logistics` - Shipping tracking
- `budget` - Budget allocations
- `blog_posts` - CMS blog
- `correspondence` - Letters & reports
- `grants` - Grant tracking

## 📦 Dependencies

### Main
- `express` - Web framework
- `mysql2` - MySQL driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment configuration
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP logging

### Dev
- `nodemon` - Auto-restart on file changes

## 🚢 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm start
```

### Namecheap Hosting
See `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

Key steps:
1. Upload files to cPanel
2. Create MySQL database
3. Configure environment variables
4. Set up Node.js application in cPanel
5. Enable SSL/TLS
6. Start application

### Cloudflare Workers

The Cloudflare deployment runs the Express API on Workers and stores application data in D1. The large story video is omitted from this deployment because it exceeds the Workers static asset limit and R2 storage is not enabled. The D1 database starts empty; the existing MySQL database is not copied automatically.

1. Install dependencies with `npm install`.
2. Create the D1 database:
   ```bash
   npx wrangler@4.168.0 d1 create kch-production
   ```
3. Add the D1 database ID to `wrangler.jsonc`, then apply the schema:
   ```bash
   npx wrangler@4.168.0 d1 execute kch-production --remote --file=cloudflare/schema.sql
   ```
4. Set the Worker secrets `JWT_SECRET` and `KCH_ADMIN_SETUP_TOKEN` using `npx wrangler@4.168.0 secret put <NAME>`. Use unique, strong random values; never commit them.
5. Deploy with `npx wrangler@4.168.0 deploy`. The configured route serves `kasanjachildrenhome.org`.
6. Create the first administrator through `POST /api/auth/bootstrap` with the setup token, then remove that bootstrap secret with `npx wrangler@4.168.0 secret delete KCH_ADMIN_SETUP_TOKEN`.

The Cloudflare migration configuration is separate from the existing Namecheap/MySQL setup. Cloudflare account authorization, resource creation, database initialization, and domain routing must be completed before the Worker is live.

## 🔒 Security

- ✅ JWT authentication
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Role-based access control
- ✅ Environment-based configuration

### Production Checklist
- [ ] Change JWT_SECRET to random value
- [ ] Update DB_PASSWORD to strong password
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS_ORIGIN to your domain
- [ ] Set up database backups
- [ ] Create the initial admin account with `npm run create-admin`

## 📊 Frontend Features

### Admin Dashboard
- Real-time statistics
- Quick action buttons
- Activity stream
- Data tables with search/sort
- Form modals for CRUD operations
- Toast notifications
- Responsive design

### Database Data
Admin tables and dashboard totals use the configured MySQL database. A new database starts empty; add records through the admin sections.

**Note**: Change these passwords in production!

## 🛠️ Development

### Adding New Endpoints
1. Create route file: `server/routes/feature.js`
2. Add route handlers
3. Import in `server.js`
4. Call from frontend via `api.js`

### Example
```javascript
// server/routes/campaigns.js
const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  // Get campaigns from database
});

module.exports = router;
```

### Testing APIs
Use Postman, curl, or Thunder Client:
```bash
curl -X GET http://localhost:3000/api/children \
  -H "Authorization: Bearer <token>"
```

## 📈 Monitoring

Check server health:
```bash
curl http://localhost:3000/api/health
```

Monitor logs:
```bash
tail -f logs/*.log
```

## 🐛 Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database exists

### 401 Unauthorized
- Login again to get fresh token
- Check token in localStorage

### CORS Errors
- Update CORS_ORIGIN in `.env`
- Restart server

### Port Already in Use
```bash
# Change PORT in .env or kill process
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # macOS/Linux
```

## 📝 Documentation

- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `INTEGRATION_GUIDE.md` - Frontend-backend integration
- API docs above

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review deployment guide
3. Check API documentation
4. Review code comments

## 📄 License

MIT License - See LICENSE file

## 👥 Contributors

- KCH Development Team

## 🎉 Ready to Deploy?

Your system is production-ready! Follow the `DEPLOYMENT_GUIDE.md` to deploy to Namecheap.

Key points:
- ✅ Backend: Complete with all CRUD operations
- ✅ Database: Fully designed schema
- ✅ Authentication: JWT-based security
- ✅ Frontend: Ready for API integration
- ✅ Deployment: Instructions included

**Next Step**: Install dependencies and run locally to test before deploying!

```bash
npm install
npm run dev
```
