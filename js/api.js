// ===== API CLIENT FOR KCH ADMIN SYSTEM =====

// Auto-detect protocol: use HTTP for production
const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : `${window.location.origin}/api`;
let authToken = localStorage.getItem('kch_token');

// ===== AUTHENTICATION =====
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('kch_token', data.token);
      localStorage.setItem('kch_user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

function logoutUser() {
  authToken = null;
  localStorage.removeItem('kch_token');
  localStorage.removeItem('kch_user');
}

// ===== API HELPER FUNCTION =====
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (response.status === 401) {
      logoutUser();
      showPage('login');
      throw new Error('Session expired, please login again');
    }

    if (!response.ok) {
      throw new Error(data.message || 'API error');
    }

    return data;
  } catch (error) {
    console.error(`API call error: ${endpoint}`, error);
    throw error;
  }
}

// ===== CHILDREN API =====
async function fetchChildren() {
  return apiCall('/children');
}

async function createChild(childData) {
  return apiCall('/children', 'POST', childData);
}

async function updateChild(id, childData) {
  return apiCall(`/children/${id}`, 'PUT', childData);
}

async function deleteChild(id) {
  return apiCall(`/children/${id}`, 'DELETE');
}

// ===== DONATIONS API =====
async function fetchDonations() {
  return apiCall('/donations');
}

async function getDonationStats() {
  return apiCall('/donations/stats/summary');
}

async function createDonation(donationData) {
  return apiCall('/donations', 'POST', donationData);
}

async function updateDonation(id, donationData) {
  return apiCall(`/donations/${id}`, 'PUT', donationData);
}

async function deleteDonation(id) {
  return apiCall(`/donations/${id}`, 'DELETE');
}

// ===== DASHBOARD API =====
async function fetchDashboardOverview() {
  return apiCall('/dashboard/overview');
}

async function fetchActivityStream() {
  return apiCall('/dashboard/activity');
}

// ===== RENDER FUNCTIONS WITH API =====

async function renderChildrenTableFromAPI() {
  try {
    showToast('Loading children...', 'info');
    const children = await fetchChildren();
    const tbody = document.querySelector('#admin-children-tbody');
    if (!tbody) return;

    tbody.innerHTML = children.map(c => `
      <tr>
        <td>${escapeHTML(c.name)}</td>
        <td>${c.age}</td>
        <td>${c.gender}</td>
        <td><span class="admin-badge admin-badge-success">${c.status}</span></td>
        <td>${c.sponsor_id ? 'Yes' : 'No'}</td>
        <td>
          <button class="admin-action-btn view" onclick="viewChild(${c.id})" title="View">View</button>
          <button class="admin-action-btn edit" onclick="editChild(${c.id})" title="Edit">Edit</button>
          <button class="admin-action-btn delete" onclick="deleteChildRecord(${c.id})" title="Delete">Delete</button>
        </td>
      </tr>
    `).join('');
    showToast('Children loaded', 'success');
  } catch (error) {
    showToast('Error loading children: ' + error.message, 'error');
  }
}

async function renderDonationsTableFromAPI() {
  try {
    showToast('Loading donations...', 'info');
    const donations = await fetchDonations();
    const tbody = document.querySelector('#admin-donations');
    if (!tbody) return;

    tbody.innerHTML = donations.map(d => `
      <tr>
        <td>${new Date(d.donation_date).toLocaleDateString()}</td>
        <td>${escapeHTML(d.donor_name)}</td>
        <td>UGX ${Number(d.amount).toLocaleString()}</td>
        <td>${d.method}</td>
        <td><span class="admin-badge admin-badge-success">${d.status}</span></td>
        <td>${d.id}</td>
        <td>
          <button class="admin-action-btn view" onclick="showToast('Viewing donation', 'info')" title="View">View</button>
          <button class="admin-action-btn edit" onclick="showToast('Edit donation', 'info')" title="Edit">Edit</button>
          <button class="admin-action-btn delete" onclick="deleteDonationRecord(${d.id})" title="Delete">Delete</button>
        </td>
      </tr>
    `).join('');
    showToast('Donations loaded', 'success');
  } catch (error) {
    showToast('Error loading donations: ' + error.message, 'error');
  }
}

