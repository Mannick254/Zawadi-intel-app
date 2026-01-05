document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const registerMessage = document.getElementById('register-message');
  const loginMessage = document.getElementById('login-message');

  // Utility: show feedback messages
  function showMessage(el, message, type = 'info') {
    if (!el) return;
    el.textContent = message;
    el.style.color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'black';
  }

  // --- Handle registration ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value.trim();
      showMessage(registerMessage, '');

      if (!username || !password) {
        showMessage(registerMessage, 'Username and password are required.', 'error');
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
          showMessage(registerMessage, 'Registration successful! You can now log in.', 'success');
          registerForm.reset();
        } else {
          showMessage(registerMessage, result.message || 'Registration failed.', 'error');
        }
      } catch (error) {
        showMessage(registerMessage, 'An error occurred. Please try again.', 'error');
        console.error('Registration error:', error);
      }
    });
  }

  // --- Handle login ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      showMessage(loginMessage, '');

      if (!username || !password) {
        showMessage(loginMessage, 'Username and password are required.', 'error');
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
          localStorage.setItem('token', result.token);
          showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = result.isAdmin ? '/admin.html' : '/app.html';
          }, 1000);
        } else {
          showMessage(loginMessage, result.message || 'Invalid credentials.', 'error');
        }
      } catch (error) {
        showMessage(loginMessage, 'An error occurred. Please try again.', 'error');
        console.error('Login error:', error);
      }
    });
  }
});
