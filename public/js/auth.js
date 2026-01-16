import { supabase } from './supabase-client.js';

let currentUser = null;
let authChecked = false;

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error);
    return { ok: false, message: error.message };
  }
  await checkAuth();
  return { ok: true, user: data.user };
}

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Registration error:', error);
    return { ok: false, message: error.message };
  }

  // Ensure a profile row exists
  await supabase.from('profiles').insert({ id: data.user.id, is_admin: false });

  return { ok: true, message: 'Registration successful! Please check your email.', user: data.user };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout failed', error);
  currentUser = null;
  authChecked = false;
  window.location.reload();
}

function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = visible ? 'block' : 'none';
}

export async function checkAuth() {
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

export async function getCurrentUser() {
  if (!authChecked) await checkAuth();
  if (!currentUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', currentUser.id)
    .single();

  if (error) {
    console.warn('Could not fetch user profile:', error.message);
    return { ...currentUser, isAdmin: false };
  }
  return { ...currentUser, isAdmin: data?.is_admin || false };
}

supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user ?? null;
  authChecked = false;
  console.log(`Supabase auth state changed: ${event}`, session);
});
