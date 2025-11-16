const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}'); } catch (e) { return { total: 0, recent: [] }; }
}

function saveData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

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

// Allow serving the static site if user runs server from repo root
app.use('/', express.static(path.join(__dirname, '..')));

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  const d = loadData();
  d.users = d.users || {};
  if (d.users[username]) return res.status(400).json({ ok: false, message: 'User already exists' });
  d.users[username] = { password: hashPassword(password), isAdmin: false, createdAt: Date.now() };
  saveData(d);
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ ok: false, message: 'Username and password required' });
  const d = loadData();
  d.users = d.users || {};
  const user = d.users[username];
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  const token = generateToken();
  // Store token temporarily (in production, use a proper session store)
  d.tokens = d.tokens || {};
  d.tokens[token] = { username, isAdmin: user.isAdmin, expires: Date.now() + 24 * 60 * 60 * 1000 }; // 24h
  saveData(d);
  // Record login
  d.total = (d.total || 0) + 1;
  const entry = { username, ts: Date.now() };
  d.recent = d.recent || [];
  d.recent.unshift(entry);
  if (d.recent.length > 50) d.recent = d.recent.slice(0, 50);
  saveData(d);
  res.json({ ok: true, token, isAdmin: user.isAdmin });
});

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ ok: false });
  const d = loadData();
  d.tokens = d.tokens || {};
  const session = d.tokens[token];
  if (!session || session.expires < Date.now()) {
    if (session) delete d.tokens[token];
    saveData(d);
    return res.status(401).json({ ok: false });
  }
  res.json({ ok: true, username: session.username, isAdmin: session.isAdmin });
});

app.get('/api/stats', (req, res) => {
  const d = loadData();
  res.json({ total: d.total || 0, recent: d.recent || [] });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Zawadi server listening on ${port}`));
