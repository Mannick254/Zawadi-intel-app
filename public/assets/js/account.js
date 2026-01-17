// public/js/account.js
document.addEventListener('DOMContentLoaded', async () => {
  // =========================
  // Cached DOM Elements
  // =========================
  const canvas = document.getElementById('crop-canvas');
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

  let ctx = canvas ? canvas.getContext('2d') : null;
  let image = new Image();

  // =========================
  // Utility Functions
  // =========================
  function show(id) {
    const el = document.querySelector(id);
    if (el) el.style.display = 'block';
  }
  function hide(id) {
    const el = document.querySelector(id);
    if (el) el.style.display = 'none';
  }
  function setMessage(id, text, color) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
      if (color) el.style.color = color;
    }
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
    if (typeof currentUser !== 'undefined' && currentUser) {
      usernameDisplay.textContent = currentUser.username;
      userDetails.style.display = 'block';
      authForms.style.display = 'none';
      profilePhotoSection.style.display = 'block';

      setMessage('user-username', currentUser.username);
      setMessage('user-registered', new Date(currentUser.createdAt).toLocaleDateString());
      setMessage('user-type', currentUser.isAdmin ? 'Admin' : 'User');
      if (adminLink) adminLink.style.display = currentUser.isAdmin ? 'inline-block' : 'none';

      loadAvatar(currentUser);
    } else {
      usernameDisplay.textContent = 'Guest';
      userDetails.style.display = 'none';
      authForms.style.display = 'block';
      profilePhotoSection.style.display = 'none';
    }
  }

  // =========================
  // Event Handlers
  // =========================
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn && canvas && ctx) {
    uploadBtn.addEventListener('click', () => {
      const fileInput = document.getElementById('photo-input');
      const file = fileInput.files[0];
      if (!file) return setMessage('status-message', 'Please select a file first.', 'red');

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
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);

          hide('.upload-section');
          show('.crop-section');
          setMessage('status-message', 'Drag to crop the image.');
        };
      };
      reader.readAsDataURL(file);
    });
  }

  const cropSaveBtn = document.getElementById('crop-save');
  if (cropSaveBtn && canvas) {
    cropSaveBtn.addEventListener('click', () => {
      const croppedDataURL = canvas.toDataURL('image/png');
      localStorage.setItem('zawadi_profile_photo', croppedDataURL);
      loadAvatar(currentUser);
      hide('.crop-section');
      show('.upload-section');
      setMessage('status-message', 'Profile photo updated!', 'green');
    });
  }

  const cropCancelBtn = document.getElementById('crop-cancel');
  if (cropCancelBtn) {
    cropCancelBtn.addEventListener('click', () => {
      hide('.crop-section');
      show('.upload-section');
      setMessage('status-message', '');
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('login-username')?.value.trim();
      const password = document.getElementById('login-password')?.value.trim();
      if (!username || !password) return setMessage('login-msg', 'Please enter username and password.', 'red');

      try {
        const result = await loginUser(username, password);
        if (result?.ok) {
          setMessage('login-msg', 'Login successful!', 'green');
          updateProfileUI();
        } else {
          setMessage('login-msg', result?.message || 'Login failed.', 'red');
        }
      } catch (e) {
        setMessage('login-msg', 'Login error: ' + e.message, 'red');
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const username = document.getElementById('register-username')?.value.trim();
      const password = document.getElementById('register-password')?.value.trim();
      if (!username || !password) return setMessage('register-msg', 'Please enter username and password.', 'red');

      try {
        const result = await registerUser(username, password);
        if (result?.ok) {
          setMessage('register-msg', 'Registration successful! You can now login.', 'green');
        } else {
          setMessage('register-msg', result?.message || 'Registration failed.', 'red');
        }
      } catch (e) {
        setMessage('register-msg', 'Registration error: ' + e.message, 'red');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => logout());
  }

  if (adminLink) {
    adminLink.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
  }

  // =========================
  // Initialisation
  // =========================
  await checkAuth();
  updateProfileUI();
});
