// api/register.js (for Vercel serverless functions)
// or server/routes/register.js (for Express)

import supabase from '../../server/supabase.js'; // use `require` if CommonJS

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, isAdmin } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { isAdmin: !!isAdmin } // optional metadata
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ message: error.message });
    }

    // Return only safe fields
    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false,
    };

    return res.status(200).json({
      ok: true,
      message: 'Registration successful! Please check your email to confirm.',
      user: userInfo,
    });
  } catch (err) {
    console.error('Registration route error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
