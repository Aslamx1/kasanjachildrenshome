const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

const resources = {
  campaigns: {
    table: 'campaigns',
    fields: {
      name: 'text',
      description: 'text',
      goal_amount: 'number',
      raised_amount: 'number',
      status: { type: 'enum', values: ['Planning', 'Active', 'Completed', 'Cancelled'] },
      start_date: 'date',
      end_date: 'date'
    },
    required: ['name', 'goal_amount']
  },
  sponsorships: {
    table: 'sponsorships',
    fields: {
      child_id: 'number',
      sponsor_id: 'number',
      sponsor_name: 'text',
      start_date: 'date',
      end_date: 'date',
      status: { type: 'enum', values: ['Active', 'Paused', 'Completed'] },
      monthly_amount: 'number'
    },
    required: ['child_id', 'sponsor_id']
  },
  peer_fundraising: {
    table: 'peer_fundraising',
    fields: {
      ambassador_name: 'text',
      campaign: 'text',
      target_amount: 'number',
      raised_amount: 'number',
      status: { type: 'enum', values: ['Planning', 'Active', 'Completed', 'Cancelled'] }
    },
    required: ['ambassador_name', 'campaign', 'target_amount']
  },
  events: {
    table: 'events',
    fields: {
      name: 'text',
      description: 'text',
      event_date: 'date',
      location: 'text',
      event_type: { type: 'enum', values: ['Fundraising', 'Community', 'Workshop'] },
      expected_attendees: 'number',
      actual_attendees: 'number',
      revenue: 'number',
      status: { type: 'enum', values: ['Planning', 'Active', 'Completed', 'Cancelled'] }
    },
    required: ['name', 'event_date']
  },
  volunteers: {
    table: 'volunteers',
    fields: {
      name: 'text',
      email: 'text',
      phone: 'text',
      hours_contributed: 'number',
      status: { type: 'enum', values: ['Active', 'Inactive', 'On Break'] },
      last_visit_date: 'date',
      bio: 'text'
    },
    required: ['name']
  },
  inventory: {
    table: 'inventory',
    fields: {
      item_name: 'text',
      category: 'text',
      quantity: 'number',
      unit_price: 'number',
      total_value: 'number',
      status: { type: 'enum', values: ['In Stock', 'Low Stock', 'Out of Stock'] },
      location: 'text'
    },
    required: ['item_name']
  },
  logistics: {
    table: 'logistics',
    fields: {
      shipment_id: 'text',
      destination: 'text',
      items: 'text',
      sent_date: 'date',
      received_date: 'date',
      status: { type: 'enum', values: ['Pending', 'In Transit', 'Delivered', 'Delayed'] },
      notes: 'text'
    },
    required: ['shipment_id', 'destination']
  },
  budget: {
    table: 'budget',
    fields: {
      category: 'text',
      budgeted_amount: 'number',
      spent_amount: 'number',
      fiscal_year: 'number',
      status: { type: 'enum', values: ['On Track', 'At Risk', 'Over Budget'] }
    },
    required: ['category', 'budgeted_amount']
  },
  blog_posts: {
    table: 'blog_posts',
    fields: {
      title: 'text',
      category: 'text',
      image: 'text',
      excerpt: 'text',
      content: 'text',
      published: 'boolean'
    },
    required: ['title', 'category', 'excerpt', 'content']
  },
  gallery: {
    table: 'gallery',
    fields: {
      title: 'text',
      category: 'text',
      src: 'text',
      date: 'date'
    },
    required: ['title', 'category', 'src']
  },
  correspondence: {
    table: 'correspondence',
    fields: {
      type: { type: 'enum', values: ['Thank You Letter', 'Progress Report', 'Invitation', 'Other'] },
      title: 'text',
      content: 'text',
      recipient: 'text',
      status: { type: 'enum', values: ['Draft', 'Sent', 'Archived'] },
      sent_date: 'date'
    },
    required: ['title']
  },
  grants: {
    table: 'grants',
    fields: {
      name: 'text',
      funder: 'text',
      amount: 'number',
      deadline: 'date',
      status: { type: 'enum', values: ['Applied', 'Approved', 'Rejected', 'Active', 'Completed'] },
      description: 'text'
    },
    required: ['name']
  }
};

