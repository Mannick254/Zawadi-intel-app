export async function registerUser(username, password) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  }
  
  export async function loginUser(username, password) {
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
  }
  
  export async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    return data.ok ? data.session : null;
  }
  
  export async function logoutUser() {
    const token = localStorage.getItem('authToken');
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    localStorage.removeItem('authToken');
  }
  