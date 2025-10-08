# Backend Code Examples

## Authentication (auth.js)

```javascript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

// Input validation helper
function validateRegistration(body) {
    const { name, email, password } = body;
    if (!name || !email || !password) {
        return { valid: false, message: 'All fields required' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'Password must be 6+ characters' };
    }
    return { valid: true };
}

// Register endpoint with validation
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const validation = validateRegistration(req.body);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const { name, email, password } = req.body;

        // Check existing user
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password and create user
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hash]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login with rate limiting
const loginAttempts = new Map(); // In production, use Redis
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic rate limiting
        const attempts = loginAttempts.get(email) || 0;
        if (attempts >= 5) {
            return res.status(429).json({ message: 'Too many attempts. Try again later.' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!result.rows.length) {
            loginAttempts.set(email, attempts + 1);
            return res.status(401).json({ message: 'Auth failed' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            loginAttempts.set(email, attempts + 1);
            return res.status(401).json({ message: 'Auth failed' });
        }

        // Success - clear attempts and generate token
        loginAttempts.delete(email);
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                credits: user.credits
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

export default router;
```

## Resource Management (resources.js)

```javascript
import express from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// List resources with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT r.*, u.name as owner_name 
            FROM resources r 
            JOIN users u ON r.user_id = u.id
        `;
        const params = [];

        if (category) {
            query += ' WHERE r.category = $1';
            params.push(category);
        }

        query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const q = await pool.query(query, params);
        
        // Add image_url to each resource
        const rows = q.rows.map(r => {
            const img = r.image_filename 
                ? `/uploads/${r.image_filename}`
                : `/images/${(r.category || 'default').toLowerCase()}.svg`;
            return { ...r, image_url: img };
        });

        // Get total count for pagination
        const countQ = await pool.query('SELECT COUNT(*) FROM resources' + (category ? ' WHERE category = $1' : ''), 
            category ? [category] : []);
        const total = parseInt(countQ.rows[0].count);

        res.json({
            resources: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('List resources error:', err);
        res.status(500).json({ message: 'Failed to fetch resources' });
    }
});

// Create resource with transaction
router.post('/', authMiddleware, async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, category, image_filename } = req.body;
        const userId = req.user.id;

        await client.query('BEGIN');

        // Insert resource
        const resourceQ = await client.query(
            `INSERT INTO resources (title, description, category, image_filename, user_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description, category, image_filename, userId]
        );

        // Optional: Create activity log
        await client.query(
            `INSERT INTO activity_log (user_id, action, resource_id)
             VALUES ($1, 'create_resource', $2)`,
            [userId, resourceQ.rows[0].id]
        );

        await client.query('COMMIT');
        res.status(201).json(resourceQ.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create resource error:', err);
        res.status(500).json({ message: 'Failed to create resource' });
    } finally {
        client.release();
    }
});

// Search resources
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search query required' });

        const result = await pool.query(
            `SELECT r.*, u.name as owner_name 
             FROM resources r 
             JOIN users u ON r.user_id = u.id
             WHERE r.title ILIKE $1 OR r.description ILIKE $1
             ORDER BY r.created_at DESC LIMIT 20`,
            [`%${q}%`]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: 'Search failed' });
    }
});

export default router;
```

## Upload Handling (uploads.js)

```javascript
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Upload endpoint with validation
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the filename and URL
        res.status(201).json({
            filename: req.file.filename,
            url: `/uploads/${req.file.filename}`
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Error handler for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'File too large (max 5MB)' });
        }
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

export default router;
```

## Database Setup (init.sql)

```sql
-- Users table with credits
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    credits INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources table with image support
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image_filename VARCHAR(200),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests table for resource sharing
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id),
    requester_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications for user interactions
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log for auditing
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_id INTEGER REFERENCES resources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_requests_resource_id ON requests(resource_id);
CREATE INDEX idx_requests_requester_id ON requests(requester_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- Sample data for testing
INSERT INTO users (name, email, password, credits) VALUES
('Demo User', 'demo@example.com', '$2b$10$YourHashedPasswordHere', 5),
('Test User', 'test@example.com', '$2b$10$YourHashedPasswordHere', 5);
```