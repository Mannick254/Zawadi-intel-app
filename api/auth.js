import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function login(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { email, password } = body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Supabase Login Error:', error.message);
    return res.status(401).json({ ok: false, message: error.message });
  }
  return res.status(200).json({
    ok: true,
    message: 'Login successful',
    user: data.user,
    session: data.session,
  });
}

async function register(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { email, password } = body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Supabase Registration Error:', error.message);
    return res.status(400).json({ ok: false, message: error.message });
  }
  if (data.user) {
    return res.status(201).json({
      ok: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      userId: data.user.id,
    });
  }
  return res.status(200).json({
    ok: true,
    message: 'Registration initiated. Please check your email to complete the process.',
  });
}

async function logout(req, res) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
  return res.status(200).json({ ok: true, message: 'Logout successful' });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { action } = req.query;
    if (action === 'login') {
      return await login(req, res);
    } else if (action === 'register') {
      return await register(req, res);
    } else if (action === 'logout') {
      return await logout(req, res);
    } else {
      return res.status(400).json({ ok: false, message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Auth Handler Error:', err);
    return res.status(500).json({ ok: false, message: 'Unexpected error during authentication.' });
  }
}
