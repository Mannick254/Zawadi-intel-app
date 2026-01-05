// server.js
// Zawadi Intel — refined Node.js + Express server
// Features: Auth (Firebase Admin), login activity (Firestore), NewsAPI proxy, Web Push,
// CORS, security headers, logging, environment config, and structured error handling.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const path = require('path');

// Use global fetch in Node 18+; fallback to node-fetch for older versions
let fetchFn = global.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = require('node-fetch');
}

const admin = require('firebase-admin');
const webpush = require('web-push');

const app = express();

/* ===========================
   Configuration
=========================== */
const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const WEBPUSH_CONTACT = process.env.WEBPUSH_CONTACT || 'mailto:admin@example.com';

// CORS: tighten as needed
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

/* ===========================
   Middleware
=========================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Serve static files (e.g., public/admin.html)
app.use(express.static(path.join(__dirname, 'public')));

/* ===========================
   Firebase Admin
=========================== */
let firestore = null;
let firebaseReady = false;

try {
  // Service account is intentionally not committed; use env or local file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account.json';
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Prefer env for DB URL; optional for Firestore-only apps
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined
  });

  firestore = admin.firestore();
  firebaseReady = true;
  console.log('Firebase Admin initialized.');
} catch (err) {
  console.warn('Firebase Admin SDK could not be initialized. Some features will be disabled.');
}

/* ===========================
   Web Push (VAPID)
=========================== */
let pushReady = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(WEBPUSH_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    pushReady = true;
    console.log('Web Push VAPID configured.');
  } catch (err) {
    console.warn('Failed to configure Web Push VAPID:', err.message);
  }
} else {
  console.warn('VAPID keys not set. Push notifications disabled.');
}

/* ===========================
   Utilities
=========================== */
const ensureFirebase = (res) => {
  if (!firebaseReady) {
    res.status(503).json({ ok: false, message: 'Firebase not initialized' });
    return false;
  }
  return true;
};

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isTimestampMs = (v) => typeof v === 'number' && v > 0;

/* ===========================
   Routes — News API Proxy
=========================== */
app.get('/api/news', async (req, res) => {
  try {
    if (!NEWS_API_KEY) {
      return res.status(500).json({ error: 'News API key not configured' });
    }

    const { language = 'en', pageSize = '30', country, category } = req.query;

    // Build query parameters safely
    const params = new URLSearchParams({
      language: String(language),
      pageSize: String(pageSize),
      apiKey: NEWS_API_KEY
    });

    if (country) params.set('country', String(country));
    if (category) params.set('category', String(category));

    const url = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
    const response = await fetchFn(url);
    const data = await response.json();

    // Forward status and error from NewsAPI when present
    if (data.status !== 'ok') {
      return res.status(502).json({ error: 'Failed to fetch news', details: data });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/* ===========================
   Routes — Authentication
=========================== */

// Register user (Firebase Admin)
app.post('/api/register', async (req, res) => {
  if (!ensureFirebase(res)) return;

  try {
    const { username, password } = req.body;

    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      return res.status(400).json({ ok: false, message: 'Invalid username or password' });
    }

    // Use uid = username; you can change to email-based flows if preferred
    const user = await admin.auth().createUser({
      uid: username,
      password
    });

    res.json({ ok: true, uid: user.uid });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Login user — simplified (no password verification here)
// In production, prefer Firebase Client SDK on the frontend (email/password)
// or implement a secure custom auth flow (hash + verify).
app.post('/api/login', async (req, res) => {
  if (!ensureFirebase(res)) return;

  try {
    const { username } = req.body;

    if (!isNonEmptyString(username)) {
      return res.status(400).json({ ok: false, message: 'Invalid username' });
    }

    const userRecord = await admin.auth().getUser(username);
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Adjust isAdmin logic as needed (e.g., via custom claims)
    res.json({ ok: true, token, isAdmin: false });
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
});

// Verify Firebase ID token
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // limit each IP to 30 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/verify', authLimiter, async (req, res) => {
  if (!ensureFirebase(res)) return;

  try {
    const { token } = req.body;

    if (!isNonEmptyString(token)) {
      return res.status(400).json({ ok: false, message: 'Invalid token' });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // isAdmin could come from custom claims (decoded.admin === true)
    res.json({ ok: true, username: decoded.uid, isAdmin: Boolean(decoded.admin) || false });
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Invalid token' });
  }
});

/* ===========================
   Routes — Login Activity
=========================== */
app.post('/api/login-activity', async (req, res) => {
  if (!ensureFirebase(res)) return;

  try {
    const { username, ts } = req.body;

    if (!isNonEmptyString(username) || !isTimestampMs(ts)) {
      return res.status(400).json({ ok: false, message: 'Invalid username or timestamp' });
    }

    const loginRef = firestore.collection('logins').doc();
    await loginRef.set({
      username,
      timestamp: new Date(ts)
    });

    const snapshot = await firestore.collection('logins').get();
    res.json({ ok: true, totalLogins: snapshot.size, source: 'server' });
  } catch (error) {
    console.error('Failed to record login:', error);
    res.status(500).json({ ok: false, message: 'Failed to record login' });
  }
});

/* ===========================
   Routes — Web Push
=========================== */
app.post('/save-subscription', async (req, res) => {
  if (!pushReady) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }

  try {
    const subscription = req.body;

    // Lightweight validation
    if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    // TODO: Persist subscription per user (Firestore or DB)
    const payload = JSON.stringify({
      title: 'Zawadi Intel',
      body: 'You will now receive notifications for new articles.'
    });

    await webpush.sendNotification(subscription, payload);
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    // Handle typical Web Push errors (410 Gone, etc.)
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

/* ===========================
   Health & Info
=========================== */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    firebase: firebaseReady,
    push: pushReady,
    newsApi: Boolean(NEWS_API_KEY),
    timestamp: new Date().toISOString()
  });
});

/* ===========================
   Start server
=========================== */
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
