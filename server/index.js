/**
 * Zawadi Intel server — Vercel-ready, Supabase-only
 * - Routes: /api/register, /api/login, /api/verify, /api/logout
 *           /api/stats, /api/articles, /api/articles/:id
 *           /api/upload-image, /api/subscribe, /api/notify, /api/news
 * - Uses Supabase for persistence and storage
 * - Uses VAPID keys from .env for web-push
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const webpush = require("web-push");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const supabase = require("./supabase");

// --- Express setup ---
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

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
  console.error("VAPID keys missing — push notifications disabled. Set PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY in .env.");
}

// --- Multer memory storage for uploads (no disk writes) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- Auth helpers ---
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, message: "Missing bearer token" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ ok: false, message: "Invalid or expired token" });

    req.user = {
      id: data.user.id,
      email: data.user.email,
      isAdmin: data.user.user_metadata?.isAdmin || false,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ ok: false, message: "Admin privileges required" });
  }
  next();
}

// --- Auth Routes (Supabase) ---
app.post("/api/register", async (req, res) => {
  const { email, password, isAdmin } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password required" });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { isAdmin: !!isAdmin } }
    });

    if (error) return res.status(400).json({ ok: false, message: error.message });

    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false,
    };

    return res.json({
      ok: true,
      message: "Registration successful! Please check your email to confirm.",
      user: userInfo,
    });
  } catch (err) {
    console.error("Registration route error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ ok: false, message: error.message });

    const userInfo = {
      id: data.user?.id,
      email: data.user?.email,
      isAdmin: data.user?.user_metadata?.isAdmin || false,
    };

    return res.json({
      ok: true,
      token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: userInfo,
    });
  } catch (err) {
    console.error("Login route error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/verify", async (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(400).json({ ok: false, message: "Token is required" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ ok: false, message: "Invalid or expired token" });

    const userInfo = {
      id: data.user.id,
      email: data.user.email,
      isAdmin: data.user.user_metadata?.isAdmin || false,
    };

    return res.json({ ok: true, user: userInfo });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ ok: false, message: error.message });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Logout route error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

// --- Stats Routes (Supabase) ---
async function getStats() {
  const { data, error } = await supabase.from("stats").select("*").limit(1);
  if (error) throw error;
  const row = data?.[0] || { total: 0, recent: [] };
  return { total: row.total || 0, recent: row.recent || [] };
}

async function incrementTotalAndPushRecent(entry) {
  // Fetch current
  const { data, error } = await supabase.from("stats").select("*").limit(1);
  if (error) throw error;
  const row = data?.[0];

  if (!row) {
    const { error: insErr } = await supabase.from("stats").insert({ total: 1, recent: [entry] });
    if (insErr) throw insErr;
    return;
  }

  const recent = Array.isArray(row.recent) ? row.recent : [];
  recent.unshift(entry);
  recent.splice(50);

  const { error: updErr } = await supabase
    .from("stats")
    .update({ total: (row.total || 0) + 1, recent })
    .eq("id", row.id);

  if (updErr) throw updErr;
}

app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ ok: true, stats, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ ok: false, message: "Failed to read stats" });
  }
});

// --- Articles Routes (Supabase) ---
app.get("/api/articles", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Articles fetch error:", err);
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
    res.json(article);
  } catch (err) {
    console.error("Article fetch error:", err);
    res.status(500).json({ ok: false, message: "Failed to read article" });
  }
});

// Protect create/update/delete with auth + admin
app.post("/api/articles", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body || {};
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const { data, error } = await supabase
      .from("articles")
      .insert({ title, content, image_url: imageUrl || null })
      .select("id")
      .limit(1);
    if (error) throw error;

    await incrementTotalAndPushRecent({ type: "article_create", by: req.user.email, ts: Date.now() });

    res.status(201).json({ ok: true, id: data?.[0]?.id });
  } catch (err) {
    console.error("Create article error:", err);
    res.status(500).json({ ok: false, message: "Failed to create article" });
  }
});

app.put("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body || {};
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const { error } = await supabase
      .from("articles")
      .update({ title, content, image_url: imageUrl || null, updated_at: new Date().toISOString() })
      .eq("id", req.params.id);
    if (error) throw error;

    await incrementTotalAndPushRecent({ type: "article_update", by: req.user.email, ts: Date.now() });

    res.json({ ok: true });
  } catch (err) {
    console.error("Update article error:", err);
    res.status(500).json({ ok: false, message: "Failed to update article" });
  }
});

app.delete("/api/articles/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("articles").delete().eq("id", req.params.id);
    if (error) throw error;

    await incrementTotalAndPushRecent({ type: "article_delete", by: req.user.email, ts: Date.now() });

    res.json({ ok: true });
  } catch (err) {
    console.error("Delete article error:", err);
    res.status(500).json({ ok: false, message: "Failed to delete article" });
  }
});

// --- Image Upload to Supabase Storage ---
app.post("/api/upload-image", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No image uploaded" });

    const ext = path.extname(req.file.originalname) || ".jpg";
    const filename = `img-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filename);
    const imageUrl = publicUrlData?.publicUrl;

    res.json({ ok: true, imageUrl });
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ ok: false, message: "Failed to upload image" });
  }
});

// --- Push Subscriptions (Supabase) ---
async function getSubscriptions() {
  const { data, error } = await supabase.from("subscriptions").select("*");
  if (error) throw error;
  return data || [];
}

async function addSubscription(subscription) {
  const payload = {
    endpoint: subscription.endpoint,
    keys: subscription.keys || {},
  };
  const { error } = await supabase.from("subscriptions").insert(payload);
  if (error && !String(error.message).includes("duplicate")) throw error;
}

async function removeSubscriptionByEndpoint(endpoint) {
  const { error } = await supabase.from("subscriptions").delete().eq("endpoint", endpoint);
  if (error) console.warn("Failed to remove invalid subscription:", error.message);
}

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
      console.error("Welcome notification failed:", err);
    });

    res.status(201).json({ ok: true, endpoint: subscription.endpoint });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ ok: false, message: "Failed to save subscription" });
  }
});

app.post("/api/notify", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, body, url } = req.body || {};
    const payload = JSON.stringify({
      title: title || "Zawadi Intel News",
      body: body || "New headline just dropped!",
      url: url || "https://zawadiintelnews.vercel.app/"
    });

    const subscriptions = await getSubscriptions();
    const results = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      ))
    );

    // Prune invalid subscriptions
    await Promise.all(results.map(async (r, i) => {
      if (r.status === "rejected") {
        console.warn(`Push failed for subscription ${i}:`, r.reason?.message || r.reason);
        const endpoint = subscriptions[i]?.endpoint;
        if (endpoint) await removeSubscriptionByEndpoint(endpoint);
      }
    }));

    const failedCount = results.filter(r => r.status === "rejected").length;

    res.status(200).json({
      ok: true,
      count: subscriptions.length,
      failedCount
    });
  } catch (err) {
    console.error("Notify error:", err);
    res.status(500).json({ ok: false, message: "Failed to send notifications" });
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

      const payload = JSON.stringify({
        title: "Zawadi Intel News",
        body: `${topArticle.title} — ${topArticle.description || "Tap to read more."}`,
        url: topArticle.url || "https://zawadiintelnews.vercel.app/"
      });

      const results = await Promise.allSettled(
        subscriptions.map(sub => webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        ))
      );

      await Promise.all(results.map(async (r, i) => {
        if (r.status === "rejected") {
          console.warn(`Push failed for subscription ${i}:`, r.reason?.message || r.reason);
          const endpoint = subscriptions[i]?.endpoint;
          if (endpoint) await removeSubscriptionByEndpoint(endpoint);
        }
      }));
    }
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch news" });
  }
});

// --- Health Route ---
app.get("/api/health", async (req, res) => {
  try {
    // Lightweight Supabase check
    const { error } = await supabase.from("articles").select("id").limit(1);
    const dbHealthy = !error;
    const pushHealthy = !!(publicVapidKey && privateVapidKey);

    res.status(200).json({
      ok: dbHealthy && pushHealthy,
      services: {
        api: { status: "online", message: "✅ Operational" },
        db: { status: dbHealthy ? "online" : "degraded", message: dbHealthy ? "✅ Database healthy" : "⚠️ Experiencing issues" },
        notifications: { status: pushHealthy ? "online" : "offline", message: pushHealthy ? "✅ Push service active" : "❌ VAPID keys missing" }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ ok: false, message: "Health check failed", services: {} });
  }
});

// --- Fallback for HTML pages ---
app.get("*", (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send("Not Found");
  }
  const filePath = path.join(process.cwd(), "public", `${req.path}.html`);
  res.sendFile(filePath, err => {
    if (err) res.sendFile(path.join(process.cwd(), "public", "index.html"));
  });
});

// --- Centralized error handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, message: "Internal server error" });
});

// --- Start server locally only ---
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Zawadi server listening on port ${PORT}`);
  });
}

// --- Export for Vercel ---
module.exports = app;
