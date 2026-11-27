require('dotenv').config();
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const email = process.env.KCH_ADMIN_EMAIL && process.env.KCH_ADMIN_EMAIL.trim();
  const name = process.env.KCH_ADMIN_NAME && process.env.KCH_ADMIN_NAME.trim();
  const password = process.env.KCH_ADMIN_PASSWORD;

  if (!email || !name || !password) {
    throw new Error('Set KCH_ADMIN_EMAIL, KCH_ADMIN_NAME, and KCH_ADMIN_PASSWORD before running this command.');
  }
  if (password.length < 12) {
    throw new Error('The initial admin password must be at least 12 characters long.');
  }

  const pool = require('./config/database');
  let connection;
  try {
    connection = await pool.getConnection();
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length) {
      throw new Error('An account already uses this email; no account was changed.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await connection.query(
      'INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, name, 'admin', 'active']
    );
    console.log(`Administrator account created for ${email}.`);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

createAdmin().catch(error => {
  console.error(`Could not create administrator: ${error.message}`);
  process.exitCode = 1;
});
