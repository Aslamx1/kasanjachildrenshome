const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/blog', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [posts] = await connection.query(
      'SELECT id, title, category, image, excerpt, content, published, created_at, updated_at FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC'
    );
    res.json(posts);
  } catch (error) {
    console.error('Get published blog posts error:', error);
    res.status(500).json({ message: 'Failed to load blog posts.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
