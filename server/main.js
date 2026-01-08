// server.js
// Zawadi Intel — refined Node.js + Express backend
// Features: Auth (Firebase Admin), JWT, NewsAPI proxy, Cloudinary uploads, Web Push,
// CORS, security headers, logging, environment config, structured error handling.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const admin = require('firebase-admin');
const webpush = require('web-push');

// Use global fetch in Node 18+; fallback for older versions
let fetchFn = global.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = require('node-fetch');
}

const app = express();

/* ===========================
   Configuration
=========================== */
const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const WEBPUSH_CONTACT = process.env.WEBPUSH_CONTACT || 'mailto:admin@example.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://zawadiintelnews.vercel.app';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ===========================
   Middleware
=========================== */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* ===========================
   Firebase Admin
=========================== */
let firestore = null;
let firebaseReady = false;

try {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = serviceAccountJson ? JSON.parse(serviceAccountJson) : require('./service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined
  });

  firestore = admin.firestore();
  firebaseReady = true;
  console.log('Firebase Admin initialized.');
} catch (err) {
  console.warn('Firebase Admin SDK could not be initialized:', err.message);
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
    if (!NEWS_API_KEY) return res.status(500).json({ error: 'News API key not configured' });

    const { language = 'en', pageSize = '30', country, category } = req.query;
    const params = new URLSearchParams({ language, pageSize, apiKey: NEWS_API_KEY });
    if (country) params.set('country', country);
    if (category) params.set('category', category);

    const url = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
    const response = await fetchFn(url);
    const data = await response.json();

    if (data.status !== 'ok') return res.status(502).json({ error: 'Failed to fetch news', details: data });
    res.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

/* ===========================
   Routes — Authentication
=========================== */
app.post('/api/register', async (req, res) => {
  if (!ensureFirebase(res)) return;
  try {
    const { username, password } = req.body;
    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      return res.status(400).json({ ok: false, message: 'Invalid username or password' });
    }
    const user = await admin.auth().createUser({ uid: username, password });
    res.json({ ok: true, uid: user.uid });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ ok: false, message: 'Invalid username or password' });
  }

  const isAdmin = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  if (isAdmin) {
    const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ ok: true, token, isAdmin: true });
  }

  if (!ensureFirebase(res)) return;
  try {
    const userRecord = await admin.auth().getUser(username);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    res.json({ ok: true, token, isAdmin: false });
  } catch {
    res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
});

app.post('/api/verify', async (req, res) => {
  const { token } = req.body;
  if (!isNonEmptyString(token)) return res.status(400).json({ ok: false, message: 'Invalid token' });

  try {
    const decodedJwt = jwt.verify(token, JWT_SECRET);
    if (decodedJwt.isAdmin) {
      return res.json({ ok: true, username: decodedJwt.username, isAdmin: true });
    }
  } catch {
    if (ensureFirebase(res)) {
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        return res.json({ ok: true, username: decodedFirebase.uid, isAdmin: false });
      } catch {
        return res.status(401).json({ ok: false, message: 'Invalid token' });
      }
    }
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
    await firestore.collection('logins').add({ username, timestamp: new Date(ts) });
    const snapshot = await firestore.collection('logins').get();
    res.json({ ok: true, totalLogins: snapshot.size, source: 'server' });
  } catch (error) {
    console.error('Failed to record login:', error);
    res.status(500).json({ ok: false, message: 'Failed to record login' });
  }
});

/* ===========================
   Routes — Cloudinary Upload (continued)
=========================== */
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No image uploaded' });

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'zawadi-news',
      resource_type: 'image',
      overwrite: false,
      use_filename: true,
      unique_filename: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // auto-optimize for performance
      ]
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ ok: false, message: error.message });
      }
      // Return secure URL and basic metadata
      return res.json({
        ok: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    }
  );

  stream.end(req.file.buffer);
});

/* ===========================
   Routes — Web Push (persist subscription placeholder)
=========================== */
app.post('/save-subscription', async (req, res) => {
  if (!pushReady) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }

  try {
    const subscription = req.body;
    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {
      return res.status(400).json({ error: 'Invalid subscription payload' });
    }

    // TODO: Persist subscription per user in Firestore
    // Example:
    // if (ensureFirebase(res)) {
    //   await firestore.collection('subscriptions').add({ subscription, createdAt: new Date() });
    // }

    const payload = JSON.stringify({
      title: 'Zawadi Intel',
      body: 'You will now receive notifications for new articles.'
    });

    await webpush.sendNotification(subscription, payload);
    res.status(201).json({ message: 'Subscription saved.' });
  } catch (error) {
    console.error('Error saving subscription:', error);
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
