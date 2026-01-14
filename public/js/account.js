
// public/js/account.js

document.addEventListener('DOMContentLoaded', async () => {
  // =========================
  // Cached DOM Elements
  // =========================
  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d');
  const avatarContainer = document.getElementById('avatar-container');
  const usernameDisplay = document.getElementById('username-display');
  const statusMessage = document.getElementById('status-message');
  const userDetails = document.getElementById('user-details');
  const authForms = document.getElementById('auth-forms');
  const profilePhotoSection = document.getElementById('profile-photo-section');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const adminLink = document.getElementById('admin-link');

  let image = new Image();

  // =========================
  // Utility Functions
  // =========================
  function showSection(selector) {
    const element = document.querySelector(selector);
    if (element) element.style.display = 'block';
  }

  function hideSection(selector) {
    const element = document.querySelector(selector);
    if (element) element.style.display = 'none';
  }

  function generateInitialsAvatar(username) {
    const initials = username
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar-initials';
    avatarDiv.textContent = initials;
    return avatarDiv;
  }

  function loadAvatar(user) {
    const savedPhoto = localStorage.getItem('zawadi_profile_photo');
    if (avatarContainer) {
      avatarContainer.innerHTML = '';
      if (savedPhoto) {
        avatarContainer.innerHTML = `<img id="profile-photo" class="profile-photo" src="${savedPhoto}" alt="Profile Photo" />`;
      } else if (user?.username) {
        avatarContainer.appendChild(generateInitialsAvatar(user.username));
      }
    }
  }

  // =========================
  // UI Update
  // =========================
  function updateProfileUI() {
    // currentUser is now a global variable from auth.js
    if (currentUser) {
      if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
      if (userDetails) userDetails.style.display = 'block';
      if (authForms) authForms.style.display = 'none';
      if (profilePhotoSection) profilePhotoSection.style.display = 'block';

      const userUsername = document.getElementById('user-username');
      const userRegistered = document.getElementById('user-registered');
      const userType = document.getElementById('user-type');
      
      if (userUsername) userUsername.textContent = currentUser.username;
      if (userRegistered) userRegistered.textContent = new Date(currentUser.createdAt).toLocaleDateString();
      if (userType) userType.textContent = currentUser.isAdmin ? 'Admin' : 'User';
      if (adminLink) adminLink.style.display = currentUser.isAdmin ? 'inline-block' : 'none';

      loadAvatar(currentUser);
    } else {
      if (usernameDisplay) usernameDisplay.textContent = 'Guest';
      if (userDetails) userDetails.style.display = 'none';
      if (authForms) authForms.style.display = 'block';
      if (profilePhotoSection) profilePhotoSection.style.display = 'none';
    }
  }

  // =========================
  // Event Handlers
  // =========================

  // Upload photo
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const fileInput = document.getElementById('photo-input');
      const file = fileInput.files[0];
      if (!file) {
        if (statusMessage) statusMessage.textContent = 'Please select a file first.';
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        image.src = e.target.result;
        image.onload = () => {
          const maxSize = 400;
          let { width, height } = image;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          if (canvas) {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0, width, height);

            hideSection('.upload-section');
            showSection('.crop-section');
            if (statusMessage) statusMessage.textContent = 'Drag to crop the image.';
          }
        };
      };
      reader.readAsDataURL(file);
    });
  }

  // Save cropped photo
  const cropSaveBtn = document.getElementById('crop-save');
  if (cropSaveBtn) {
    cropSaveBtn.addEventListener('click', () => {
      const croppedDataURL = canvas.toDataURL('image/png');
      localStorage.setItem('zawadi_profile_photo', croppedDataURL);
      loadAvatar(currentUser);

      hideSection('.crop-section');
      showSection('.upload-section');
      if (statusMessage) statusMessage.textContent = 'Profile photo updated!';
    });
  }

  // Cancel cropping
  const cropCancelBtn = document.getElementById('crop-cancel');
  if (cropCancelBtn) {
    cropCancelBtn.addEventListener('click', () => {
      hideSection('.crop-section');
      showSection('.upload-section');
      if (statusMessage) statusMessage.textContent = '';
    });
  }

  // Login
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const msg = document.getElementById('login-msg');

      if (msg) msg.textContent = '';
      if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
        if (msg) msg.textContent = 'Please enter username and password.';
        return;
      }

      try {
        // Using loginUser from auth.js
        const result = await loginUser(usernameInput.value.trim(), passwordInput.value.trim());
        if (result?.ok) {
          if (msg) {
            msg.style.color = 'green';
            msg.textContent = 'Login successful!';
          }
          updateProfileUI(); // Re-render the UI
        } else {
          if (msg) {
            msg.style.color = 'red';
            msg.textContent = result?.message || 'Login failed.';
          }
        }
      } catch (e) {
        if (msg) {
          msg.style.color = 'red';
          msg.textContent = 'Login error: ' + e.message;
        }
      }
    });
  }

  // Register
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const usernameInput = document.getElementById('register-username');
      const passwordInput = document.getElementById('register-password');
      const msg = document.getElementById('register-msg');

      if (msg) msg.textContent = '';
      if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
        if (msg) msg.textContent = 'Please enter username and password.';
        return;
      }

      try {
        // Using registerUser from auth.js
        const result = await registerUser(usernameInput.value.trim(), passwordInput.value.trim());
        if (result?.ok) {
          if (msg) {
            msg.style.color = 'green';
            msg.textContent = 'Registration successful! You can now login.';
          }
        } else {
          if (msg) {
            msg.style.color = 'red';
            msg.textContent = result?.message || 'Registration failed.';
          }
        }
      } catch (e) {
        if (msg) {
          msg.style.color = 'red';
          msg.textContent = 'Registration error: ' + e.message;
        }
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Using logout from auth.js
      logout();
      // The page will be reloaded by the logout function.
    });
  }
  
  // Admin link
  if (adminLink) {
    adminLink.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }

  // =========================
  // Initialisation
  // =========================
  await checkAuth(); // Check for existing session
  updateProfileUI(); // Render the UI based on auth state
});
