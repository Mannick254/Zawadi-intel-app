
// public/js/auth.js

/**
 * Logs in a user.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The response from the server.
 */
async function loginUser(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem('token', result.token);
  }
  return result;
}

/**
 * Registers a new user.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The response from the server.
 */
async function registerUser(username, password) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  return response.json();
}

/**
 * Gets the current user from the server.
 * @returns {Promise<object|null>} - The current user or null if not logged in.
 */
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    const result = await response.json();
    return result.ok ? result : null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
