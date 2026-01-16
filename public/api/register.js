
// server/routes/register.js
const supabase = require('../../server/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, isAdmin } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // optional metadata to flag admin accounts
        data: { isAdmin: !!isAdmin }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Return only safe fields, not the full user object
    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false
    };

    res.status(200).json({
      ok: true,
      message: 'Registration successful! Please check your email to confirm.',
      user: userInfo
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
