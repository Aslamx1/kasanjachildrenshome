# 🚀 Complete KCH Admin System - Deployment Guide for Namecheap

## 📋 What's Ready

Your KCH website now has a **complete production-ready admin system** with:

✅ **Admin Dashboard** - Live overview with 0 stats (ready for live data)
✅ **User Registration Tracking** - Monitor new account creation
✅ **Namecheap Integration** - Manage domains, DNS, SSL, hosting
✅ **Namecheap Services Panel** - Track renewals, expiry dates
✅ **Renewal Reminders** - Automatic alerts for expiring services
✅ **Database Backend** - MySQL with full schema
✅ **API Authentication** - Secure JWT-based access
✅ **Environment Configuration** - Secure credential storage

---

## 🔧 Step 1: Prepare Your Namecheap Hosting

### Access Your Namecheap cPanel
1. Go to: https://server326.web-hosting.com:2083/
2. Login with your credentials
3. Navigate to: **File Manager** or **Terminal**

### Option A: Upload via File Manager
1. Download all files from your local project
2. Connect to Namecheap FTP:
   - Host: `server326.web-hosting.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
3. Upload everything to `public_html` folder

### Option B: Upload via Git (Recommended)
```bash
# On your local machine
git init
git add .
git commit -m "Initial KCH Admin System deployment"
git remote add namecheap <your-namecheap-git-repo>
git push namecheap main
```

---

## 🗄️ Step 2: Set Up MySQL Database

### 1. Create Database via cPanel
1. Login to cPanel
2. Go to **MySQL Databases**
3. Create new database:
   - Name: `kch_database`
   - Username: `kch_admin`
   - Password: Generate strong password
4. Add user to database with all privileges

### 2. Run Database Setup Script

Via **phpMyAdmin** (in cPanel):
1. Go to your database
2. Click **Import**
3. Upload: `server/database-setup.sql`
4. Click **Go**

Or via Terminal:
```bash
mysql -u kch_admin -p kch_database < server/database-setup.sql
```

### Verify Tables Created:
```sql
SHOW TABLES;
-- Should see: users, children, donations, campaigns, namecheap_services, namecheap_renewals, etc.
```

---

## 📝 Step 3: Configure Environment Variables

### Create `.env` File

In your Namecheap hosting, create `.env` file with:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# MySQL Database (from Step 2)
DB_HOST=localhost
DB_USER=kch_admin
DB_PASSWORD=<your-strong-password>
DB_NAME=kch_database
DB_PORT=3306
DB_POOL_LIMIT=10

# JWT Configuration
JWT_SECRET=<generate-random-string-32-chars>
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=https://your-kch-domain.com

# Logging
LOG_LEVEL=info

# Namecheap API Configuration
NAMECHEAP_API_KEY=9LJ6IQICB6DG5PFDLSG4S5Q4IIYDLWM6
NAMECHEAP_API_USER=kch
NAMECHEAP_API_URL=https://api.namecheap.com/api/v1
NAMECHEAP_SANDBOX=false
```

### Make .env Secure
```bash
chmod 600 .env  # Read/write for owner only
```

---

## 🔒 Step 4: Install Dependencies

### Option 1: Via Namecheap Node.js Support
```bash
cd /home/username/public_html
npm install
```

### Option 2: If Node.js Not Available
Check if Namecheap provides Node.js hosting or use their management panel:
1. Go to cPanel > **Select PHP Version**
2. Check if Node.js is available
3. Activate if available

---

## 🌐 Step 5: Configure Domain & DNS

### Point Domain to Namecheap
1. In Namecheap: **Domain > Manage**
2. Go to **Advanced DNS**
3. Add records:

```
Type: A Record
Host: @
Value: <Your Namecheap Server IP>
TTL: 1800

Type: CNAME
Host: www
Value: your-domain.com
TTL: 1800
```

### SSL Certificate
1. In cPanel: **AutoSSL** or **Let's Encrypt** certificate
2. Ensure HTTPS is enabled

---

## 🏃 Step 6: Start Your Application

### Via SSH Terminal
```bash
cd /home/username/public_html
node server.js
```

Or use **Forever** for persistent running:
```bash
npm install -g forever
forever start server.js
```

Or use **PM2**:
```bash
npm install -g pm2
pm2 start server.js --name "kch-admin"
pm2 startup
pm2 save
```

---

## 🧪 Step 7: Test Everything

### 1. Test Admin Login
```
URL: https://your-kch-domain.com
Create an administrator with `npm run create-admin` before signing in.
```

### 2. Test Health Check
```bash
curl https://your-kch-domain.com/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2026-06-06T19:00:00.000Z"
}
```

### 3. Test Dashboard
- Login as admin
- Go to "Live Overview"
- Should show 0 for all stats (expected)

### 4. Test User Registrations
- Go to "User Registrations"
- Should see registered admin/staff users

