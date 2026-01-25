import { createClient } from '@supabase/supabase-js';

// Use anon key for auth
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body || {};

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
  } catch (err) {
    console.error('Registration Handler Error:', err);
    return res.status(500).json({ ok: false, message: 'Unexpected error during registration.' });
  }
}
