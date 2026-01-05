// admin.js

// Initialize admin UI
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
      if (warn) warn.textContent = 'Admin access required. Please sign in with an admin account.';
      if (loginSection) loginSection.style.display = 'block';
      if (registerSection) registerSection.style.display = 'block';
      if (actionsSection) actionsSection.style.display = 'none';
      if (articleSection) articleSection.style.display = 'none';
      if (pushSection) pushSection.style.display = 'none';
      return;
    }

    // Admin verified
    if (warn) warn.textContent = '';
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (actionsSection) actionsSection.style.display = 'block';
    if (articleSection) articleSection.style.display = 'block';
    if (pushSection) pushSection.style.display = 'block';

    wireAdminButtons();
  } catch (e) {
    console.warn('Admin check failed', e);
    if (warn) warn.textContent = 'Unable to verify admin status.';
  }
}

// Attach button handlers
function wireAdminButtons() {
  const refreshBtn = document.getElementById('refresh-stats');
  const clearBtn = document.getElementById('clear-local');
  const exportBtn = document.getElementById('export-recent');

  if (refreshBtn) refreshBtn.addEventListener('click', fetchStats);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear local login count? This cannot be undone.')) return;
      localStorage.removeItem('zawadi_global_count_v1');
      const localTotal = document.getElementById('total-local');
      if (localTotal) localTotal.textContent = '0';
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

// Helper: download CSV
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Fetch stats from server or fallback
async function fetchStats() {
  const warn = document.getElementById('admin-warn');
  const serverTotal = document.getElementById('total-server');
  const localTotal = document.getElementById('total-local');
  const list = document.getElementById('recent-list');

  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Server unavailable');
    const data = await res.json();

    if (serverTotal) serverTotal.textContent = data.total || 0;
    if (warn) warn.textContent = '';
    if (list) {
      list.innerHTML = '';
      (data.recent || []).forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${new Date(r.ts).toLocaleString()} — ${r.username}`;
        list.appendChild(li);
      });
    }
  } catch (e) {
    if (warn) warn.textContent = 'Server not available — showing local fallback counts.';
    if (serverTotal) serverTotal.textContent = 'n/a';
    const local = parseInt(localStorage.getItem('zawadi_global_count_v1') || '0', 10);
    if (localTotal) localTotal.textContent = local;
    if (list) list.innerHTML = '';
  }
}

// Inline admin login handler
const loginBtn = document.getElementById('admin-login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const u = document.getElementById('admin-username')?.value.trim();
    const p = document.getElementById('admin-password')?.value;
    const msg = document.getElementById('admin-login-msg');
    if (msg) msg.textContent = '';

    if (!u || !p) {
      if (msg) msg.textContent = 'Enter username and password.';
      return;
    }

    try {
      const resp = await loginUser(u, p);
      if (!resp || !resp.ok) {
        if (msg) msg.textContent = resp?.message || 'Login failed';
        return;
      }
      if (resp.isAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      if (msg) {
        msg.style.color = 'green';
        msg.textContent = 'Signed in successfully.';
      }
      await initAdmin();
      const loginSection = document.getElementById('admin-login');
      if (loginSection) loginSection.style.display = 'none';
    } catch (e) {
      console.warn('Admin login error', e);
      if (msg) msg.textContent = 'Login error';
    }
  });
}

// Inline admin registration handler
const registerBtn = document.getElementById('admin-register-btn');
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const u = document.getElementById('admin-register-username')?.value.trim();
    const p = document.getElementById('admin-register-password')?.value;
    const msg = document.getElementById('admin-register-msg');
    if (msg) msg.textContent = '';

    if (!u || !p) {
      if (msg) msg.textContent = 'Enter username and password.';
      return;
    }

    try {
      const resp = await registerUser(u, p);
      if (!resp || !resp.ok) {
        if (msg) msg.textContent = resp?.message || 'Registration failed';
        return;
      }
      if (msg) {
        msg.style.color = 'green';
        msg.textContent = 'Signed up successfully. Please sign in.';
      }
    } catch (e) {
      console.warn('Admin registration error', e);
      if (msg) msg.textContent = 'Registration error';
    }
  });
}

// Initial load
fetchStats();
initAdmin();
