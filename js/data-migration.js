// ===== DATA MIGRATION FROM LOCALSTORAGE TO DATABASE =====

async function migrateLocalStorageToDatabase() {
  try {
    const token = localStorage.getItem('kch_token');
    
    if (!token) {
      alert(' You must be logged in to sync data. Please login first.');
      return;
    }

    console.log(' Starting data migration...');

    // Get all localStorage data
    const usersData = localStorage.getItem('kch_users');
    const childrenData = localStorage.getItem('kch_children');
    const donationsData = localStorage.getItem('kch_donations');
    const staffData = localStorage.getItem('kch_staff');

    const payload = {
      users: usersData ? JSON.parse(usersData) : [],
      children: childrenData ? JSON.parse(childrenData) : [],
      donations: donationsData ? JSON.parse(donationsData) : [],
      staff: staffData ? JSON.parse(staffData) : []
    };

    console.log(' Data to migrate:', payload);

    // Send to backend
    const response = await fetch(`${API_BASE}/migrate/from-localstorage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(' Migration successful!', result);
      alert(` Successfully migrated:\n- ${result.usersMigrated || 0} users\n- ${result.childrenMigrated || 0} children\n- ${result.donationsMigrated || 0} donations`);
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(' Migration failed:', error);
    alert(` Migration failed: ${error.message}`);
  }
}

// Add migration button to admin dashboard
function initMigrationButton() {
  // Check if user is admin
  const userStr = localStorage.getItem('kch_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
      // Add button to admin panel (you can customize placement)
      const adminPanel = document.querySelector('.admin-section');
      if (adminPanel) {
        const button = document.createElement('button');
        button.innerHTML = ' Sync localStorage → Database';
        button.className = 'btn btn-secondary';
        button.onclick = migrateLocalStorageToDatabase;
        button.style.cssText = 'margin: 10px; padding: 10px 20px; background: #ff6b6b; color: white; border: none; border-radius: 5px; cursor: pointer;';
        adminPanel.appendChild(button);
      }
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initMigrationButton);
