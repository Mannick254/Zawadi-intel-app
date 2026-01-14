// public/js/auth.js

let currentUser = null;

async function loginUser(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await response.text(); // capture raw response
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (!response.ok) {
      console.error("Login failed:", result);
      return { ok: false, message: result.message || `Error ${response.status}` };
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
      await verifyToken(result.token);
    }
    return result;
  } catch (err) {
    console.error("Login error:", err);
    return { ok: false, message: err.message };
  }
}

async function registerUser(username, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text}`);
    }

    if (!response.ok) {
      console.error("Registration failed:", result);
      return { ok: false, message: result.message || `Error ${response.status}` };
    }

    return result;
  } catch (err) {
    console.error("Register error:", err);
    return { ok: false, message: err.message };
  }
}

async function verifyToken(token) {
  if (!token) {
    currentUser = null;
    return;
  }

  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const result = await response.json();
    if (response.ok && result.session) {
      currentUser = result.session;
    } else {
      console.warn("Token verification failed:", result);
      currentUser = null;
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    currentUser = null;
  }
}

async function logout() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  localStorage.removeItem('token');
  currentUser = null;
  window.location.reload();
}

function showLoading(visible) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = visible ? 'block' : 'none';
  }
}

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return;

  showLoading(true);
  await verifyToken(token);
  showLoading(false);
}
