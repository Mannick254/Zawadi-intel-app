
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bgbwlgzyvoxfkqkwzsnh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYndsZ3p5dm94Zmtxa3d6c25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzY4OTMsImV4cCI6MjA4NDA1Mjg5M30.FNet5nkxPWm0rv3hLosv0NjvG5SL5IsAlt5HdtnO0f8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error('Error signing up:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error('Error signing in:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

export async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
