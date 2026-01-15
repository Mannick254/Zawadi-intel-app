// public/js/auth.js

let currentUser = null;

/**
 * Safe wrapper around fetch with JSON parsing and error handling.
 */
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      cache: 'no-store' // avoid cached responses
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Invalid JSON response (status ${response.status})`);
    }

    if (!response.ok) {
      return { ok: false, message: result.message || `Error ${response.status}` };
    }
    return result;
  } catch (err) {
    console.error(`Request to ${url} failed:`, err);
    return { ok: false, message: err.message };
  }
}

/**
 * Login user and store token.
 */
async function loginUser(username, password) {
  const result = await safeFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (result.ok && result.token) {
    localStorage.setItem('token', result.token);
    await verifyToken(result.token);
  }
  return result;
}

/**
 * Register new user.
 */
async function registerUser(username, password) {
  return await safeFetch('/api/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

/**
 * Verify token and update currentUser.
 */
async function verifyToken(token) {
  if (!token) {
    currentUser = null;
    return;
  }
  const result = await safeFetch('/api/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  });

  if (result.ok && result.session) {
    currentUser = result.session;
  } else {
    currentUser = null;
    localStorage.removeItem('token');
  }
}

/**
 * Logout user and clear token.
 */
async function logout() {
  const token = localStorage.getItem('token');
  if (token) {
    await safeFetch('/api/logout', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }
  localStorage.removeItem('token');
  currentUser = null;
  window.location.reload();
}

/**
 * Show or hide loading indicator.
 */
function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = visible ? 'block' : 'none';
}

/**
 * Check authentication status on page load.
 */
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return;
  showLoading(true);
  await verifyToken(token);
  showLoading(false);
}
