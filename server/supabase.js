// server/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the URL and Anon key from environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
