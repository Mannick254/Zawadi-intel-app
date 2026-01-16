// server/routes/login.js
const supabase = require('../../server/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Return only safe fields and token
    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false,
    };

    res.status(200).json({
      ok: true,
      token: data.session?.access_token,
      user: userInfo,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
