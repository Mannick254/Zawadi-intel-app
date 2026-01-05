// --- Cache DOM elements ---
const els = {
  warn: document.getElementById('admin-warn'),
  loginSection: document.getElementById('admin-login'),
  actionsSection: document.getElementById('admin-actions'),
  articleSection: document.getElementById('article-management'),
  serverTotal: document.getElementById('total-server'),
  localTotal: document.getElementById('total-local'),
  recentList: document.getElementById('recent-list'),
  loginBtn: document.getElementById('admin-login-btn'),
  loginMsg: document.getElementById('admin-login-msg'),
};

// --- Utility: show feedback ---
function showMessage(el, text, type = 'info') {
  if (!el) return;
  el.textContent = text;
  el.style.color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'black';
}

// --- Initialize admin UI ---
async function initAdmin() {
  try {
    const current = await getCurrentUser(); // defined in main.js
    if (!current || !current.isAdmin) {
      showMessage(els.warn, 'Admin access required. Please sign in with an admin account.', 'error');
      if (els.loginSection) els.loginSection.style.display = 'block';
      if (els.actionsSection) els.actionsSection.style.display = 'none';
      if (els.articleSection) els.articleSection.style.display = 'none';
      return;
    }

    // Admin verified
    showMessage(els.warn, '');
    if (els.loginSection) els.loginSection.style.display = 'none';
    if (els.actionsSection) els.actionsSection.style.display = 'block';
    if (els.articleSection) els.articleSection.style.display = 'block';

    wireAdminButtons();
  } catch (e) {
    console.warn('Admin check failed', e);
    showMessage(els.warn, 'Unable to verify admin status.', 'error');
  }
}

// --- Attach button handlers ---
function wireAdminButtons() {
  const refreshBtn = document.getElementById('refresh-stats');
  const clearBtn = document.getElementById('clear-local');
  const exportBtn = document.getElementById('export-recent');

  if (refreshBtn) refreshBtn.addEventListener('click', fetchStats);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear local login count? This cannot be undone.')) return;
      localStorage.removeItem('zawadi_global_count_v1');
      if (els.localTotal) els.localTotal.textContent = '0';
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('No server data');
        const data = await res.json();
        const csv = (data.recent || [])
          .map(r => `${new Date(r.ts).toISOString()},${(r.username || '').replace(/,/g, ' ')}`)
          .join('\n');
        downloadCSV(csv, 'recent-logins.csv');
      } catch {
        alert('No server data available to export.');
      }
    });
  }
}

// --- Helper: download CSV ---
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Fetch stats from server or fallback ---
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Server unavailable');
    const data = await res.json();

    if (els.serverTotal) els.serverTotal.textContent = data.total || 0;
    showMessage(els.warn, '');
    if (els.recentList) {
      els.recentList.innerHTML = '';
      (data.recent || []).forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${new Date(r.ts).toLocaleString()} — ${r.username}`;
        els.recentList.appendChild(li);
      });
    }
  } catch (e) {
    showMessage(els.warn, 'Server not available — showing local fallback counts.', 'error');
    if (els.serverTotal) els.serverTotal.textContent = 'n/a';
    const local = parseInt(localStorage.getItem('zawadi_global_count_v1') || '0', 10);
    if (els.localTotal) els.localTotal.textContent = local;
    if (els.recentList) els.recentList.innerHTML = '';
  }
}

// --- Inline admin login handler ---
if (els.loginBtn) {
  els.loginBtn.addEventListener('click', async () => {
    const u = document.getElementById('admin-username')?.value.trim();
    const p = document.getElementById('admin-password')?.value;
    showMessage(els.loginMsg, '');

    if (!u || !p) {
      showMessage(els.loginMsg, 'Enter username and password.', 'error');
      return;
    }

    try {
      const resp = await loginUser(u, p);
      if (!resp || !resp.ok) {
        showMessage(els.loginMsg, resp?.message || 'Login failed', 'error');
        return;
      }
      if (resp.isAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      showMessage(els.loginMsg, 'Signed in successfully.', 'success');
      await initAdmin();
      if (els.loginSection) els.loginSection.style.display = 'none';
    } catch (e) {
      console.warn('Admin login error', e);
      showMessage(els.loginMsg, 'Login error', 'error');
    }
  });
}

// --- Initial load ---
fetchStats();
initAdmin();
