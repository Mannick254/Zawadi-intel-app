
async function registerUser(username, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    return { ok: false, message: 'An error occurred during registration.' };
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    return { ok: false, message: 'An error occurred during login.' };
  }
}

async function logoutUser() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    return { ok: false, message: 'An error occurred during logout.' };
  }
}
