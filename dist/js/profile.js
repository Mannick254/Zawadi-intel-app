document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('register-btn');
  const loginBtn = document.getElementById('login-btn');
  const registerMessage = document.getElementById('register-msg');
  const loginMessage = document.getElementById('login-msg');

  // Handle registration
  if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value.trim();
      registerMessage.textContent = '';

      if (!username || !password) {
        registerMessage.textContent = 'Please enter username and password.';
        registerMessage.style.color = 'red';
        return;
      }

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
          registerMessage.textContent = 'Registration successful! You can now log in.';
          registerMessage.style.color = 'green';
        } else {
          registerMessage.textContent = result.message || 'Registration failed.';
          registerMessage.style.color = 'red';
        }
      } catch (error) {
        registerMessage.textContent = 'An error occurred. Please try again.';
        registerMessage.style.color = 'red';
      }
    });
  }

  // Handle login
  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      loginMessage.textContent = '';

      if (!username || !password) {
        loginMessage.textContent = 'Please enter username and password.';
        loginMessage.style.color = 'red';
        return;
      }

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok && result.token) {
          localStorage.setItem('zawadi_auth_token_v1', result.token);
          loginMessage.textContent = 'Login successful! Redirecting...';
          loginMessage.style.color = 'green';
          window.location.href = result.isAdmin ? '/admin.html' : '/app.html';
        } else {
          loginMessage.textContent = result.message || 'Invalid credentials.';
          loginMessage.style.color = 'red';
        }
      } catch (error) {
        loginMessage.textContent = 'An error occurred. Please try again.';
        loginMessage.style.color = 'red';
      }
    });
  }
});
