
const supabase = require('../../server/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ ok: true, message: 'Logout successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
