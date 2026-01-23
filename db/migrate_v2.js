
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function migrate() {
  // Directly using the known correct components for the connection
  const pool = new Pool({
    user: 'postgres',
    password: 'Welcome@40229772',
    host: 'db.bgbwlgzyvoxfkqkwzsnh.supabase.co',
    port: 5432,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  let client;
  try {
    client = await pool.connect();
    console.log('Connected to the database successfully.');

    const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('Database schema applied successfully. The "articles" table has been created.');

  } catch (err) {
    console.error('Error during database migration:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.release();
      console.log('Database connection closed.');
    }
    await pool.end();
  }
}

migrate();
