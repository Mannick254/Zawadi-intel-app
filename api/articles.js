const { Pool } = require('pg');
const crypto = require('crypto');
const { verifyToken } = require('../utils/auth-utils');

// --- Vercel Postgres Configuration ---
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// --- Helper to ensure the table exists ---
async function ensureTableExists() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(32) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        imageUrl VARCHAR(255),
        createdAt BIGINT,
        updatedAt BIGINT
      );
    `);
  } finally {
    client.release();
  }
}

// --- Helper to parse JSON body ---
async function parseBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

// --- Main Handler for /api/articles ---
module.exports = async (req, res) => {
  const { method } = req;
  const { id } = req.query;

  try {
    await ensureTableExists();
  } catch (err) {
    console.error("Database connection/table creation error:", err.stack || err);
    return res.status(500).json({ ok: false, message: "Failed to connect to the database." });
  }

  // --- AUTHENTICATION CHECK for protected routes ---
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const session = verifyToken(req);
    if (!session) {
      return res.status(401).json({ ok: false, message: "Unauthorized. Please log in." });
    }
  }

  switch (method) {
    case 'GET':
      try {
        if (id) {
          const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
          if (result.rows.length > 0) {
            return res.status(200).json({ article: result.rows[0] });
          } else {
            return res.status(404).json({ ok: false, message: "Article not found" });
          }
        } else {
          const result = await pool.query('SELECT * FROM articles ORDER BY createdAt DESC');
          return res.status(200).json({ articles: result.rows });
        }
      } catch (err) {
        console.error("Article fetch error:", err.stack || err);
        return res.status(500).json({ ok: false, message: "Failed to read articles from database" });
      }

    case 'POST':
      try {
        const body = await parseBody(req);
        const { title, content, imageUrl } = body;
        if (!title?.trim() || !content?.trim()) {
          return res.status(400).json({ ok: false, message: "Title and content are required" });
        }
        const newId = crypto.randomBytes(16).toString("hex");
        const createdAt = Date.now();
        await pool.query(
          'INSERT INTO articles (id, title, content, imageUrl, createdAt) VALUES ($1, $2, $3, $4, $5)',
          [newId, title, content, imageUrl, createdAt]
        );
        return res.status(201).json({ ok: true, id: newId });
      } catch (err) {
        console.error("Create article error:", err.stack || err);
        return res.status(500).json({ ok: false, message: "Failed to create article in database" });
      }

    case 'PUT':
      try {
        const body = await parseBody(req);
        const articleId = id;
        const { title, content, imageUrl } = body;
        if (!articleId || !title?.trim() || !content?.trim()) {
          return res.status(400).json({ ok: false, message: "ID, title, and content are required" });
        }
        const updatedAt = Date.now();
        const result = await pool.query(
          'UPDATE articles SET title = $1, content = $2, imageUrl = $3, updatedAt = $4 WHERE id = $5',
          [title, content, imageUrl, updatedAt, articleId]
        );
        if (result.rowCount > 0) {
          return res.status(200).json({ ok: true, message: "Article updated" });
        } else {
          return res.status(404).json({ ok: false, message: "Article not found" });
        }
      } catch (err) {
        console.error("Update article error:", err.stack || err);
        return res.status(500).json({ ok: false, message: "Failed to update article in database" });
      }

    case 'DELETE':
      try {
        const articleId = id;
        if (!articleId) {
          return res.status(400).json({ ok: false, message: "Article ID is required" });
        }
        const result = await pool.query('DELETE FROM articles WHERE id = $1', [articleId]);
        if (result.rowCount > 0) {
          return res.status(200).json({ ok: true, message: "Article deleted" });
        } else {
          return res.status(404).json({ ok: false, message: "Article not found" });
        }
      } catch (err) {
        console.error("Delete article error:", err.stack || err);
        return res.status(500).json({ ok: false, message: "Failed to delete article from database" });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
};
