
// public/js/auth.js
import { supabase } from './supabase-client.js';

let currentUser = null;
let authChecked = false;

/**
 * Login user using Supabase.
 */
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  await checkAuth(); // Refresh user state
  return { ok: true, user: data.user };
}

/**
 * Register new user using Supabase.
 */
async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // By default, Supabase sends a confirmation email. The user is not fully logged in yet.
  return { ok: true, message: 'Registration successful! Please check your email to confirm.', user: data.user };
}

/**
 * Logout user from Supabase.
 */
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout failed', error);
  }
  currentUser = null;
  window.location.reload(); // Refresh the page to clear state
}

/**
 * Show or hide a loading indicator.
 */
function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = visible ? 'block' : 'none';
}

/**
 * Check authentication status by getting the current session from Supabase.
 */
async function checkAuth() {
  if (authChecked) return;

  showLoading(true);
  const { data, error } = await supabase.auth.getSession();
  showLoading(false);

  if (error) {
    console.error('Error getting session:', error.message);
    currentUser = null;
  } else {
    currentUser = data.session?.user ?? null;
  }

  authChecked = true;
}


/**
 * Get the current user, performing an auth check if needed.
 */
async function getCurrentUser() {
  if (!authChecked) {
    await checkAuth();
  }

  if (!currentUser) return null;

  // Optionally, enrich user with data from your public 'profiles' table
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single();

  if (error) {
    // This can happen if the profile doesn't exist yet. Not necessarily a critical error.
    console.warn('Could not fetch user profile:', error.message);
    return { ...currentUser, isAdmin: false };
  }

  return { ...currentUser, isAdmin: data?.is_admin || false };
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    // You might want to trigger a UI update here if your app is a single-page application.
    // For multi-page apps, a page reload on login/logout is often sufficient.
    console.log(`Supabase auth state changed: ${event}`, session);
});
