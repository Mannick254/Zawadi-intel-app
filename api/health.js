import { createClient } from '@supabase/supabase-js';

// --- Supabase client (server-side) ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- VAPID Keys ---
const publicVapidKey = process.env.PUBLIC_VAPID_KEY || process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || process.env.VAPID_PRIVATE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const apiHealthy = true;
  const pushHealthy = Boolean(publicVapidKey && privateVapidKey);

  let dbHealthy = true;
  let dbMessage = '✅ Database healthy';
  let latencyMs = null;

  try {
    const start = Date.now();
    // Try a lightweight query instead of RPC ping
    const { error } = await supabase.from('articles').select('id').limit(1);
    latencyMs = Date.now() - start;

    if (error) {
      dbHealthy = false;
      dbMessage = `⚠️ Supabase error: ${error.message}`;
    }
  } catch (err) {
    dbHealthy = false;
    dbMessage = `⚠️ DB connection failed: ${err.message}`;
  }

  const overallOk = apiHealthy && dbHealthy && pushHealthy;

  res.status(overallOk ? 200 : 503).json({
    ok: overallOk,
    services: {
      api: { status: 'online', message: '✅ Operational' },
      db: { status: dbHealthy ? 'online' : 'degraded', message: dbMessage, latencyMs },
      notifications: {
        status: pushHealthy ? 'online' : 'offline',
        message: pushHealthy ? '✅ Push service active' : '❌ VAPID keys not configured'
      }
    },
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
}
