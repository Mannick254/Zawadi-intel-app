
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    res.status(200).json({ ok: true, token: data.session.access_token, session: data.session });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
