const { Pool } = require('pg');
const { postgresUrl } = require('./config.js');

async function testDb() {
  const connectionString = postgresUrl;
  if (!connectionString || connectionString === 'your_connection_string_here') {
    console.log('Please update the postgresUrl in config.js with your actual connection string.');
    return;
  }
  
  console.log('Connecting to your PostgreSQL database...');
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    client.release();
  } catch (e) {
    console.error('Failed to connect to PostgreSQL.');
    console.error('Please check your postgresUrl in config.js and ensure your database is running and accessible.');
    console.error('\nError details:', e.message);
  } finally {
    await pool.end();
  }
}

testDb();
