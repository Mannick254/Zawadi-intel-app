// --- Auth Helpers ---

// Register new user
async function registerUser(username, password) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch (err) {
    console.error('Register error:', err);
    return { ok: false, message: 'Registration failed.' };
  }
}

// Login user and persist token
async function loginUser(username, password) {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.ok && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, message: 'Login failed.' };
  }
}

// Verify current session and get user data
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.ok ? data.session : null;
  } catch (err) {
    console.error('Auth check error:', err);
    return null;
  }
}

// Logout user and clear token
async function logoutUser() {
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    localStorage.removeItem('authToken');
    return await res.json();
  } catch (err) {
    console.error('Logout error:', err);
    return { ok: false, message: 'Logout failed.' };
  }
}

// Expose functions to the global scope
window.registerUser = registerUser;
window.loginUser = loginUser;
window.getCurrentUser = getCurrentUser;
window.logoutUser = logoutUser;
