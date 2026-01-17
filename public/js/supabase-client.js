
// public/js/supabase-client.js.template
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// These placeholders will be replaced by the build script
const SUPABASE_URL = 'https://bgbwlgzyvoxfkqkwzsnh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_u3bLmtlsABP6pfTBWRL9Xw_Pw-oravR';

if (!SUPABASE_URL) {
  console.error('Supabase URL is not set. Check your environment variables and build script.');
}

if (!SUPABASE_ANON_KEY) {
  console.error('Supabase Anon Key is not set. Check your environment variables and build script.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
