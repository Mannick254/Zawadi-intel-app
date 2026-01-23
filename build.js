
// supabase-client-build.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file (for local dev)
dotenv.config();

// Validate required environment variables
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

// Define paths
const templatePath = path.resolve('public/js/supabase-client.js.template');
const outputPath = path.resolve('public/js/supabase-client.js');

// Read template
try {
  const template = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  const result = template
    .replace(/__SUPABASE_URL__/g, SUPABASE_URL)
    .replace(/__SUPABASE_ANON_KEY__/g, SUPABASE_ANON_KEY);

  // Write output
  fs.writeFileSync(outputPath, result, 'utf8');
  console.log(`✅ Supabase client generated at ${outputPath}`);
} catch (err) {
  console.error(`❌ Error processing Supabase client template:`, err);
  process.exit(1);
}
