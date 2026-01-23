// --- Auth Utilities ---
// Handles user registration, login, token management, and logout.
// Uses localStorage for demo purposes; consider secure cookies for production.

async function apiRequest(path, options) {
  try {
    const res = await fetch(path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API request error (${path}):`, err);
    return { ok: false, error: err.message };
  }
}

export async function registerUser(username, password) {
  return apiRequest('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function loginUser(username, password) {
  const data = await apiRequest('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (data.ok && data.token) {
    localStorage.setItem('authToken', data.token);
  }
  return data;
}

export async function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  const data = await apiRequest('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return data.ok ? data.session : null;
}

export async function logoutUser() {
  const token = localStorage.getItem('authToken');
  await apiRequest('/api/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  localStorage.removeItem('authToken');
}
