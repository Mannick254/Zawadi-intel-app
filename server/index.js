
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpush = require('web-push');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: '<YOUR_DATABASE_URL>'
});

const db = admin.database();

// Configure VAPID keys
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webpush.setVapidDetails('mailto:your-email@example.com', publicVapidKey, privateVapidKey);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- API Endpoints ---

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  const usersRef = db.ref('users');
  usersRef.child(username).once('value', (snapshot) => {
    if (snapshot.exists()) {
      return res.status(400).json({ ok: false, message: 'User already exists' });
    }
    const newUser = { password: hashPassword(password), isAdmin: false, createdAt: Date.now() };
    usersRef.child(username).set(newUser);
    res.json({ ok: true });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  const usersRef = db.ref('users');
  usersRef.child(username).once('value', (snapshot) => {
    const user = snapshot.val();
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }
    const token = generateToken();
    const tokensRef = db.ref('tokens');
    const session = { username, isAdmin: user.isAdmin, expires: Date.now() + 24 * 60 * 60 * 1000 };
    tokensRef.child(token).set(session);

    const totalRef = db.ref('total');
    totalRef.transaction((current) => (current || 0) + 1);

    const recentRef = db.ref('recent');
    const newEntry = { username, ts: Date.now() };
    recentRef.transaction((current) => {
      const recent = current || [];
      recent.unshift(newEntry);
      return recent.slice(0, 50);
    });

    res.json({ ok: true, token, isAdmin: user.isAdmin });
  });
});

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ ok: false });
  const tokensRef = db.ref('tokens');
  tokensRef.child(token).once('value', (snapshot) => {
    const session = snapshot.val();
    if (!session || session.expires < Date.now()) {
      if (session) tokensRef.child(token).remove();
      return res.status(401).json({ ok: false });
    }
    res.json({ ok: true, username: session.username, isAdmin: session.isAdmin });
  });
});

app.get('/api/stats', (req, res) => {
  db.ref().once('value', (snapshot) => {
    const data = snapshot.val();
    res.json({ total: data.total || 0, recent: data.recent || [] });
  });
});

// --- Push Notifications ---

app.post('/api/save-subscription', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, message: 'Invalid subscription' });
  }
  const subscriptionsRef = db.ref('subscriptions');
  subscriptionsRef.push(subscription);
  res.json({ ok: true });
});

app.post('/api/send-notification', async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ ok: false, message: 'Title and body are required' });
  }

  const subscriptionsRef = db.ref('subscriptions');
  subscriptionsRef.once('value', async (snapshot) => {
    const subscriptions = snapshot.val() || {};
    const payload = JSON.stringify({ title, body });
    const promises = [];

    for (const key in subscriptions) {
      const sub = subscriptions[key];
      promises.push(
        webpush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410) {
            subscriptionsRef.child(key).remove();
          }
        })
      );
    }

    await Promise.all(promises);
    res.json({ ok: true });
  });
});


// --- Static file serving ---

const root = path.join(__dirname, '..');

app.get('/articles/:article', (req, res) => {
  const articleName = req.params.article;
  if (articleName && articleName.endsWith('.html')) {
    const articlePath = path.join(root, 'articles', articleName);
    if (fs.existsSync(articlePath)) {
      return res.sendFile(articlePath);
    }
  }
  res.status(404).send('Article not found');
});

app.use('/', express.static(root, {
  redirect: false,
  index: 'index.html'
}));

app.use((req, res, next) => {
  const p = path.join(root, req.path);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    return res.redirect(301, req.path + '/');
  }
  next();
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Zawadi server listening on ${port}`));
