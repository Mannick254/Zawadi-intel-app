import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // The client must send its access token in the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Get the user associated with the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      // This is not a critical error. The token might be expired or invalid.
      // From the client's perspective, they are now logged out.
      console.warn('Logout attempt with an invalid token:', userError.message);
      return res.status(200).json({ ok: true, message: 'Logout successful (token already invalid).' });
    }

    if (!user) {
       return res.status(404).json({ ok: false, message: 'User not found for the provided token.' });
    }

    // 2. Invalidate all of the user's refresh tokens
    const { error: signOutError } = await supabase.auth.admin.signOutUser(user.id);

    if (signOutError) {
      console.error('Supabase SignOut Error:', signOutError.message);
      return res.status(500).json({ ok: false, message: `Server error during logout: ${signOutError.message}` });
    }

    return res.status(200).json({ ok: true, message: 'Logout successful.' });

  } catch (error) {
    console.error('Logout Handler Error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred during logout.' });
  }
}
