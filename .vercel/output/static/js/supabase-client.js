
// public/js/supabase-client.js.template
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// These placeholders will be replaced by the build script
const SUPABASE_URL = "https://bgbwlgzyvoxfkqkwzsnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYndsZ3p5dm94Zmtxa3d6c25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzY4OTMsImV4cCI6MjA4NDA1Mjg5M30.FNet5nkxPWm0rv3hLosv0NjvG5SL5IsAlt5HdtnO0f8";

if (!SUPABASE_URL) {
  console.error('Supabase URL is not set. Check your environment variables and build script.');
}

if (!SUPABASE_ANON_KEY) {
  console.error('Supabase Anon Key is not set. Check your environment variables and build script.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
