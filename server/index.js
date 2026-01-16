/**
 * Zawadi Intel server
 * - Supabase for data storage
 * - Routes: /api/register, /api/login, /api/stats, /api/news, /api/subscribe, /api/notify
 * - Uses VAPID keys from .env
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const webpush = require("web-push");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const supabase = require('./supabase');

const DATA_FILE = path.join(__dirname, "data.json");

// Rate limiter for login attempts: limit repeated login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { ok: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

// --- Safe JSON helpers (fallback) ---
function readLocalData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { total: 0, recent: [], users: {}, tokens: {}, subscriptions: [], articles: [] };
  }
}
function writeLocalData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

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
  console.error("VAPID keys missing — push notifications disabled. Set PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY in .env.");
}

// --- Password Utilities ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000; // modern recommended minimum
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

// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
const PORT = process.env.PORT || 3001;

// --- Multer setup for image uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'images'))
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// --- Data access helpers ---
async function getUser(username) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row expected, but 0 rows returned"
        console.error('Error fetching user:', error);
        return null;
    }
    return data;
}
async function setUser(username, obj) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ username, ...obj }]);
    if (error) {
        console.error('Error creating user:', error);
    }
    return data;
}
async function storeToken(token, session) {
    const { data, error } = await supabase
        .from('tokens')
        .insert([{ token, ...session }]);
     if (error) {
        console.error('Error storing token:', error);
    }
    return data;
}

async function getToken(token) {
    const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching token:', error);
        return null;
    }
    return data;
}

async function deleteToken(token) {
    const { data, error } = await supabase
        .from('tokens')
        .delete()
        .eq('token', token);
    if (error) {
        console.error('Error deleting token:', error);
    }
    return data;
}

async function incrementTotal() {
    // This is more complex in Supabase and would likely involve a stored procedure
    // for atomicity. For now, we'll skip implementing this correctly.
}
async function pushRecent(entry) {
    // Similar to incrementTotal, this requires more complex logic in Supabase
    // to maintain a capped list.
}
async function getStats() {
    // This would require separate queries for total and recent.
    return { total: 0, recent: [] };
}
async function getSubscriptions() {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }
    return data.map(s => s.subscription);
}
async function addSubscription(subscription) {
    const { data, error } = await supabase.from('subscriptions').insert([{ subscription }]);
    if (error) {
        console.error('Error adding subscription:', error);
    }
}

async function getArticles() {
    const { data, error } = await supabase.from('articles').select('*');
    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data;
}

async function getArticle(id) {
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching article:', error);
        return null;
    }
    return data;
}

async function addArticle(article) {
    const { data, error } = await supabase.from('articles').insert([article]).select();
    if (error) {
        console.error('Error adding article:', error);
        return null;
    }
    return data[0].id;
}

async function updateArticle(id, article) {
    const { data, error } = await supabase.from('articles').update(article).eq('id', id);
    if (error) {
        console.error('Error updating article:', error);
    }
}
// --- Delete Article Helper ---
async function deleteArticle(id) {
    const { data, error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
        console.error('Error deleting article:', error);
    }
}

// Check database connection status
async function checkDbStatus() {
    try {
        const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
        if(error) throw error;
        return { status: 'online', message: 'Supabase connected' };
    } catch (error) {
        return { status: 'offline', message: error.message };
    }
}
// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password required" });
  }
  try {
    const user = await getUser(username);
    if (user) return res.status(400).json({ ok: false, message: "User already exists" });
    const newUser = { password: hashPassword(password), isAdmin: false, createdAt: new Date().toISOString() };
    await setUser(username, newUser);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password required" });
  }
  try {
    let isAdmin = false;
    if (process.env.ADMIN_USERNAME && username === process.env.ADMIN_USERNAME) {
      if (password === process.env.ADMIN_PASSWORD) {
        isAdmin = true;
      } else {
        return res.status(401).json({ ok: false, message: "Invalid credentials" });
      }
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

    return res.json({ ok: true, token, isAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/verify", async (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ ok: false, message: "Token is required" });
  }
  try {
    const session = await getToken(token);
    if (!session || new Date(session.expires) < new Date()) {
      if (session) await deleteToken(token);
      return res.status(401).json({ ok: false, message: "Invalid or expired token" });
    }
    session.expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await storeToken(token, session);
    return res.json({ ok: true, session });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/logout", async (req, res) => {
  const { token } = req.body || {};
  if (token) {
    try {
      await deleteToken(token);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
  return res.json({ ok: true });
});

app.get("/api/test-db", async (req, res) => {
      try {
        const username = 'testuser-' + Date.now();
        const password = 'testpassword';
        const newUser = { password: hashPassword(password), isAdmin: false, createdAt: new Date().toISOString() };
        const result = await setUser(username, newUser);
        res.json({ ok: true, result });
      } catch (err) {
        console.error('DB test error:', err);
        res.status(500).json({ ok: false, message: "DB test failed", error: err.message });
      }
    });


// --- Image Upload Route ---
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No image uploaded' });
  }
  res.json({ ok: true, imageUrl: `/images/${req.file.filename}` });
});

// --- Health Route ---
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = await checkDbStatus();
    const apiHealthy = true;
    const pushHealthy = publicVapidKey && privateVapidKey;

    res.status(200).json({
      ok: apiHealthy && dbStatus.status === 'online' && pushHealthy,
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
    console.error("Health check error:", err.stack || err);
    res.status(500).json({
      ok: false,
      message: "Health check failed",
      services: {}
    });
  }
});


// --- Stats Route ---
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json({
      ok: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Stats error:", err.stack || err);
    res.status(500).json({
      ok: false,
      message: "Failed to read stats"
    });
  }
});

// --- Article Routes (Supabase) ---
app.get("/api/articles", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, articles: data });
  } catch (err) {
    console.error("Articles fetch error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to read articles" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", req.params.id)
      .limit(1);
    if (error) throw error;
    const article = data?.[0];
    if (!article) return res.status(404).json({ ok: false, message: "Article not found" });
    res.json({ ok: true, article });
  } catch (err) {
    console.error("Article fetch error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to read article" });
  }
});

// Protect create/update/delete with auth + admin
app.post("/api/articles", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const { data, error } = await supabase
      .from("articles")
      .insert({ title, content, image_url: imageUrl || null })
      .select("id")
      .limit(1);
    if (error) throw error;
    res.status(201).json({ ok: true, id: data?.[0]?.id });
  } catch (err) {
    console.error("Create article error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to create article" });
  }
});

app.put("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const { error } = await supabase
      .from("articles")
      .update({ title, content, image_url: imageUrl || null, updated_at: new Date().toISOString() })
      .eq("id", req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error("Update article error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to update article" });
  }
});

app.delete("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("articles").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete article error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to delete article" });
  }
});

// --- News Route with Push ---
app.get("/api/news", async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, message: "News API key not configured" });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`
    );
    const data = await response.json();
    res.json({ ok: true, news: data });

    if (data.articles?.length) {
      const topArticle = data.articles[0];
      const { data: subscriptions, error } = await supabase.from("subscriptions").select("*");
      if (error) throw error;

      const payload = JSON.stringify({
        title: "Zawadi Intel News",
        body: `${topArticle.title} — ${topArticle.description || "Tap to read more."}`,
        url: topArticle.url || "https://zawadiintelnews.vercel.app/"
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub =>
          webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        )
      );

      // prune invalid subs
      await Promise.all(results.map(async (r, i) => {
        if (r.status === "rejected") {
          console.warn(`Push failed for subscription ${i}:`, r.reason?.message || r.reason);
          const endpoint = subscriptions[i]?.endpoint;
          if (endpoint) await supabase.from("subscriptions").delete().eq("endpoint", endpoint);
        }
      }));
    }
  } catch (err) {
    console.error("Error fetching news:", err.message);
    res.status(500).json({ ok: false, message: "Failed to fetch news" });
  }
});

// --- Push Subscription ---
app.post("/api/subscribe", async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ ok: false, message: "Invalid subscription" });
    }

    // Save subscription in Supabase
    const { error } = await supabase.from("subscriptions").insert({
      endpoint: subscription.endpoint,
      keys: subscription.keys || {}
    });
    if (error && !String(error.message).includes("duplicate")) {
      throw error;
    }

    // Send welcome notification
    const payload = JSON.stringify({
      title: "Welcome to Zawadi Intel News!",
      body: "You are now subscribed to breaking news and updates.",
      url: "https://zawadiintelnews.vercel.app/"
    });

    webpush.sendNotification(subscription, payload).catch(err => {
      console.error("Welcome notification failed:", err.message);
    });

    res.status(201).json({ ok: true, endpoint: subscription.endpoint });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to save subscription" });
  }
});

// --- Manual Notify ---
app.post("/api/notify", async (req, res) => {
  try {
    const { title, body, url } = req.body || {};
    const payload = JSON.stringify({
      title: title || "Zawadi Intel News",
      body: body || "New headline just dropped!",
      url: url || "https://zawadiintelnews.vercel.app/"
    });

    // Fetch subscriptions from Supabase
    const { data: subscriptions, error } = await supabase.from("subscriptions").select("*");
    if (error) throw error;

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        )
      )
    );

    // Remove invalid subscriptions
    await Promise.all(results.map(async (r, i) => {
      if (r.status === "rejected") {
        console.warn(`Push failed for subscription ${i}:`, r.reason?.message || r.reason);
        const endpoint = subscriptions[i]?.endpoint;
        if (endpoint) {
          await supabase.from("subscriptions").delete().eq("endpoint", endpoint);
        }
      }
    }));

    res.status(200).json({
      ok: true,
      count: subscriptions.length,
      failedCount: results.filter(r => r.status === "rejected").length
    });
  } catch (err) {
    console.error("Notify error:", err.message);
    res.status(500).json({ ok: false, message: "Failed to send notifications" });
  }
});

// --- Fallback for HTML pages ---
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not Found');
  }
  const filePath = path.join(process.cwd(), 'public', `${req.path}.html`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    } else {
      res.sendFile(filePath);
    }
  });
});

// --- Start server locally only ---
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Zawadi server listening on port ${PORT}`);
  });
}

// --- Export the app for Vercel ---
module.exports = app;
