import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications - returns notifications for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const q = await pool.query('SELECT id, message, created_at, read FROM notifications WHERE user_id = $1 ORDER BY id DESC', [userId]);
    res.json(q.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications - create a notification (admin/testing) - requires body: { user_id, message }
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user_id, message } = req.body;
    if (!user_id || !message) return res.status(400).json({ message: 'user_id and message required' });
    const q = await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *', [user_id, message]);
    res.status(201).json(q.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// PATCH /api/notifications/:id - mark a notification as read
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // ensure notification belongs to user
    const existing = await pool.query('SELECT * FROM notifications WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Notification not found' });
    const q = await pool.query('UPDATE notifications SET read = TRUE WHERE id=$1 RETURNING *', [id]);
    res.json(q.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// DELETE /api/notifications/:id - delete a notification (user can clear)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const q = await pool.query('DELETE FROM notifications WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId]);
    if (!q.rows.length) return res.status(404).json({ message: 'Notification not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

export default router;