async function updateLiveCountersFromAPI() {
  try {
    const stats = await fetchDashboardOverview();
    document.getElementById('ov-children').textContent = stats.children_enrolled;
    document.getElementById('ov-donations').textContent = 'UGX ' + Number(stats.total_donations).toLocaleString();
    document.getElementById('ov-staff').textContent = stats.active_staff;
    document.getElementById('ov-volunteers').textContent = stats.volunteers;
  } catch (error) {
    console.error('Error updating counters:', error);
  }
}

// ===== ACTION HANDLERS =====
async function deleteChildRecord(id) {
  if (!confirm('Are you sure you want to delete this child record?')) return;
  try {
    await deleteChild(id);
    showToast('Child deleted', 'success');
    renderChildrenTableFromAPI();
  } catch (error) {
    showToast('Error deleting child: ' + error.message, 'error');
  }
}

// ===== NAMECHEAP API FUNCTIONS =====

// Check domain availability
async function checkDomainAvailability(domainName) {
  return apiCall(`/namecheap/domain/check/${domainName}`);
}

// List all domains
async function listNamecheapDomains() {
  return apiCall('/namecheap/domains/list');
}

// Register new domain
async function registerDomain(domainName, years = 1, contactInfo = {}) {
  return apiCall('/namecheap/domain/register', 'POST', {
    domainName,
    years,
    contactInfo
  });
}

// Get DNS records
async function getDNSRecords(domain) {
  return apiCall(`/namecheap/dns/${domain}`);
}

// Set DNS records
async function setDNSRecords(domain, records) {
  return apiCall(`/namecheap/dns/${domain}`, 'POST', { records });
}

// Get account balance
async function getNamecheapAccountBalance() {
  return apiCall('/namecheap/account/balance');
}

// List SSL certificates
async function listSSLCertificates() {
  return apiCall('/namecheap/ssl/list');
}

// Get hosting account info
async function getHostingAccountInfo(username) {
  return apiCall(`/namecheap/hosting/info/${username}`);
}

// ===== NAMECHEAP SERVICES MANAGEMENT =====

// Get all services
async function getNamecheapServices() {
  return apiCall('/namecheap-services/services');
}

// Add new service
async function addNamecheapService(service) {
  return apiCall('/namecheap-services/services', 'POST', service);
}

// Update service
async function updateNamecheapService(id, updates) {
  return apiCall(`/namecheap-services/services/${id}`, 'PUT', updates);
}

// Delete service
async function deleteNamecheapService(id) {
  return apiCall(`/namecheap-services/services/${id}`, 'DELETE');
}

// Get renewal reminders
async function getNamecheapRenewals() {
  return apiCall('/namecheap-services/renewals');
}

// Get upcoming renewals
async function getUpcomingRenewals() {
  return apiCall('/namecheap-services/renewals/upcoming');
}

// Get Namecheap stats
async function getNamecheapStats() {
  return apiCall('/namecheap-services/overview/stats');
}

// Sync with Namecheap
async function syncNamecheapServices() {
  return apiCall('/namecheap-services/sync', 'POST');
}

async function deleteDonationRecord(id) {
  if (!confirm('Are you sure you want to delete this donation?')) return;
  try {
    await deleteDonation(id);
    showToast('Donation deleted', 'success');
    renderDonationsTableFromAPI();
  } catch (error) {
    showToast('Error deleting donation: ' + error.message, 'error');
  }
}

function viewChild(id) {
  showToast('View child ' + id + ' (coming soon)', 'info');
}

function editChild(id) {
  showToast('Edit child ' + id + ' (coming soon)', 'info');
}

function addChild() {
  showToast('New child form (coming soon)', 'info');
}

function addDonation() {
  showToast('New donation form (coming soon)', 'info');
}

// ===== STAFF MANAGEMENT =====
async function getAllStaff() {
  return apiCall('/staff');
}

async function addStaffMember(name, email, role, phone) {
  return apiCall('/staff', 'POST', { name, email, role, phone });
}

async function updateStaffMember(id, updates) {
  return apiCall(`/staff/${id}`, 'PUT', updates);
}

async function deleteStaffMember(id) {
  return apiCall(`/staff/${id}`, 'DELETE');
}

async function resetStaffPassword(id) {
  return apiCall(`/staff/${id}/reset-password`, 'POST');
}

// Helper function to escape HTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
