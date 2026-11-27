const test = require('node:test');
const assert = require('node:assert/strict');

test('D1 adapter translates timestamps and matches mysql2 result shapes', async () => {
  const statements = [];
  const bindings = [];
  let runError;
  const database = {
    prepare(sql) {
      statements.push(sql);
      return {
        bind(...values) {
          bindings.push(values);
          return {
            async all() {
              return { results: [{ id: 1 }] };
            },
            async run() {
              if (runError) throw runError;
              return { meta: { last_row_id: 42, changes: 1 } };
            }
          };
        }
      };
    }
  };
  const modulePath = require.resolve('../server/config/database');
  globalThis.__KCH_RUNTIME__ = { DB: database };
  delete require.cache[modulePath];

  try {
    const pool = require(modulePath);
    const connection = await pool.getConnection();

    const [rows] = await connection.query('SELECT id FROM users WHERE active = ? AND created_at <= NOW()', [true]);
    assert.deepEqual(rows, [{ id: 1 }]);
    assert.match(statements[0], /CURRENT_TIMESTAMP/);
    assert.deepEqual(bindings[0], [1]);

    const [result] = await connection.query('INSERT INTO users (name) VALUES (?)', [undefined]);
    assert.deepEqual(result, { insertId: 42, affectedRows: 1 });
    assert.deepEqual(bindings[1], [null]);

    runError = new Error('UNIQUE constraint failed: users.email');
    await assert.rejects(
      connection.query('INSERT INTO users (email) VALUES (?)', ['duplicate@example.com']),
      error => error.code === 'ER_DUP_ENTRY'
    );
  } finally {
    delete globalThis.__KCH_RUNTIME__;
    delete require.cache[modulePath];
  }
});
