-- KCH Admin System - MySQL Database Schema
-- Run this script in your MySQL database to set up tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'donor', 'volunteer', 'engineer') DEFAULT 'staff',
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

ALTER TABLE users MODIFY role ENUM('admin', 'staff', 'manager', 'coordinator', 'donor', 'volunteer', 'engineer') DEFAULT 'staff';

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  age INT,
  gender ENUM('Male', 'Female') NOT NULL,
  status ENUM('Active', 'Inactive', 'Graduated', 'Sponsored') DEFAULT 'Active',
  sponsor_id INT,
  bio TEXT,
  medical_info TEXT,
  date_of_birth DATE,
  enrollment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_name (name)
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('bank_transfer', 'mobile_money', 'credit_card', 'check') DEFAULT 'bank_transfer',
  status ENUM('Pending', 'Received', 'Declined') DEFAULT 'Pending',
  notes TEXT,
  donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_date (donation_date),
  INDEX idx_donor (donor_name)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount DECIMAL(12, 2) NOT NULL,
  raised_amount DECIMAL(12, 2) DEFAULT 0,
  status ENUM('Planning', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planning',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Create sponsorships table
CREATE TABLE IF NOT EXISTS sponsorships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  child_id INT NOT NULL,
  sponsor_id INT NOT NULL,
  sponsor_name VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status ENUM('Active', 'Paused', 'Completed') DEFAULT 'Active',
  monthly_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  INDEX idx_status (status),
  INDEX idx_child (child_id)
);

CREATE TABLE IF NOT EXISTS peer_fundraising (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ambassador_name VARCHAR(255) NOT NULL,
  campaign VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  raised_amount DECIMAL(12, 2) DEFAULT 0,
  status ENUM('Planning', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location VARCHAR(255),
  event_type ENUM('Fundraising', 'Community', 'Workshop') DEFAULT 'Fundraising',
  expected_attendees INT,
  actual_attendees INT,
  revenue DECIMAL(12, 2) DEFAULT 0,
  status ENUM('Planning', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (event_date),
  INDEX idx_status (status)
);

-- Create volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  hours_contributed INT DEFAULT 0,
  status ENUM('Active', 'Inactive', 'On Break') DEFAULT 'Active',
  last_visit_date DATE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_name (name)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INT DEFAULT 0,
  unit_price DECIMAL(10, 2),
  total_value DECIMAL(12, 2),
  status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock',
  location VARCHAR(255),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_category (category)
);

-- Create logistics table
CREATE TABLE IF NOT EXISTS logistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id VARCHAR(50) UNIQUE NOT NULL,
  destination VARCHAR(255) NOT NULL,
  items TEXT,
  sent_date DATE,
  received_date DATE,
  status ENUM('Pending', 'In Transit', 'Delivered', 'Delayed') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_shipment (shipment_id)
);

-- Create budget table
CREATE TABLE IF NOT EXISTS budget (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(255) NOT NULL,
  budgeted_amount DECIMAL(12, 2) NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  fiscal_year INT,
  status ENUM('On Track', 'At Risk', 'Over Budget') DEFAULT 'On Track',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_fiscal_year (fiscal_year)
);

-- Create blog_posts table (existing)
CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  image VARCHAR(500),
  excerpt TEXT,
  content LONGTEXT,
  published BOOLEAN DEFAULT TRUE,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_published (published),
  INDEX idx_category (category),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  src VARCHAR(1000) NOT NULL,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_date (date)
);

-- Create correspondence table
CREATE TABLE IF NOT EXISTS correspondence (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('Thank You Letter', 'Progress Report', 'Invitation', 'Other') DEFAULT 'Other',
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  recipient VARCHAR(255),
  status ENUM('Draft', 'Sent', 'Archived') DEFAULT 'Draft',
  sent_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type)
);

-- Create grants table
CREATE TABLE IF NOT EXISTS grants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  funder VARCHAR(255),
  amount DECIMAL(12, 2),
  deadline DATE,
  status ENUM('Applied', 'Approved', 'Rejected', 'Active', 'Completed') DEFAULT 'Applied',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
);

-- Create namecheap_services table
CREATE TABLE IF NOT EXISTS namecheap_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_type ENUM('Domain', 'SSL', 'Hosting', 'Email') NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  domain_name VARCHAR(255),
  purchase_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  status ENUM('Active', 'Expiring Soon', 'Expired', 'Renewal Pending') DEFAULT 'Active',
  auto_renew BOOLEAN DEFAULT TRUE,
  price DECIMAL(10, 2),
  renewal_price DECIMAL(10, 2),
  notes TEXT,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (service_type),
  INDEX idx_domain (domain_name),
  INDEX idx_expiry (expiry_date),
  INDEX idx_status (status)
);

-- Create namecheap_renewals table
CREATE TABLE IF NOT EXISTS namecheap_renewals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  service_type VARCHAR(50),
  service_name VARCHAR(255),
  current_expiry DATE,
  next_renewal DATE,
  days_until_renewal INT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  renewal_status ENUM('Pending', 'Renewed', 'Failed') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES namecheap_services(id) ON DELETE CASCADE,
  INDEX idx_days_until (days_until_renewal),
  INDEX idx_status (renewal_status),
  INDEX idx_reminder (reminder_sent)
);

SELECT 'Database schema ready. Create the first admin with npm run create-admin.' AS setup_status;
