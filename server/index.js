const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{}'); } catch (e) { return { total: 0, recent: [] }; }
}

function saveData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Allow serving the static site if user runs server from repo root
app.use('/', express.static(path.join(__dirname, '..')));

app.post('/api/login', (req, res) => {
  const d = loadData();
  d.total = (d.total || 0) + 1;
  const entry = { username: req.body.username || 'anonymous', ts: req.body.ts || Date.now() };
  d.recent = d.recent || [];
  d.recent.unshift(entry);
  if (d.recent.length > 50) d.recent = d.recent.slice(0, 50);
  saveData(d);
  res.json({ ok: true, total: d.total });
});

app.get('/api/stats', (req, res) => {
  const d = loadData();
  res.json({ total: d.total || 0, recent: d.recent || [] });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Zawadi server listening on ${port}`));
