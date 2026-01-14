// public/js/auth.js

let currentUser = null;

async function safeFetch(url, options) {
  try {
    const response = await fetch(url, options);
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

async function loginUser(username, password) {
  const result = await safeFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (result.ok && result.token) {
    localStorage.setItem('token', result.token);
    await verifyToken(result.token);
  }
  return result;
}

async function registerUser(username, password) {
  return await safeFetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

async function verifyToken(token) {
  if (!token) {
    currentUser = null;
    return;
  }
  const result = await safeFetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (result.ok && result.session) {
    currentUser = result.session;
  } else {
    currentUser = null;
    localStorage.removeItem('token');
  }
}

async function logout() {
  const token = localStorage.getItem('token');
  if (token) {
    await safeFetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  }
  localStorage.removeItem('token');
  currentUser = null;
  window.location.reload();
}

function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = visible ? 'block' : 'none';
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return;
  showLoading(true);
  await verifyToken(token);
  showLoading(false);
}
