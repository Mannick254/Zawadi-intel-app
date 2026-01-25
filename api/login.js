
import './config.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // The client sends 'username', but Supabase Auth uses 'email'.
  const { username: email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      return res.status(401).json({ ok: false, message: error.message || 'Invalid login credentials' });
    }

    if (data.session) {
      return res.status(200).json({ 
        ok: true, 
        message: 'Login successful', 
        session: data.session 
      });
    } else {
      return res.status(401).json({ ok: false, message: 'Invalid login credentials' });
    }

  } catch (error) {
    console.error('Login Handler Error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred during login.' });
  }
}
