import { Pool } from 'pg';
import crypto from 'crypto';
import { verifyToken } from '../utils/auth-utils.js';

// --- Postgres Pool (reused across invocations) ---
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- Main Handler ---
export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // --- AUTH CHECK ---
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const session = verifyToken(req);
    if (!session) {
      return res.status(401).json({ ok: false, message: 'Unauthorized. Please log in.' });
    }
  }

  try {
    switch (method) {
      case 'GET': {
        if (id) {
          const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
          if (result.rows.length > 0) {
            return res.status(200).json({ article: result.rows[0] });
          }
          return res.status(404).json({ ok: false, message: 'Article not found' });
        }
        const result = await pool.query('SELECT * FROM articles ORDER BY createdAt DESC');
        return res.status(200).json({ articles: result.rows });
      }

      case 'POST': {
        const { title, content, imageUrl } = req.body || {};
        if (!title?.trim() || !content?.trim()) {
          return res.status(400).json({ ok: false, message: 'Title and content are required' });
        }
        const newId = crypto.randomBytes(16).toString('hex');
        const createdAt = Date.now();
        await pool.query(
          'INSERT INTO articles (id, title, content, imageUrl, createdAt) VALUES ($1, $2, $3, $4, $5)',
          [newId, title, content, imageUrl, createdAt]
        );
        return res.status(201).json({ ok: true, id: newId });
      }

      case 'PUT': {
        const { title, content, imageUrl } = req.body || {};
        if (!id || !title?.trim() || !content?.trim()) {
          return res.status(400).json({ ok: false, message: 'ID, title, and content are required' });
        }
        const updatedAt = Date.now();
        const result = await pool.query(
          'UPDATE articles SET title = $1, content = $2, imageUrl = $3, updatedAt = $4 WHERE id = $5',
          [title, content, imageUrl, updatedAt, id]
        );
        if (result.rowCount > 0) {
          return res.status(200).json({ ok: true, message: 'Article updated' });
        }
        return res.status(404).json({ ok: false, message: 'Article not found' });
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ ok: false, message: 'Article ID is required' });
        }
        const result = await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        if (result.rowCount > 0) {
          return res.status(200).json({ ok: true, message: 'Article deleted' });
        }
        return res.status(404).json({ ok: false, message: 'Article not found' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error('Database error:', err.stack || err);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
}
