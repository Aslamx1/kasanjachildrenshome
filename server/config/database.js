class D1Connection {
  constructor(database) {
    this.database = database;
  }

  async query(sql, params = []) {
    const statement = this.database.prepare(
      sql.replace(/\bNOW\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
    );
    const bindings = params.map(value => {
      if (value === undefined) return null;
      if (typeof value === 'boolean') return value ? 1 : 0;
      return value;
    });
    const prepared = statement.bind(...bindings);

    try {
      if (/^\s*(SELECT|WITH|PRAGMA|EXPLAIN)\b/i.test(sql)) {
        const result = await prepared.all();
        return [result.results || [], []];
      }

      const result = await prepared.run();
      return [{
        insertId: result.meta && result.meta.last_row_id || 0,
        affectedRows: result.meta && result.meta.changes || 0
      }, []];
    } catch (error) {
      if (/UNIQUE constraint failed/i.test(error.message || '')) {
        error.code = 'ER_DUP_ENTRY';
      }
      throw error;
    }
  }

  release() {}
}

function createD1Pool(database) {
  return {
    async getConnection() {
      return new D1Connection(database);
    },
    async end() {}
  };
}

const runtime = globalThis.__KCH_RUNTIME__;
if (runtime && runtime.DB) {
  module.exports = createD1Pool(runtime.DB);
} else {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_LIMIT || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  pool.getConnection().then(connection => {
    console.log('MySQL database connected successfully');
    connection.release();
  }).catch(error => {
    console.error('MySQL connection failed:', error.message);
  });

  module.exports = pool;
}
