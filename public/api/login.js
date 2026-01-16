// api/login.js (for Vercel serverless functions)
// or server/routes/login.js (for Express)

import supabase from '../../server/supabase.js'; // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ message: error.message });
    }

    // Return safe user info only
    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false,
    };

    return res.status(200).json({
      ok: true,
      token: data.session?.access_token,
      user: userInfo,
    });
  } catch (err) {
    console.error('Login route error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
