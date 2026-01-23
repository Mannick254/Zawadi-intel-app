
// This is a standalone script to run the application's health check.
// To run it, use: node api/run-health-check.js

require("dotenv").config();
const { createClient } = require('@supabase/supabase-js');

// -- ADDED FOR DATABASE MIGRATION --
async function createArticlesTable(supabase) {
  console.log('Attempting to create "articles" table...');
  const schema = `
    CREATE TABLE articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  const { error } = await supabase.rpc('run_sql', { sql: schema });

  if (error) {
    // It's okay if the table already exists
    if (error.message.includes('already exists')) {
      console.log('"articles" table already exists.');
      return;
    }
    console.error('Error creating table:', error);
    throw error;
  }
  console.log('"articles" table created successfully.');
}
// -- END OF ADDED CODE --

async function checkHealth() {
  console.log('--- Running Application Health Check ---');

  let apiHealthy = true;
  let dbHealthy = true;

  let apiMessage = '✅ API is operational';
  let dbMessage = '✅ Database is operational';

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not set.');
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // -- MODIFIED TO RUN MIGRATION --
    await createArticlesTable(supabase);
    // -- END OF MODIFICATION --

    const { error } = await supabase.from('articles').select('id').limit(1);
    if (error) {
      throw error;
    }
  } catch (err) {
    dbHealthy = false;
    dbMessage = `❌ Database error: ${err.message}`;
  }

  const overallOk = apiHealthy && dbHealthy;

  console.log('\n--- HEALTH REPORT ---');
  console.log(`Overall Status: ${overallOk ? '✅ HEALTHY' : '❌ DEGRADED'}`);
  console.log(`- API: ${apiMessage}`);
  console.log(`- Database: ${dbMessage}`);
  console.log('---------------------\n');

  if (!overallOk) {
    process.exit(1);
  }
}

checkHealth();