### 5. Test Namecheap Services
- Go to "Namecheap Services"
- Should see your domain information
- Click "🔄 Sync Services"

---

## 📊 Step 8: Populate Namecheap Services

### Add Your Services to Database

Via **phpMyAdmin** or terminal:

```sql
INSERT INTO namecheap_services (
  service_type, service_name, domain_name, 
  purchase_date, expiry_date, renewal_date, 
  status, auto_renew, price, renewal_price
) VALUES (
  'Domain', 'kch.org', 'kch.org',
  '2024-01-15', '2025-01-15', '2024-12-15',
  'Active', TRUE, 8.99, 8.99
);

INSERT INTO namecheap_services (
  service_type, service_name, domain_name,
  purchase_date, expiry_date, renewal_date,
  status, auto_renew, price
) VALUES (
  'SSL', 'AutoSSL Certificate', 'kch.org',
  '2024-06-01', '2025-06-01', '2025-05-01',
  'Active', TRUE, 0.00
);

INSERT INTO namecheap_services (
  service_type, service_name,
  purchase_date, expiry_date,
  status, auto_renew, price
) VALUES (
  'Hosting', 'Web Hosting Account',
  '2024-01-01', '2025-01-01',
  'Active', TRUE, 0.00
);
```

---

## 🔄 Step 9: Set Up Automatic Tasks

### Enable Renewal Reminders

Create a cron job to check renewals daily:

```bash
# In cPanel > Cron Jobs
# Add this entry:
0 9 * * * curl -s https://your-kch-domain.com/api/namecheap-services/renewals > /dev/null 2>&1
```

---

## 🚨 Production Checklist

Before going live, verify:

- [ ] `.env` file created with all credentials
- [ ] `.env` is in `.gitignore` (not committed)
- [ ] Database tables created successfully
- [ ] All dependencies installed (`npm install`)
- [ ] Node.js/Server running
- [ ] Domain pointing to Namecheap server
- [ ] SSL certificate installed
- [ ] Admin can login
- [ ] Dashboard loads without errors
- [ ] Namecheap API credentials working
- [ ] User Registration tracking shows users
- [ ] Namecheap Services panel populates
- [ ] Database backups configured
- [ ] Logs being monitored

---

## 📱 Access Your Admin System

After deployment:

**URL**: `https://your-kch-domain.com`

Create the initial admin with `npm run create-admin` using unique credentials stored only in your environment.

---

## 🔒 Security Notes

### Secure Your API
- Change `JWT_SECRET` in `.env`
- Use strong password in `DB_PASSWORD`
- Enable HTTPS (required for Namecheap)
- Keep `.env` out of version control
- Regularly backup database

### Rate Limiting (Optional)
Consider adding rate limiting to prevent abuse:
```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📞 Troubleshooting

### 1. Port 3000 Already In Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### 2. Database Connection Error
- Verify credentials in `.env`
- Check MySQL is running
- Verify database name and username

### 3. Namecheap API Not Working
- Verify API key in `.env`
- Check API user name
- Ensure `NAMECHEAP_SANDBOX=false` for production
- Test API directly: `curl https://api.namecheap.com/api/v1/users.getPricing?ApiUser=kch&ApiKey=...`

### 4. CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your domain
- Include https:// in URL

---

## 📈 After Going Live

### 1. Monitor Performance
- Check server logs regularly
- Monitor database performance
- Track API response times

### 2. Update Dashboard Stats
When ready to show real data (not 0):

Edit `js/script.js`:
```javascript
// Change this:
animateValue("stat-total-donations", 0, 0, 1500, "UGX ");

// To this:
animateValue("stat-total-donations", 0, totalRevenue, 1500, "UGX ");
```

### 3. Regular Backups
```bash
# Backup database
mysqldump -u kch_admin -p kch_database > backup-$(date +%Y%m%d).sql

# Backup files
tar -czf kch-backup-$(date +%Y%m%d).tar.gz /home/username/public_html
```

### 4. Enable Logging
Monitor your application logs:
```bash
tail -f logs/kch-admin.log
```

---

## 🎉 Success!

Your KCH Admin System is now live on Namecheap hosting with:
- ✅ Production database
- ✅ Secure API authentication
- ✅ Namecheap service management
- ✅ User registration tracking
- ✅ Renewal reminders
- ✅ SSL encryption
- ✅ Custom domain

The system is ready to scale and manage KCH operations efficiently! 🚀

---

## 📚 Next Steps

1. **Customize Branding** - Update logo, colors in `css/style.css`
2. **Add More Users** - Create additional staff, donor, volunteer accounts
3. **Configure Email** - Set up email notifications for renewals
4. **Set Up Backups** - Automate daily database backups
5. **Monitor Renewals** - Check Namecheap Services regularly
6. **Update Content** - Add blog posts, stories, programs
7. **Go Live** - Enter KCH records through the admin sections

Good luck! 🙏
