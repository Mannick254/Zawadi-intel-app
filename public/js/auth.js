
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
    if (result.user) {
      localStorage.setItem('zawadi_current_user_v1', JSON.stringify(result.user));
    }
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
 * Gets the current user from the server by verifying the token.
 * If the token is invalid, it will be removed from localStorage.
 * @returns {Promise<object|null>} - The current user object or null if not logged in.
 */
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.removeItem('zawadi_current_user_v1');
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
    if (result.ok && result.user) {
      localStorage.setItem('zawadi_current_user_v1', JSON.stringify(result.user));
      return result.user;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('zawadi_current_user_v1');
      return null;
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('zawadi_current_user_v1');
    return null;
  }
}

/**
 * Logs out the current user by removing the token and user data from localStorage.
 */
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('zawadi_current_user_v1');
  console.log('User logged out successfully.');
}
