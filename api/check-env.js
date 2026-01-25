
export default function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  res.status(200).json({
    isSupabaseUrlSet: !!supabaseUrl,
    isSupabaseServiceRoleKeySet: !!serviceKey,
    message: "These are the environment variables as seen by the Vercel server. Both must be 'true' for the login to work."
  });
}
