import { createClient } from '@supabase/supabase-js';

// --- Supabase client (server-side) ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

  if (supabase) {
    try {
      const start = Date.now();
      const { error } = await supabase.from('articles').select('id').limit(1);
      latencyMs = Date.now() - start;

      if (error) {
        dbHealthy = false;
        dbMessage = `⚠️ Supabase error: ${error.message}`;
        console.error('Supabase error:', error);
      }
    } catch (err) {
      dbHealthy = false;
      dbMessage = `⚠️ DB connection failed: ${err.message}`;
      console.error('DB connection failed:', err);
    }
  } else {
    dbHealthy = false;
    dbMessage = '❌ Supabase client not initialized (missing URL or key)';
  }

  const overallOk = apiHealthy && dbHealthy && pushHealthy;

  res.status(overallOk ? 200 : 503).json({
    ok: overallOk,
    services: {
      api: { status: apiHealthy ? 'online' : 'offline', message: '✅ Operational' },
      db: { status: dbHealthy ? 'online' : 'degraded', message: dbMessage, latencyMs },
      notifications: {
        status: pushHealthy ? 'online' : 'offline',
        message: pushHealthy
          ? '✅ Push service active'
          : '❌ VAPID keys not configured'
      }
    },
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
}
