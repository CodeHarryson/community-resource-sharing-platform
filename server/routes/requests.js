import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/requests - create a new request for a resource
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { resource_id } = req.body;
        const requester_id = req.user.id;

        const userQ = await pool.query('SELECT credits FROM users WHERE id=$1', [requester_id]);
        if (!userQ.rows.length) return res.status(404).json({ message: 'User not found' });
        if (userQ.rows[0].credits <= 0) {
            return res.status(400).json({ message: 'Not enough credits' });
        }

        const q = await pool.query(
            'INSERT INTO requests (resource_id, requester_id, status) VALUES ($1, $2, $3) RETURNING *',
            [resource_id, requester_id, 'pending']
        );

        // create a notification for the owner of the resource
        try {
            const r = await pool.query('SELECT user_id, title FROM resources WHERE id=$1', [resource_id]);
            if (r.rows.length) {
                const ownerId = r.rows[0].user_id;
                const title = r.rows[0].title;
                await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [ownerId, `New request for "${title}"`]);
            }
        } catch (e) {
            console.error('Failed to create notification', e.message || e);
        }
        res.status(201).json(q.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to create request' });
    }
});

// PATCH /api/requests/:id - approve or deny a request
router.patch('/:id', authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'deny'

        const rq = await client.query('SELECT * FROM requests WHERE id=$1', [id]);
        if (!rq.rows.length) return res.status(404).json({ message: 'Request not found' });

        const request = rq.rows[0];
        const resourceQ = await client.query('SELECT * FROM resources WHERE id=$1', [request.resource_id]);
        if (!resourceQ.rows.length) return res.status(404).json({ message: 'Resource not found' });
        const resource = resourceQ.rows[0];

        // Only the owner of the resource can approve/deny
        if (resource.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        if (action === 'approve') {
            await client.query('BEGIN');
            // Deduct credit from requester and add to owner
            await client.query('UPDATE users SET credits = credits - 1 WHERE id = $1', [request.requester_id]);
            await client.query('UPDATE users SET credits = credits + 1 WHERE id = $1', [resource.user_id]);
            await client.query('UPDATE requests SET status=$1 WHERE id=$2', ['approved', id]);
            await client.query('COMMIT');
            // notify requester
            try {
                await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [request.requester_id, `Your request for \"${resource.title}\" was approved.`]);
            } catch (e) { console.error('notify err', e.message || e); }
            res.json({ ok: true, status: 'approved' });
        } else {
            await client.query('UPDATE requests SET status=$1 WHERE id=$2', ['denied', id]);
            try {
                await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [request.requester_id, `Your request for \"${resource.title}\" was denied.`]);
            } catch (e) { console.error('notify err', e.message || e); }
            res.json({ ok: true, status: 'denied' });
        }
    } catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        console.error(err.message);
        res.status(500).json({ message: 'Failed to update request' });
    } finally {
        client.release();
    }
});

// GET /api/requests/owner - list requests for resources owned by the authenticated user
router.get('/owner', authMiddleware, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const q = await pool.query(
            `SELECT req.*, r.title as resource_title, u.name as requester_name FROM requests req
             JOIN resources r ON req.resource_id = r.id
             JOIN users u ON req.requester_id = u.id
             WHERE r.user_id = $1 ORDER BY req.id DESC`, [ownerId]
        );
        res.json(q.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to fetch owner requests' });
    }
});

// GET /api/requests - list requests made by the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const q = await pool.query(
            `SELECT req.*, r.title as resource_title, u.name as owner_name FROM requests req
             JOIN resources r ON req.resource_id = r.id
             JOIN users u ON r.user_id = u.id
             WHERE req.requester_id = $1 ORDER BY req.id DESC`, [userId]
        );
        res.json(q.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Failed to fetch your requests' });
    }
});

export default router;