/**
 * Robust server for Zawadi Intel
 * - Attempts Firebase initialization; if not configured, falls back to a local JSON store (server/data.json)
 * - Exposes /api/register, /api/login, /api/stats, /api/news
 * - Uses VAPID keys from PUBLIC_VAPID_KEY / PRIVATE_VAPID_KEY
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpush = require('web-push');
let admin;
let firebaseEnabled = false;

const DATA_FILE = path.join(__dirname, 'data.json');

// safe JSON read/write helpers
function readLocalData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { total: 0, recent: [], users: {}, tokens: {} };
  }
}
function writeLocalData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// try to initialize firebase-admin if possible
try {
  admin = require('firebase-admin');
  // Allow two modes:
  // 1) If service-account.json exists in server/, use it
  // 2) Else rely on application default credentials (GOOGLE_APPLICATION_CREDENTIALS)
  const svcPath = path.join(__dirname, 'service-account.json');
  if (fs.existsSync(svcPath)) {
    const serviceAccount = require(svcPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.DATABASE_URL || null
    });
    firebaseEnabled = true;
  } else {
    // application default credentials
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.DATABASE_URL || null
      });
      firebaseEnabled = true;
    } catch (err) {
      // won't break — we'll fall back to local JSON
      console.warn('Firebase application-default initialization failed, falling back to local data. Set GOOGLE_APPLICATION_CREDENTIALS or add service-account.json to enable Firebase.', err.message);
      firebaseEnabled = false;
    }
  }
} catch (err) {
  console.warn('firebase-admin not available or failed to load — falling back to local JSON store.');
  firebaseEnabled = false;
}

let db = null;
if (firebaseEnabled) {
  // prefer Realtime Database if databaseURL provided, else Firestore as last resort
  if (admin.database && admin.database().ref) {
    db = admin.database();
  } else {
    db = admin.firestore();
  }
}

// configure VAPID keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY || process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || process.env.VAPID_PRIVATE_KEY;
if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails('mailto:admin@zawadiintel.com', publicVapidKey, privateVapidKey);
} else {
  console.warn('VAPID keys not fully configured — push notifications disabled. Set PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY in .env.');
}

// password hashing utilities
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored || stored.indexOf(':') === -1) return false;
  const [salt, hash] = stored.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;

// helper wrappers for local vs firebase operations
async function getUser(username) {
  if (firebaseEnabled) {
    // Realtime DB style
    if (db.ref) {
      const snap = await db.ref(`users/${username}`).once('value');
      return snap.val();
    } else {
      // Firestore style
      const doc = await db.collection('users').doc(username).get();
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
      await db.collection('users').doc(username).set(obj);
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
      await db.collection('tokens').doc(token).set(session);
    }
  } else {
    const data = readLocalData();
    data.tokens[token] = session;
    writeLocalData(data);
  }
}
async function incrementTotal() {
  if (firebaseEnabled && db.ref) {
    await db.ref('total').transaction(current => (current || 0) + 1);
  } else if (firebaseEnabled && db.collection) {
    const metaRef = db.collection('_meta').doc('counts');
    await db.runTransaction(async (t) => {
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
    await db.ref('recent').transaction(current => {
      const arr = current || [];
      arr.unshift(entry);
      return arr.slice(0, 50);
    });
  } else if (firebaseEnabled && db.collection) {
    // store as a small array doc
    const metaRef = db.collection('_meta').doc('recent');
    await db.runTransaction(async (t) => {
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
      const [totalSnap, recentSnap] = await Promise.all([db.ref('total').once('value'), db.ref('recent').once('value')]);
      return { total: totalSnap.val() || 0, recent: recentSnap.val() || [] };
    } else {
      const metaRef1 = db.collection('_meta').doc('counts');
      const metaRef2 = db.collection('_meta').doc('recent');
      const [d1, d2] = await Promise.all([metaRef1.get(), metaRef2.get()]);
      return { total: d1.exists ? (d1.data().total || 0) : 0, recent: d2.exists ? (d2.data().recent || []) : [] };
    }
  } else {
    const data = readLocalData();
    return { total: data.total || 0, recent: data.recent || [] };
  }
}

// API endpoints
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  try {
    const user = await getUser(username);
    if (user) return res.status(400).json({ ok: false, message: 'User already exists' });
    const newUser = { password: hashPassword(password), isAdmin: false, createdAt: Date.now() };
    await setUser(username, newUser);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  try {
    const user = await getUser(username);
    if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const token = generateToken();
    const session = { username, isAdmin: user.isAdmin || false, expires: Date.now() + 24 * 60 * 60 * 1000 };
    await storeToken(token, session);

    await incrementTotal();
    await pushRecent({ username, ts: Date.now() });

    return res.json({ ok: true, token, isAdmin: user.isAdmin || false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to read stats' });
  }
});

// News proxy (optional)
app.get('/api/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'News API key not configured' });
    // Node 18+ has global fetch; otherwise, ensure node-fetch is installed or comment this out.
    const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=30&apiKey=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Zawadi server listening on port ${PORT} — Firebase enabled: ${firebaseEnabled}`);
});
