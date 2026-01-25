import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // The client must send its access token in the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate the token and get the user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn('Auth user lookup failed:', error?.message);
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    // The original app used 'username'. Supabase auth uses 'email'.
    // We will return the email as the username for client compatibility.
    // We'll also default 'isAdmin' to false, as this isn't in the default Supabase user.
    const responsePayload = {
      ok: true,
      username: user.email,
      isAdmin: user.app_metadata?.isAdmin || false,
      createdAt: user.created_at,
    };

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error('User endpoint error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred.' });
  }
}
