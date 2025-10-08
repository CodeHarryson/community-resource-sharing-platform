import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

// Load init.sql and execute only the INSERT statements (safe to run against an existing DB)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySeeds() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'init.sql'), 'utf8');
    // Simple approach: extract INSERT INTO notifications and INSERT INTO resources/users lines
    const inserts = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean).filter(s => /INSERT INTO/i.test(s) || /CREATE TABLE IF NOT EXISTS notifications/i.test(s));
    for (const stmt of inserts) {
      try {
        await pool.query(stmt);
        console.log('Executed:', stmt.split('\n')[0]);
      } catch (e) {
        console.error('Skipped/failed:', e.message || e);
      }
    }
  } catch (err) {
    console.error('Failed to read init.sql', err.message || err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

applySeeds();
