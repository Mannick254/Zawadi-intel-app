/**
 * Zawadi Intel server (Supabase auth)
 * - Auth: /api/register, /api/login, /api/verify, /api/logout via Supabase
 * - Content & push: /api/stats, /api/articles, /api/news, /api/subscribe, /api/notify
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
const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

// --- Supabase client (server-side) ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
const PORT = process.env.PORT || 3001;

// --- Rate limiter for login attempts ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Local JSON fallback for non-auth data ---
const DATA_FILE = path.join(__dirname, "data.json");
function readLocalData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { total: 0, recent: [], subscriptions: [], articles: [] };
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

// --- Non-auth helpers (local JSON for now) ---
async function incrementTotal() {
  const data = readLocalData();
  data.total = (data.total || 0) + 1;
  writeLocalData(data);
}
async function pushRecent(entry) {
  const data = readLocalData();
  data.recent = data.recent || [];
  data.recent.unshift(entry);
  data.recent = data.recent.slice(0, 50);
  writeLocalData(data);
}
async function getStats() {
  const data = readLocalData();
  return { total: data.total || 0, recent: data.recent || [] };
}
async function getSubscriptions() {
  const data = readLocalData();
  return data.subscriptions || [];
}
async function addSubscription(subscription) {
  const data = readLocalData();
  data.subscriptions = data.subscriptions || [];
  data.subscriptions.push(subscription);
  writeLocalData(data);
}
async function getArticles() {
  const data = readLocalData();
  return data.articles || [];
}
async function getArticle(id) {
  const data = readLocalData();
  return (data.articles || []).find(a => a.id === id) || null;
}
async function addArticle(article) {
  const data = readLocalData();
  const newArticle = { ...article, id: crypto.randomBytes(16).toString("hex") };
  data.articles = data.articles || [];
  data.articles.push(newArticle);
  writeLocalData(data);
  return newArticle.id;
}
async function updateArticle(id, article) {
  const data = readLocalData();
  data.articles = data.articles || [];
  const index = data.articles.findIndex(a => a.id === id);
  if (index !== -1) {
    data.articles[index] = { ...data.articles[index], ...article };
    writeLocalData(data);
  }
}
async function deleteArticle(id) {
  const data = readLocalData();
  data.articles = (data.articles || []).filter(a => a.id !== id);
  writeLocalData(data);
}

// --- Auth Routes (Supabase) ---

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ ok: false, message: error.message });

    return res.json({ ok: true, user: data.user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// Login
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ ok: false, message: error.message });

    await incrementTotal();
    await pushRecent({ email, ts: Date.now() });

    return res.json({
      ok: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// Verify (JWT)
app.post("/api/verify", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ ok: false, message: "Token is required" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ ok: false, message: error.message });

    return res.json({ ok: true, user: data.user });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// Logout (server-side revoke)
app.post("/api/logout", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.json({ ok: true, message: "No token provided" });

    // Admin API can revoke a session by its token
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) return res.status(400).json({ ok: false, message: error.message });

    return res.json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// --- Health Route ---
app.get("/api/health", async (req, res) => {
  try {
    const apiHealthy = true;
    const pushHealthy = Boolean(publicVapidKey && privateVapidKey);

    // Lightweight Supabase check
    let dbHealthy = true;
    try {
      const { error } = await supabase.from("health_check").select("*").limit(1);
      if (error) dbHealthy = false;
    } catch {
      dbHealthy = false;
    }

    res.status(200).json({
      ok: apiHealthy && dbHealthy && pushHealthy,
      services: {
        api: {
          status: apiHealthy ? "online" : "offline",
          message: apiHealthy ? "✅ Operational" : "❌ API not responding"
        },
        db: {
          status: dbHealthy ? "online" : "degraded",
          message: dbHealthy ? "✅ Database healthy" : "⚠️ Experiencing latency"
        },
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

// --- Article Routes ---
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await getArticles();
    res.json(articles);
  } catch (err) {
    console.error("Articles fetch error:", err.stack || err);
    res.status(500).json({ ok: false, message: "Failed to read articles" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    const article = await getArticle(req.params.id);
    if (!article) {
      return res.status(404).json({ ok: false, message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    console.error("Article fetch error:", err.stack || err);
    res.status(500).json({ ok: false, message: "Failed to read article" });
  }
});

app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const newArticleId = await addArticle({
      title,
      content,
      imageUrl,
      createdAt: Date.now()
    });
    res.status(201).json({ ok: true, id: newArticleId });
  } catch (err) {
    console.error("Create article error:", err.stack || err);
    res.status(500).json({ ok: false, message: "Failed to create article" });
  }
});

app.put("/api/articles/:id", async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    await updateArticle(req.params.id, {
      title,
      content,
      imageUrl,
      updatedAt: Date.now()
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Update article error:", err.stack || err);
    res.status(500).json({ ok: false, message: "Failed to update article" });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete article error:", err.stack || err);
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
    res.json(data);

    if (data.articles?.length) {
      const topArticle = data.articles[0];
      const subscriptions = await getSubscriptions();

      const results = await Promise.allSettled(
        subscriptions.map(subscription => {
          const payload = JSON.stringify({
            title: "Zawadi Intel News",
            body: `${topArticle.title} — ${topArticle.description || "Tap to read more."}`,
            url: topArticle.url || "https://zawadiintelnews.vercel.app/"
          });
          return webpush.sendNotification(subscription, payload);
        })
      );

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn(`Push failed for subscription ${i}:`, r.reason);
        }
      });
    }
  } catch (err) {
    console.error("Error fetching news:", err.stack || err);
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

    await addSubscription(subscription);

    const payload = JSON.stringify({
      title: "Welcome to Zawadi Intel News!",
      body: "You are now subscribed to breaking news and updates.",
      url: "https://zawadiintelnews.vercel.app/"
    });

    webpush.sendNotification(subscription, payload).catch(err => {
      console.error("Welcome notification failed:", err.stack || err);
    });

    res.status(201).json({ ok: true, endpoint: subscription.endpoint });
  } catch (err) {
    console.error("Subscribe error:", err.stack || err);
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

    const subscriptions = await getSubscriptions();
    const results = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    const failed = results.filter(r => r.status === "rejected");
    failed.forEach((f, i) => console.warn(`Manual notify failed [${i}]:`, f.reason));

    res.status(200).json({
      ok: true,
      count: subscriptions.length,
      failedCount: failed.length
    });
  } catch (err) {
    console.error("Notify error:", err.stack || err);
    res.status(500).json({ ok: false, message: "Failed to send notifications" });
  }
});

// --- Fallback for HTML pages ---
app.get("*", (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send("Not Found");
  }
  const filePath = path.join(process.cwd(), "public", `${req.path}.html`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendFile(path.join(process.cwd(), "public", "index.html"));
    } else {
      res.sendFile(filePath);
    }
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Zawadi server listening on port ${PORT}`);
});

// Export the app for Vercel
module.exports = app;
