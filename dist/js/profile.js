document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const registerMessage = document.getElementById('register-message');
  const loginMessage = document.getElementById('login-message');

  // Handle registration form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      registerMessage.textContent = '';

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      loginMessage.textContent = '';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.token) {
          localStorage.setItem('token', result.token);
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
