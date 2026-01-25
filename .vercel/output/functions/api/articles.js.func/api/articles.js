import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// --- Supabase Admin Client (for Auth) ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Postgres Pool (for direct DB Operations) ---
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- Main API Handler ---
export default async function handler(req, res) {
  const { method, query, body } = req;
  const { id } = query;

  // --- Step 1: Authentication Check for protected actions ---
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, message: 'Unauthorized. Please log in.' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ ok: false, message: 'Unauthorized. Invalid token.' });
    }
    // User is authenticated, proceed.
  }

  // --- Step 2: Database Operations ---
  try {
    switch (method) {
      case 'GET':
        if (id) {
          const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
          return result.rows.length > 0
            ? res.status(200).json({ ok: true, article: result.rows[0] })
            : res.status(404).json({ ok: false, message: 'Article not found' });
        }
        const result = await pool.query('SELECT * FROM articles ORDER BY "createdAt" DESC');
        return res.status(200).json({ ok: true, articles: result.rows });

      case 'POST':
        const { title, content, imageUrl } = body || {};
        if (!title || !content) {
          return res.status(400).json({ ok: false, message: 'Title and content are required' });
        }
        const postResult = await pool.query(
          'INSERT INTO articles (title, content, "imageUrl") VALUES ($1, $2, $3) RETURNING id',
          [title, content, imageUrl]
        );
        return res.status(201).json({ ok: true, id: postResult.rows[0].id });

      case 'PUT':
        const { title: putTitle, content: putContent, imageUrl: putImageUrl } = body || {};
        if (!id || !putTitle || !putContent) {
          return res.status(400).json({ ok: false, message: 'ID, title, and content are required' });
        }
        const putResult = await pool.query(
          'UPDATE articles SET title = $1, content = $2, "imageUrl" = $3, "updatedAt" = NOW() WHERE id = $4',
          [putTitle, putContent, putImageUrl, id]
        );
        return putResult.rowCount > 0
          ? res.status(200).json({ ok: true, message: 'Article updated' })
          : res.status(404).json({ ok: false, message: 'Article not found' });

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ ok: false, message: 'Article ID is required' });
        }
        const deleteResult = await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        return deleteResult.rowCount > 0
          ? res.status(200).json({ ok: true, message: 'Article deleted' })
          : res.status(404).json({ ok: false, message: 'Article not found' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error('Database error:', err.stack || err);
    return res.status(500).json({ ok: false, message: 'Internal server error' });
  }
}
