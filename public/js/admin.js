// ==========================
// Utility Functions
// ==========================
function show(el) {
  if (el) el.style.display = 'block';
}
function hide(el) {
  if (el) el.style.display = 'none';
}
function setText(el, text, color = '') {
  if (el) {
    el.textContent = text;
    if (color) el.style.color = color;
  }
}

// ==========================
// Initialize Admin UI
// ==========================
async function initAdmin() {
  const warn = document.getElementById('admin-warn');
  const loginSection = document.getElementById('admin-login');
  const registerSection = document.getElementById('admin-register');
  const actionsSection = document.getElementById('admin-actions');
  const articleSection = document.getElementById('article-management');
  const pushSection = document.getElementById('push-notifications');

  try {
    const current = await getCurrentUser(); // defined in main.js
    if (!current || !current.isAdmin) {
      setText(warn, 'Admin access required. Please sign in with an admin account.');
      show(loginSection);
      show(registerSection);
      hide(actionsSection);
      hide(articleSection);
      hide(pushSection);
      return;
    }

    // Admin verified
    setText(warn, '');
    hide(loginSection);
    hide(registerSection);
    show(actionsSection);
    show(articleSection);
    show(pushSection);

    wireAdminButtons();
  } catch (e) {
    console.warn('Admin check failed', e);
    setText(document.getElementById('admin-warn'), 'Unable to verify admin status.');
  }
}

// ==========================
// Button Handlers
// ==========================
function wireAdminButtons() {
  const refreshBtn = document.getElementById('refresh-stats');
  const clearBtn = document.getElementById('clear-local');
  const exportBtn = document.getElementById('export-recent');

  if (refreshBtn) refreshBtn.addEventListener('click', fetchStats);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear local login count? This cannot be undone.')) return;
      localStorage.removeItem('zawadi_global_count_v1');
      setText(document.getElementById('total-local'), '0');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('No server data');
        const data = await res.json();
        const csv = (data.recent || [])
          .map(r => `${new Date(r.ts).toISOString()},${r.username}`)
          .join('\n');
        downloadCSV(csv, 'recent-logins.csv');
      } catch {
        alert('No server data available to export.');
      }
    });
  }
}

// ==========================
// Helper: download CSV
// ==========================
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==========================
// Fetch Stats
// ==========================
async function fetchStats() {
  const warn = document.getElementById('admin-warn');
  const serverTotal = document.getElementById('total-server');
  const localTotal = document.getElementById('total-local');
  const list = document.getElementById('recent-list');

  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Server unavailable');
    const data = await res.json();

    setText(serverTotal, data.total || 0);
    setText(warn, '');
    if (list) {
      list.innerHTML = '';
      (data.recent || []).forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${new Date(r.ts).toLocaleString()} — ${r.username}`;
        list.appendChild(li);
      });
    }
  } catch (e) {
    setText(warn, 'Server not available — showing local fallback counts.');
    setText(serverTotal, 'n/a');
    const local = parseInt(localStorage.getItem('zawadi_global_count_v1') || '0', 10);
    setText(localTotal, local);
    if (list) list.innerHTML = '';
  }
}

// ==========================
// Inline Admin Login
// ==========================
const loginBtn = document.getElementById('admin-login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const u = document.getElementById('admin-username')?.value.trim();
    const p = document.getElementById('admin-password')?.value;
    const msg = document.getElementById('admin-login-msg');
    setText(msg, '');

    if (!u || !p) {
      setText(msg, 'Enter username and password.');
      return;
    }

    try {
      const resp = await loginUser(u, p); // must be defined elsewhere
      if (!resp || !resp.ok) {
        setText(msg, resp?.message || 'Login failed');
        return;
      }
      if (resp.isAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      setText(msg, 'Signed in successfully.', 'green');
      await initAdmin();
      hide(document.getElementById('admin-login'));
    } catch (e) {
      console.warn('Admin login error', e);
      setText(msg, 'Login error');
    }
  });
}

// ==========================
// Inline Admin Registration
// ==========================
const registerBtn = document.getElementById('admin-register-btn');
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const u = document.getElementById('admin-register-username')?.value.trim();
    const p = document.getElementById('admin-register-password')?.value;
    const msg = document.getElementById('admin-register-msg');
    setText(msg, '');

    if (!u || !p) {
      setText(msg, 'Enter username and password.');
      return;
    }

    try {
      const resp = await registerUser(u, p); // must be defined elsewhere
      if (!resp || !resp.ok) {
        setText(msg, resp?.message || 'Registration failed');
        return;
      }
      setText(msg, 'Signed up successfully. Please sign in.', 'green');
    } catch (e) {
      console.warn('Admin registration error', e);
      setText(msg, 'Registration error');
    }
  });
}

// ==========================
// Initial Load
// ==========================
fetchStats();
initAdmin();
