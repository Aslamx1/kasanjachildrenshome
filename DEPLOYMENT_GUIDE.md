# KCH Admin System - Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js 14+ installed
- MySQL 8.0+ installed
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE kch_database;
USE kch_database;

# Run schema (copy-paste server/database-setup.sql contents)
```

Or use the SQL file directly:
```bash
mysql -u root -p kch_database < server/database-setup.sql
```

### 3. Configure Environment
Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kch_database
JWT_SECRET=change_this_to_random_string_production
NODE_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on: http://localhost:3000

### 5. Test Login
Create an administrator with `npm run create-admin` after configuring the database and before signing in.

---

## Namecheap Shared Hosting Deployment

### Prerequisites
- cPanel access to Namecheap
- MySQL database created in cPanel
- Node.js support enabled (or use traditional PHP approach)

### Option 1: Node.js on Namecheap (Recommended)

#### Step 1: Upload Files to Server
1. Connect via FTP/SFTP
2. Upload all files to `public_html` or subdirectory
3. Ensure `server/` directory is accessible

#### Step 2: Create MySQL Database
1. Login to cPanel
2. Go to MySQL Database Wizard
3. Create database: `kch_production`
4. Create user: `kch_admin`
5. Add all privileges to user

#### Step 3: Configure .env for Production
```
DB_HOST=your_namecheap_db_host
DB_USER=kch_admin
DB_PASSWORD=strong_password_here
DB_NAME=kch_production
JWT_SECRET=generate_secure_random_string_here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
PORT=8080
```

#### Step 4: Create/Update Node.js Application
1. In cPanel, go to "Node.js Selector"
2. Create new application
3. Set app directory to your project folder
4. Set entrypoint to `server.js`
5. Ensure Node.js version is 14+

#### Step 5: Install Dependencies on Server
In cPanel terminal or via SSH:
```bash
cd /path/to/app
npm install --production
```

#### Step 6: Run Database Setup
```bash
mysql -h your_db_host -u kch_admin -p kch_production < server/database-setup.sql
```

#### Step 7: Start Application
In cPanel Node.js manager, click "Start App"

#### Step 8: Enable HTTPS
1. In cPanel, go to AutoSSL or Let's Encrypt
2. Ensure SSL is active for your domain

### Option 2: Traditional PHP Approach

If Node.js isn't available on your Namecheap plan, convert to PHP:
- Rewrite routes in PHP
- Keep MySQL database the same
- Use PHP libraries like Slim Framework or Laravel

---

## Production Checklist

- [ ] Database backed up
- [ ] .env configured for production
- [ ] JWT_SECRET changed to secure random value
- [ ] CORS_ORIGIN set to your domain
- [ ] SSL/TLS enabled
- [ ] Database user permissions restricted
- [ ] Error logging enabled
- [ ] Admin password changed from default
- [ ] All API endpoints tested
- [ ] Backup strategy implemented

---

## Monitoring & Maintenance

### View Logs
In cPanel or via SSH:
```bash
tail -f /var/log/nodejs/app.log
```

### Backup Database
Monthly automated backups via cPanel or:
```bash
mysqldump -h host -u user -p database_name > backup.sql
```

### Update Application
```bash
git pull origin main
npm install
# Restart app in cPanel
```

---

## Troubleshooting

### Database Connection Error
- Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- Check database exists
- Ensure user has correct permissions

### API Returns 401 Unauthorized
- Clear browser localStorage
- Login again to get fresh token
- Check JWT_SECRET matches across instances

### CORS Errors
- Update CORS_ORIGIN in .env to your domain
- Restart application

### SSL Certificate Issues
- Ensure domain is pointing to server
- Wait 24-48 hours for DNS propagation
- Renew certificate via cPanel

---

## Security Best Practices

1. **Admin Setup**: Create the initial administrator with `npm run create-admin`
2. **Database**: Use strong, unique passwords
3. **JWT Secret**: Generate via: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **Backups**: Daily automated backups
5. **Updates**: Keep dependencies updated: `npm update`
6. **Monitoring**: Set up error alerts via email

---

## Performance Optimization

1. Enable gzip compression in Express
2. Use MySQL query indexing (already configured)
3. Implement caching for frequently accessed data
4. Use CDN for static assets (CSS, images)

---

## Support & Resources

- MySQL Docs: https://dev.mysql.com/doc/
- Express.js Docs: https://expressjs.com/
- Namecheap Support: support.namecheap.com
- Node.js Best Practices: https://nodejs.org/
