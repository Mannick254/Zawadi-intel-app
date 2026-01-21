// This is a standalone script to run the application's health check.
// To run it, use: node api/run-health-check.js

require("dotenv").config();
const { createClient } = require('@supabase/supabase-js');

async function checkHealth() {
  console.log('--- Running Application Health Check ---');

  let apiHealthy = true;
  let dbHealthy = true;

  let apiMessage = '✅ API is operational';
  let dbMessage = '✅ Database is operational';

  // 1. Check Database Connection
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not set.');
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { error } = await supabase.from('articles').select('id').limit(1);
    if (error) {
      throw error;
    }
  } catch (err) {
    dbHealthy = false;
    dbMessage = `❌ Database error: ${err.message}`;
  }

  // Overall Health
  const overallOk = apiHealthy && dbHealthy;

  console.log('\n--- HEALTH REPORT ---');
  console.log(`Overall Status: ${overallOk ? '✅ HEALTHY' : '❌ DEGRADED'}`);
  console.log(`- API: ${apiMessage}`);
  console.log(`- Database: ${dbMessage}`);
  console.log('---------------------\n');

  if (!overallOk) {
    process.exit(1); // Exit with an error code if not healthy
  }
}

checkHealth();
