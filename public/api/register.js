
const supabase = require('../../server/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password: password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Supabase sends a confirmation email. The user is not signed in until they confirm.
    // If you have disabled email confirmation, this will sign the user up and sign them in.
    res.status(200).json({ ok: true, message: 'Registration successful! Please check your email to confirm.', user: data.user });

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
