import { createClient } from '@supabase/supabase-js';

// ✅ Use anon key (safe for auth), not service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body || {};

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password are required' });
    }

    // Attempt login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      return res.status(401).json({ ok: false, message: error.message });
    }

    // Return session + user info
    return res.status(200).json({
      ok: true,
      message: 'Login successful',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login Handler Error:', err);
    return res.status(500).json({ ok: false, message: 'Unexpected error during login.' });
  }
}
