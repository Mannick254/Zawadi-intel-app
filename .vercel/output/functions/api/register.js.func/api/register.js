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

  // The client sends 'username', but Supabase Auth requires 'email'.
  // We will use the username as the email.
  const { username: email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }

  try {
    // Sign up the new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Handle cases like the user already being registered
      console.error('Supabase SignUp Error:', error.message);
      return res.status(409).json({ ok: false, message: error.message });
    }

    // Supabase sends a confirmation email by default.
    // For this app, we will assume immediate success if no error occurs.
    if (data.user) {
       return res.status(201).json({ ok: true, message: 'User registered successfully. Please check your email to confirm.' });
    } else {
       return res.status(500).json({ ok: false, message: 'Registration failed for an unknown reason.' });
    }

  } catch (error) {
    console.error('Register Handler Error:', error);
    return res.status(500).json({ ok: false, message: 'An unexpected error occurred during registration.' });
  }
}
