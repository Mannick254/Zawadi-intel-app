
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

  // The client sends 'username', but Supabase Auth uses 'email'.
  // We'll treat the incoming 'username' as the 'email'.
  const { username: email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Registration Error:', error.message);
      return res.status(400).json({ ok: false, message: error.message || 'Registration failed' });
    }

    // Supabase returns a user object on successful signup
    if (data.user) {
        // You can decide what you want to return to the client.
        // For security reasons, it's often best not to return the full user object.
        return res.status(201).json({
          ok: true,
          message: 'Registration successful. Please check your email to confirm your account.',
          // You might choose to return some non-sensitive info, e.g., user ID
          userId: data.user.id,
        });
    } else {
      // This case handles situations where sign up doesn't return a user but doesn't throw an error either
      // (e.g., if email confirmation is required, the user object might be in the session but not directly returned).
      return res.status(200).json({ 
        ok: true, 
        message: 'Registration initiated. Please check your email to complete the process.' 
      });
    }

  } catch (error) {
    console.error('Registration Handler Error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred during registration.' });
  }
}
