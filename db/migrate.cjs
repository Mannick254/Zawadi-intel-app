
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function migrate() {
  if (!process.env.POSTGRES_URL) {
    console.error('Error: POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  const connectionString = process.env.POSTGRES_URL;
  
  // Manually parse the connection string to handle special characters in the password
  // Format: postgresql://[user]:[password]@[host]:[port]/[database]
  const protocol = 'postgresql://';
  const rest = connectionString.substring(protocol.length);
  
  const lastAt = rest.lastIndexOf('@');
  const userInfo = rest.substring(0, lastAt);
  const hostInfo = rest.substring(lastAt + 1);
  
  const firstColon = userInfo.indexOf(':');
  const user = userInfo.substring(0, firstColon);
  const password = userInfo.substring(firstColon + 1);

  const portColon = hostInfo.indexOf(':');
  const host = hostInfo.substring(0, portColon);
  
  const portAndDb = hostInfo.substring(portColon + 1);
  const slash = portAndDb.indexOf('/');
  const port = portAndDb.substring(0, slash);
  const database = portAndDb.substring(slash + 1);

  const pool = new Pool({
    user,
    password,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false },
  });

  let client;
  try {
    client = await pool.connect();
    console.log('Connected to the database.');

    const sql = await fs.readFile(path.join(__dirname, 'schema_v2.sql'), 'utf8');
    await client.query(sql);
    console.log('Database schema applied successfully.');

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
