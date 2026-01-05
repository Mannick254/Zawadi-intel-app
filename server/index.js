/**
 * Zawadi Intel server
 * - Firebase if available, else local JSON store
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

let admin;
let firebaseEnabled = false;
let db = null;

const DATA_FILE = path.join(__dirname, "data.json");

// Rate limiter for login attempts: limit repeated login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { ok: false, message: "Too many login attempts, please try again later." },
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

// --- Safe JSON helpers ---
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

// --- Firebase init (optional) ---
try {
  admin = require("firebase-admin");
  const svcPath = path.join(__dirname, "service-account.json");
  if (fs.existsSync(svcPath)) {
    const serviceAccount = require(svcPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.DATABASE_URL || null
    });
    firebaseEnabled = true;
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.DATABASE_URL || null
      });
      firebaseEnabled = true;
    } catch (err) {
      console.warn("Firebase default init failed — using local JSON.", err.message);
      firebaseEnabled = false;
    }
  }
} catch {
  console.warn("firebase-admin not available — using local JSON store.");
  firebaseEnabled = false;
}

if (firebaseEnabled) {
  if (admin.database && admin.database().ref) {
    db = admin.database(); // Realtime Database
  } else {
    db = admin.firestore(); // Firestore
  }
}

// --- VAPID keys ---
const publicVapidKey = process.env.PUBLIC_VAPID_KEY || process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || process.env.VAPID_PRIVATE_KEY;
if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails("mailto:admin@zawadiintelnews.vercel.app", publicVapidKey, privateVapidKey);
} else {
  console.warn("VAPID keys missing — push disabled. Set PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY in .env.");
}

// --- Password utilities ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
}
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// --- Express setup ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3001;

// --- Data access helpers ---
async function getUser(username) {
  if (firebaseEnabled) {
    if (db.ref) {
      const snap = await db.ref(`users/${username}`).once("value");
      return snap.val();
    } else {
      const doc = await db.collection("users").doc(username).get();
      return doc.exists ? doc.data() : null;
    }
  } else {
    const data = readLocalData();
    return data.users[username] || null;
  }
}
async function setUser(username, obj) {
  if (firebaseEnabled) {
    if (db.ref) {
      await db.ref(`users/${username}`).set(obj);
    } else {
      await db.collection("users").doc(username).set(obj);
    }
  } else {
    const data = readLocalData();
    data.users[username] = obj;
    writeLocalData(data);
  }
}
async function storeToken(token, session) {
  if (firebaseEnabled) {
    if (db.ref) {
      await db.ref(`tokens/${token}`).set(session);
    } else {
      await db.collection("tokens").doc(token).set(session);
    }
  } else {
    const data = readLocalData();
    data.tokens[token] = session;
    writeLocalData(data);
  }
}
async function incrementTotal() {
  if (firebaseEnabled && db.ref) {
    await db.ref("total").transaction(current => (current || 0) + 1);
  } else if (firebaseEnabled && db.collection) {
    const metaRef = db.collection("_meta").doc("counts");
    await db.runTransaction(async t => {
      const doc = await t.get(metaRef);
      const current = doc.exists ? (doc.data().total || 0) : 0;
      t.set(metaRef, { total: current + 1 }, { merge: true });
    });
  } else {
    const data = readLocalData();
    data.total = (data.total || 0) + 1;
    writeLocalData(data);
  }
}
async function pushRecent(entry) {
  if (firebaseEnabled && db.ref) {
    await db.ref("recent").transaction(current => {
      const arr = current || [];
      arr.unshift(entry);
      return arr.slice(0, 50);
    });
  } else if (firebaseEnabled && db.collection) {
    const metaRef = db.collection("_meta").doc("recent");
    await db.runTransaction(async t => {
      const doc = await t.get(metaRef);
      const arr = doc.exists ? (doc.data().recent || []) : [];
      arr.unshift(entry);
      arr.splice(50);
      t.set(metaRef, { recent: arr }, { merge: true });
    });
  } else {
    const data = readLocalData();
    data.recent = data.recent || [];
    data.recent.unshift(entry);
    data.recent = data.recent.slice(0, 50);
    writeLocalData(data);
  }
}
async function getStats() {
  if (firebaseEnabled) {
    if (db.ref) {
      const [totalSnap, recentSnap] = await Promise.all([
        db.ref("total").once("value"),
        db.ref("recent").once("value")
      ]);
      return { total: totalSnap.val() || 0, recent: recentSnap.val() || [] };
    } else {
      const metaRef1 = db.collection("_meta").doc("counts");
      const metaRef2 = db.collection("_meta").doc("recent");
      const [d1, d2] = await Promise.all([metaRef1.get(), metaRef2.get()]);
      return {
        total: d1.exists ? (d1.data().total || 0) : 0,
        recent: d2.exists ? (d2.data().recent || []) : []
      };
    }
  } else {
    const data = readLocalData();
    return { total: data.total || 0, recent: data.recent || [] };
  }
}
async function getSubscriptions() {
  if (firebaseEnabled) {
    if (db.ref) {
      const snap = await db.ref("subscriptions").once("value");
      return snap.val() || [];
    } else {
      const snapshot = await db.collection("subscriptions").get();
      return snapshot.docs.map(doc => doc.data());
    }
  } else {
    const data = readLocalData();
    return data.subscriptions || [];
  }
}
async function addSubscription(subscription) {
  if (firebaseEnabled) {
    if (db.ref) {
      await db.ref("subscriptions").push(subscription);
    } else {
      await db.collection("subscriptions").add(subscription);
    }
  } else {
    const data = readLocalData();
    data.subscriptions.push(subscription);
    writeLocalData(data);
  }
}

async function getArticles() {
  if (firebaseEnabled) {
    if (db.ref) {
      const snap = await db.ref("articles").once("value");
      return snap.val() || [];
    } else {
      const snapshot = await db.collection("articles").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } else {
    const data = readLocalData();
    return data.articles || [];
  }
}

async function getArticle(id) {
  if (firebaseEnabled) {
    if (db.ref) {
      const snap = await db.ref(`articles/${id}`).once("value");
      return snap.val();
    } else {
      const doc = await db.collection("articles").doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
  } else {
    const data = readLocalData();
    return (data.articles || []).find(a => a.id === id) || null;
  }
}

async function addArticle(article) {
  if (firebaseEnabled) {
    if (db.ref) {
      const newArticleRef = db.ref("articles").push();
      await newArticleRef.set({ ...article, id: newArticleRef.key });
      return newArticleRef.key;
    } else {
      const newArticleRef = await db.collection("articles").add(article);
      return newArticleRef.id;
    }
  } else {
    const data = readLocalData();
    const newArticle = { ...article, id: crypto.randomBytes(16).toString("hex") };
    data.articles = data.articles || [];
    data.articles.push(newArticle);
    writeLocalData(data);
    return newArticle.id;
  }
}

async function updateArticle(id, article) {
  if (firebaseEnabled) {
    if (db.ref) {
      await db.ref(`articles/${id}`).update(article);
    } else {
      await db.collection("articles").doc(id).update(article);
    }
  } else {
    const data = readLocalData();
    data.articles = data.articles || [];
    const index = data.articles.findIndex(a => a.id === id);
    if (index !== -1) {
      data.articles[index] = { ...data.articles[index], ...article };
      writeLocalData(data);
    }
  }
}
// --- Delete Article Helper ---
async function deleteArticle(id) {
  if (firebaseEnabled) {
    if (db.ref) {
      await db.ref(`articles/${id}`).remove();
    } else {
      await db.collection("articles").doc(id).delete();
    }
  } else {
    const data = readLocalData();
    data.articles = (data.articles || []).filter(a => a.id !== id);
    writeLocalData(data);
  }
}

// --- Routes ---
app.get("/api/health", (req, res) => {
  res.json({ ok: true, firebaseEnabled });
});

// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password required" });
  }
  try {
    const user = await getUser(username);
    if (user) return res.status(400).json({ ok: false, message: "User already exists" });
    const newUser = { password: hashPassword(password), isAdmin: false, createdAt: Date.now() };
    await setUser(username, newUser);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password required" });
  }
  try {
    let isAdmin = false;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      isAdmin = true;
    } else {
      const user = await getUser(username);
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ ok: false, message: "Invalid credentials" });
      }
      isAdmin = user.isAdmin || false;
    }

    const token = generateToken();
    const session = { username, isAdmin, expires: Date.now() + 24 * 60 * 60 * 1000 };
    await storeToken(token, session);

    await incrementTotal();
    await pushRecent({ username, ts: Date.now() });

    return res.json({ ok: true, token, isAdmin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// --- Stats Route ---
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await getStats();
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to read stats" });
  }
});

// --- Article Routes ---
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await getArticles();
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to read articles" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    const article = await getArticle(req.params.id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ ok: false, message: "Article not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to read article" });
  }
});

app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    const newArticleId = await addArticle({ title, content, imageUrl, createdAt: Date.now() });
    res.status(201).json({ ok: true, id: newArticleId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to create article" });
  }
});

app.put("/api/articles/:id", async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({ ok: false, message: "Title and content are required" });
    }
    await updateArticle(req.params.id, { title, content, imageUrl, updatedAt: Date.now() });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Failed to update article" });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
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

    if (data.articles && data.articles.length > 0) {
      const topArticles = data.articles.slice(0, 3);
      const subscriptions = await getSubscriptions();

      await Promise.allSettled(
        subscriptions.map(subscription => {
          const payload = JSON.stringify({
            title: "Zawadi Intel News",
            body: `${topArticles[0].title} — ${topArticles[0].description || "Tap to read more."}`,
            url: topArticles[0].url || "https://zawadiintelnews.vercel.app/"
          });
          return webpush.sendNotification(subscription, payload);
        })
      );
    }
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ ok: false, message: "Failed to fetch news" });
  }
});

// --- Push Subscription ---
app.post("/api/subscribe", async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
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

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
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
    await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    res.status(200).json({ ok: true, count: subscriptions.length });
  } catch (err) {
    console.error("Notify error:", err);
    res.status(500).json({ ok: false, message: "Failed to send notifications" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Zawadi server listening on port ${PORT} — Firebase enabled: ${firebaseEnabled}`);
});
