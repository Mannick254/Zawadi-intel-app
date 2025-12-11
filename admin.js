// admin.js

// Ensure admin.html requires an admin user before exposing actions
async function initAdmin() {
  const warn = document.getElementById('admin-warn');
  try {
    // getCurrentUser is defined in main.js and returns null if not signed in
    const current = await getCurrentUser();
    if (!current || !current.isAdmin) {
      warn.textContent = 'Admin access required. Please sign in with an admin account.';
      // ensure login section is visible
      const loginSection = document.getElementById('admin-login');
      if (loginSection) loginSection.style.display = 'block';
      return;
    }
    // hide login and show admin actions
    const loginSection = document.getElementById('admin-login');
    if (loginSection) loginSection.style.display = 'none';
    document.getElementById('admin-actions').style.display = 'block';
  } catch (e) {
    console.warn('Admin check failed', e);
    warn.textContent = 'Unable to verify admin status.';
  }

  // wire buttons
  document.getElementById('refresh-stats').addEventListener('click', fetchStats);
  document.getElementById('clear-local').addEventListener('click', () => {
    if (!confirm('Clear local login count? This cannot be undone.')) return;
    localStorage.removeItem('zawadi_global_count_v1');
    document.getElementById('total-local').textContent = '0';
  });
  document.getElementById('export-recent').addEventListener('click', () => {
    // Try to fetch server recent list, otherwise export local placeholder
    fetch('/api/stats').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const csv = (data.recent || []).map(r => `${new Date(r.ts).toISOString()},${r.username}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'recent-logins.csv'; a.click();
      URL.revokeObjectURL(url);
    }).catch(() => {
      alert('No server data available to export.');
    });
  });
}

// existing fetchStats function
async function fetchStats() {
  const warn = document.getElementById('admin-warn');
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('no server');
    const data = await res.json();
    document.getElementById('total-server').textContent = data.total || 0;
    warn.textContent = '';
    const list = document.getElementById('recent-list');
    list.innerHTML = '';
    (data.recent || []).forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${new Date(r.ts).toLocaleString()} — ${r.username}`;
      list.appendChild(li);
    });
  } catch (e) {
    warn.textContent = 'Server not available — showing local fallback counts.';
    document.getElementById('total-server').textContent = 'n/a';
    const local = parseInt(localStorage.getItem('zawadi_global_count_v1') || '0', 10);
    document.getElementById('total-local').textContent = local;
    const list = document.getElementById('recent-list');
    list.innerHTML = '';
  }
}
fetchStats();
// initialize admin UI (checks current user and shows admin actions if allowed)
initAdmin();

// Admin inline login handler
document.getElementById('admin-login-btn').addEventListener('click', async () => {
  const u = document.getElementById('admin-username').value.trim();
  const p = document.getElementById('admin-password').value;
  const msg = document.getElementById('admin-login-msg');
  msg.textContent = '';
  if (!u || !p) { msg.textContent = 'Enter username and password.'; return; }
  try {
    const resp = await loginUser(u, p);
    if (!resp || !resp.ok) {
      msg.textContent = resp && resp.message ? resp.message : 'Login failed';
      return;
    }
    msg.style.color = 'green';
    msg.textContent = 'Signed in successfully.';
    // Re-init admin UI now that we are signed in
    await initAdmin();
    // hide the inline login form after successful sign-in
    const loginSectionAfter = document.getElementById('admin-login');
    if (loginSectionAfter) loginSectionAfter.style.display = 'none';
  } catch (e) {
    console.warn('Admin login error', e);
    msg.textContent = 'Login error';
  }
});
