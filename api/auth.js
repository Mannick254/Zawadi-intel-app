// --- Auth Utilities ---
// These functions interact with your serverless API endpoints for user auth.
// They handle errors gracefully and manage tokens in localStorage.

export async function registerUser(username, password) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(`Register failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Register error:', err);
    return { ok: false, error: err.message };
  }
}

export async function loginUser(username, password) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const data = await res.json();
    if (data.ok && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: err.message };
  }
}

export async function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error(`Verify failed: ${res.status}`);
    const data = await res.json();
    return data.ok ? data.session : null;
  } catch (err) {
    console.error('Auth check error:', err);
    return null;
  }
}

export async function logoutUser() {
  const token = localStorage.getItem('authToken');
  try {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn('Logout request failed:', err);
  } finally {
    localStorage.removeItem('authToken');
  }
}
