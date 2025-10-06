import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const q = await pool.query(
      'SELECT r.*, u.name as owner_name FROM resources r JOIN users u ON r.user_id = u.id ORDER BY r.id DESC'
    );
    const rows = q.rows.map(r => {
      const img = r.image_filename ? `/images/${r.image_filename}` : `/images/${(r.category||'default').toLowerCase()}.svg`;
      return { ...r, image_url: img };
    });
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;
    const q = await pool.query(
      'INSERT INTO resources (title, description, category, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, category, userId]
    );
    res.status(201).json(q.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to create resource' });
  }
});

export default router;