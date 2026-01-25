
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

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ ok: false, message: 'Token is required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ ok: false, message: 'Invalid token' });
    }

    if (user) {
      return res.status(200).json({ ok: true, user: user });
    } else {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

  } catch (error) {
    console.error('Verify Handler Error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred during token verification.' });
  }
}
