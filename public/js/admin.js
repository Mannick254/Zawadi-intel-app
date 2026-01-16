
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
    show(registerSection);
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
  const clearBtn = document.getElementById('clear-local');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear local login count? This cannot be undone.')) return;
      localStorage.removeItem('zawadi_global_count_v1');
      setText(document.getElementById('total-local'), '0');
    });
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

// =f==========================
// Initial Load
// ==========================
initAdmin();
