CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff'
    CHECK (role IN ('admin', 'staff', 'manager', 'coordinator', 'donor', 'volunteer', 'engineer')),
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female') OR gender IS NULL),
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Sponsored')),
  sponsor_id INTEGER,
  bio TEXT,
  medical_info TEXT,
  date_of_birth TEXT,
  enrollment_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_children_status ON children(status);
CREATE INDEX IF NOT EXISTS idx_children_name ON children(name);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL DEFAULT 'bank_transfer'
    CHECK (method IN ('bank_transfer', 'mobile_money', 'credit_card', 'check')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received', 'Declined')),
  notes TEXT,
  currency TEXT DEFAULT 'UGX',
  donation_type TEXT DEFAULT 'one-time',
  donation_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_name);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planning'
    CHECK (status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE TABLE IF NOT EXISTS sponsorships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id),
  sponsor_id INTEGER NOT NULL REFERENCES users(id),
  sponsor_name TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed')),
  monthly_amount NUMERIC,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_child ON sponsorships(child_id);

CREATE TABLE IF NOT EXISTS peer_fundraising (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ambassador_name TEXT NOT NULL,
  campaign TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  raised_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planning'
    CHECK (status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_peer_fundraising_status ON peer_fundraising(status);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  location TEXT,
  event_type TEXT NOT NULL DEFAULT 'Fundraising'
    CHECK (event_type IN ('Fundraising', 'Community', 'Workshop')),
  expected_attendees INTEGER,
  actual_attendees INTEGER,
  revenue NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planning'
    CHECK (status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hours_contributed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Break')),
  last_visit_date TEXT,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_name ON volunteers(name);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC,
  total_value NUMERIC,
  status TEXT NOT NULL DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  location TEXT,
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

CREATE TABLE IF NOT EXISTS logistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipment_id TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  items TEXT,
  sent_date TEXT,
  received_date TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Delivered', 'Delayed')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_logistics_status ON logistics(status);

CREATE TABLE IF NOT EXISTS budget (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  budgeted_amount NUMERIC NOT NULL,
  spent_amount NUMERIC DEFAULT 0,
  fiscal_year INTEGER,
  status TEXT NOT NULL DEFAULT 'On Track' CHECK (status IN ('On Track', 'At Risk', 'Over Budget')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_budget_category ON budget(category);
CREATE INDEX IF NOT EXISTS idx_budget_fiscal_year ON budget(fiscal_year);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  image TEXT,
  excerpt TEXT,
  content TEXT,
  published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  author_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  src TEXT NOT NULL,
  date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_date ON gallery(date);

CREATE TABLE IF NOT EXISTS correspondence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'Other'
    CHECK (type IN ('Thank You Letter', 'Progress Report', 'Invitation', 'Other')),
  title TEXT NOT NULL,
  content TEXT,
  recipient TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Archived')),
  sent_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_correspondence_status ON correspondence(status);
CREATE INDEX IF NOT EXISTS idx_correspondence_type ON correspondence(type);

CREATE TABLE IF NOT EXISTS grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  funder TEXT,
  amount NUMERIC,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'Applied'
    CHECK (status IN ('Applied', 'Approved', 'Rejected', 'Active', 'Completed')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline);

CREATE TABLE IF NOT EXISTS namecheap_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type TEXT NOT NULL CHECK (service_type IN ('Domain', 'SSL', 'Hosting', 'Email')),
  service_name TEXT NOT NULL,
  domain_name TEXT,
  purchase_date TEXT,
  expiry_date TEXT,
  renewal_date TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active', 'Expiring Soon', 'Expired', 'Renewal Pending')),
  auto_renew INTEGER NOT NULL DEFAULT 1 CHECK (auto_renew IN (0, 1)),
  price NUMERIC,
  renewal_price NUMERIC,
  notes TEXT,
  last_synced TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_namecheap_services_type ON namecheap_services(service_type);
CREATE INDEX IF NOT EXISTS idx_namecheap_services_domain ON namecheap_services(domain_name);
CREATE INDEX IF NOT EXISTS idx_namecheap_services_expiry ON namecheap_services(expiry_date);
CREATE INDEX IF NOT EXISTS idx_namecheap_services_status ON namecheap_services(status);

CREATE TABLE IF NOT EXISTS namecheap_renewals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES namecheap_services(id) ON DELETE CASCADE,
  service_type TEXT,
  service_name TEXT,
  current_expiry TEXT,
  next_renewal TEXT,
  days_until_renewal INTEGER,
  reminder_sent INTEGER NOT NULL DEFAULT 0 CHECK (reminder_sent IN (0, 1)),
  renewal_status TEXT NOT NULL DEFAULT 'Pending' CHECK (renewal_status IN ('Pending', 'Renewed', 'Failed')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_namecheap_renewals_days ON namecheap_renewals(days_until_renewal);
CREATE INDEX IF NOT EXISTS idx_namecheap_renewals_status ON namecheap_renewals(renewal_status);
CREATE INDEX IF NOT EXISTS idx_namecheap_renewals_reminder ON namecheap_renewals(reminder_sent);