router.use(verifyToken, checkRole(['admin']));

router.get('/roles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [roles] = await connection.query(
      'SELECT role, COUNT(*) AS user_count, MIN(created_at) AS created_at FROM users GROUP BY role ORDER BY role'
    );
    res.json(roles);
  } catch (error) {
    console.error('Get admin roles error:', error);
    res.status(500).json({ message: 'Failed to load roles.' });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/:resource', async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Admin resource not found.' });

  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(
      resource.table === 'sponsorships'
        ? "SELECT sponsorships.*, children.name AS child_name, COALESCE(NULLIF(sponsorships.sponsor_name, ''), users.name) AS sponsor_display_name FROM sponsorships LEFT JOIN children ON children.id = sponsorships.child_id LEFT JOIN users ON users.id = sponsorships.sponsor_id ORDER BY sponsorships.id DESC"
        : `SELECT * FROM \`${resource.table}\` ORDER BY id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(`Get ${req.params.resource} error:`, error);
    res.status(500).json({ message: `Failed to load ${req.params.resource}.` });
  } finally {
    if (connection) connection.release();
  }
});

router.post('/:resource', async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Admin resource not found.' });

  let data;
  try {
    data = readFields(req.body, resource, true);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    if (resource.table === 'blog_posts') data.id = crypto.randomBytes(16).toString('hex');
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const [result] = await connection.query(
      `INSERT INTO \`${resource.table}\` (${columns.map(column => `\`${column}\``).join(', ')}) VALUES (${placeholders})`,
      columns.map(column => data[column])
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(`Create ${req.params.resource} error:`, error);
    res.status(500).json({ message: `Failed to create ${req.params.resource}.` });
  } finally {
    if (connection) connection.release();
  }
});

router.put('/:resource/:id', async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Admin resource not found.' });

  let data;
  try {
    data = readFields(req.body, resource, false);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const columns = Object.keys(data);
  if (!columns.length) return res.status(400).json({ message: 'No editable fields supplied.' });

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      `UPDATE \`${resource.table}\` SET ${columns.map(column => `\`${column}\` = ?`).join(', ')} WHERE id = ?`,
      [...columns.map(column => data[column]), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Record updated.' });
  } catch (error) {
    console.error(`Update ${req.params.resource} error:`, error);
    res.status(500).json({ message: `Failed to update ${req.params.resource}.` });
  } finally {
    if (connection) connection.release();
  }
});

router.delete('/:resource/:id', async (req, res) => {
  const resource = resources[req.params.resource];
  if (!resource) return res.status(404).json({ message: 'Admin resource not found.' });

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.query(
      `DELETE FROM \`${resource.table}\` WHERE id = ?`,
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Record not found.' });
    res.json({ message: 'Record deleted.' });
  } catch (error) {
    console.error(`Delete ${req.params.resource} error:`, error);
    res.status(500).json({ message: `Failed to delete ${req.params.resource}.` });
  } finally {
    if (connection) connection.release();
  }
});

function readFields(input, resource, requireRequired) {
  const data = {};
  for (const [field, spec] of Object.entries(resource.fields)) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) continue;

    const type = typeof spec === 'string' ? spec : spec.type;
    let value = input[field];
    if (value === '' && (type === 'date' || type === 'number')) value = null;
    if (value === null || value === undefined) {
      data[field] = null;
    } else if (type === 'number') {
      const number = Number(value);
      if (!Number.isFinite(number)) throw new Error(`${field} must be a valid number.`);
      data[field] = number;
    } else if (type === 'boolean') {
      data[field] = value === true || value === 1 || value === '1' || value === 'true';
    } else if (type === 'date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        throw new Error(`${field} must be a valid date.`);
      }
      data[field] = value;
    } else if (type === 'enum') {
      if (!spec.values.includes(value)) throw new Error(`${field} has an invalid value.`);
      data[field] = value;
    } else {
      data[field] = String(value).trim();
    }
  }

  if (requireRequired) {
    for (const field of resource.required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw new Error(`${field} is required.`);
      }
    }
  }

  return data;
}

module.exports = router;
