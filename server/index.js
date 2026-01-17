/**
 * Zawadi Intel server
 * - Supabase for data storage
 * - Routes: /api/register, /api/login, /api/verify, /api/logout
 *           /api/stats, /api/articles, /api/news, /api/subscribe, /api/notify, /api/health
 * - Uses VAPID keys from .env
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const webpush = require("web-push");
const rateLimit = require("express-rate-limit");
const getSupabase = require("./supabase");

// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// --- Rate limiter for login attempts ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- VAPID Keys ---
const publicVapidKey = process.env.PUBLIC_VAPID_KEY || process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:admin@zawadiintelnews.vercel.app",
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.error("⚠️ VAPID keys missing — push notifications disabled.");
}

// --- Password Utilities ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `${iterations}:${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored) return false;
  const [iterations, salt, hash] = stored.split(":");
  if (!iterations || !salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, parseInt(iterations, 10), 64, "sha512").toString("hex");
  return hash === verifyHash;
}
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// --- Data access helpers ---
async function getUser(username) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user:", error);
    return null;
  }
  return data;
}
async function setUser(username, obj) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").insert([{ username, ...obj }]);
  if (error) console.error("Error creating user:", error);
  return data;
}
async function storeToken(token, session) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("tokens").upsert([{ token, ...session }]);
  if (error) console.error("Error storing token:", error);
  return data;
}
async function getToken(token) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("tokens").select("*").eq("token", token).single();
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching token:", error);
    return null;
  }
  return data;
}
async function deleteToken(token) {
  const supabase = getSupabase();
  const { error } = await supabase.from("tokens").delete().eq("token", token);
  if (error) console.error("Error deleting token:", error);
}
async function getStats() {
  const supabase = getSupabase();
  const { count: totalArticles } = await supabase.from("articles").select("*", { count: "exact", head: true });
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return { total: totalArticles || 0, recent: recentArticles || [] };
}
async function checkDbStatus() {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("users").select("id", { head: true, count: "exact" });
    if (error) throw error;
    return { status: "online", message: "Supabase connected" };
  } catch (error) {
    return { status: "offline", message: error.message };
  }
}

// --- Auth Middleware ---
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const session = await getToken(token);
  if (!session || new Date(session.expires) < new Date()) {
    if (session) await deleteToken(token);
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
  req.session = session;
  next();
};
const requireAdmin = (req, res, next) => {
  if (!req.session?.isAdmin) {
    return res.status(403).json({ ok: false, message: "Forbidden" });
  }
  next();
};

// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: "Username and password required" });
  const user = await getUser(username);
  if (user) return res.status(400).json({ ok: false, message: "User already exists" });
  const newUser = { password: hashPassword(password), isAdmin: false, createdAt: new Date().toISOString() };
  await setUser(username, newUser);
  res.json({ ok: true });
});
app.post("/api/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: "Username and password required" });
  let isAdmin = false;
  if (process.env.ADMIN_USERNAME && username === process.env.ADMIN_USERNAME) {
    if (password === process.env.ADMIN_PASSWORD) {
      isAdmin = true;
    } else return res.status(401).json({ ok: false, message: "Invalid credentials" });
  } else {
    const user = await getUser(username);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }
    isAdmin = user.isAdmin || false;
  }
  const token = generateToken();
  const session = { username, isAdmin, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
  await storeToken(token, session);
  res.json({ ok: true, token, isAdmin });
});
app.post("/api/verify", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ ok: false, message: "Token required" });
  const session = await getToken(token);
  if (!session || new Date(session.expires) < new Date()) {
    if (session) await deleteToken(token);
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
  session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await storeToken(token, session);
  res.json({ ok: true, session });
});
app.post("/api/logout", async (req, res) => {
  const { token } = req.body || {};
  if (token) await deleteToken(token);
  res.json({ ok: true });
});

// --- Stats Route ---
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ ok: true, stats, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to read stats" });
  }
});

// --- Articles Routes ---
app.get("/api/articles", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, articles: data });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Failed to read articles" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('articles').select('*').eq('id', req.params.id).single();
    if (error) {
        return res.status(500).json({ ok: false, message: 'Failed to read article' });
    }
    res.json({ ok: true, article: data });
});

app.post("/api/articles", requireAuth, requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    const { title, content, imageUrl } = req.body;
    const { data, error } = await supabase.from('articles').insert({ title, content, image_url: imageUrl }).select();
    if (error) {
        return res.status(500).json({ ok: false, message: 'Failed to create article' });
    }
    res.json({ ok: true, article: data[0] });
});

app.put("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    const { title, content, imageUrl } = req.body;
    const { data, error } = await supabase.from('articles').update({ title, content, image_url: imageUrl }).eq('id', req.params.id).select();
    if (error) {
        return res.status(500).json({ ok: false, message: 'Failed to update article' });
    }
    res.json({ ok: true, article: data[0] });
});

app.delete("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('articles').delete().eq('id', req.params.id);
    if (error) {
        return res.status(500).json({ ok: false, message: 'Failed to delete article' });
    }
    res.json({ ok: true });
});


    // --- Health Route ---
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = await checkDbStatus();
    const apiHealthy = true;
    const pushHealthy = publicVapidKey && privateVapidKey;

    res.status(200).json({
      ok: apiHealthy && dbStatus.status === "online" && pushHealthy,
      services: {
        api: {
          status: apiHealthy ? "online" : "offline",
          message: apiHealthy ? "✅ Operational" : "❌ API not responding"
        },
        db: dbStatus,
        notifications: {
          status: pushHealthy ? "online" : "offline",
          message: pushHealthy ? "✅ Push service active" : "❌ Currently offline"
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Health check error:", err.message);
    res.status(500).json({ ok: false, message: "Health check failed" });
  }
});

// --- Start server locally only ---
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Zawadi server listening on port ${PORT}`);
  });
}

// --- Export the app for Vercel ---
module.exports = app;
