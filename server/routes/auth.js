import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) =>{
    try {
        const {name, email, password} = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const insert = await pool.query(
            'INSERT INTO users (name, email, password, credits) VALUES ($1, $2, $3, $4) RETURNING id, name, email, credits',
            [name, email, hashed, 10]
        );
        const user = insert.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password} = req.body;
        const userQ = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!userQ.rows.length) {
            return res.status(400).json({message: 'Invalid credentials' });
        }
        
        const user = userQ.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match){
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET);
        res.json({ user: {id: user.id, name: user.name, email: user.email, credits:user.credits}, token});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Login Failed' });
    }
});

export default router;