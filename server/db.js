import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;


export const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'resources_db',
    password: process.env.DB_PASSWORD || 'yourpassword',
    port: Number(process.env.DB_PORT) || 5432,
});