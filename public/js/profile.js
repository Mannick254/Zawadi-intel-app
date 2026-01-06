    // Account-specific script
    let cropper;
    const canvas = document.getElementById('crop-canvas');
    const ctx = canvas.getContext('2d');
    let image = new Image();

    // Display current user
    const currentUser = JSON.parse(localStorage.getItem('zawadi_current_user_v1') || 'null');
    if (currentUser) {
      document.getElementById('username-display').textContent = currentUser.username;
    }

    // Function to generate initials avatar
    function generateInitialsAvatar(username) {
      const initials = username.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'avatar-initials';
      avatarDiv.textContent = initials;
      return avatarDiv;
    }

    // Load saved profile photo or show initials avatar
    const savedPhoto = localStorage.getItem('zawadi_profile_photo');
    const avatarContainer = document.getElementById('avatar-container');
    if (savedPhoto) {
      document.getElementById('profile-photo').src = savedPhoto;
    } else if (currentUser && currentUser.username) {
      // Show initials avatar if no photo and user is logged in
      const initialsAvatar = generateInitialsAvatar(currentUser.username);
      avatarContainer.innerHTML = '';
      avatarContainer.appendChild(initialsAvatar);
    }

    // Upload button
    document.getElementById('upload-btn').addEventListener('click', () => {
      const fileInput = document.getElementById('photo-input');
      const file = fileInput.files[0];
      if (!file) {
        document.getElementById('status-message').textContent = 'Please select a file first.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        image.src = e.target.result;
        image.onload = () => {
          // Set canvas size to image size or max 400x400
          const maxSize = 400;
          let { width, height } = image;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);

          document.querySelector('.upload-section').style.display = 'none';
          document.querySelector('.crop-section').style.display = 'block';
          document.getElementById('status-message').textContent = 'Drag to crop the image.';
        };
      };
      reader.readAsDataURL(file);
    });

    // Save cropped image
    document.getElementById('crop-save').addEventListener('click', () => {
      // For simplicity, save the entire canvas as cropped (user can adjust by re-uploading)
      const croppedDataURL = canvas.toDataURL('image/png');
      // Replace initials avatar with image if it exists
      const avatarContainer = document.getElementById('avatar-container');
      avatarContainer.innerHTML = `<img id="profile-photo" class="profile-photo" src="${croppedDataURL}" alt="Profile Photo" />`;
      localStorage.setItem('zawadi_profile_photo', croppedDataURL);
      document.querySelector('.crop-section').style.display = 'none';
      document.querySelector('.upload-section').style.display = 'block';
      document.getElementById('status-message').textContent = 'Profile photo updated!';
    });

    // Cancel cropping
    document.getElementById('crop-cancel').addEventListener('click', () => {
      document.querySelector('.crop-section').style.display = 'none';
      document.querySelector('.upload-section').style.display = 'block';
      document.getElementById('status-message').textContent = '';
    });

    // Login form handler
    document.getElementById('login-btn').addEventListener('click', async () => {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const msg = document.getElementById('login-msg');
      msg.textContent = '';
      if (!username || !password) {
        msg.textContent = 'Please enter username and password.';
        return;
      }
      try {
        console.log('Attempting login for:', username);
        const result = await loginUser(username, password);
        console.log('Login result:', result);
        if (result && result.ok) {
          msg.style.color = 'green';
          msg.textContent = 'Login successful!';
          updateProfileUI();
        } else {
          msg.textContent = result && result.message ? result.message : 'Login failed.';
        }
      } catch (e) {
        console.error('Login error:', e);
        msg.textContent = 'Login error: ' + e.message;
      }
    });

    // Register form handler
    document.getElementById('register-btn').addEventListener('click', async () => {
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value.trim();
      const msg = document.getElementById('register-msg');
      msg.textContent = '';
      if (!username || !password) {
        msg.textContent = 'Please enter username and password.';
        return;
      }
      try {
        const result = await registerUser(username, password);
        if (result && result.ok) {
          msg.style.color = 'green';
          msg.textContent = 'Registration successful! You can now login.';
        } else {
          msg.textContent = result && result.message ? result.message : 'Registration failed.';
        }
      } catch (e) {
        msg.textContent = 'Registration error.';
      }
    });

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
      logoutUser();
      updateProfileUI();
    });

    // Admin link handler
    document.getElementById('admin-link').addEventListener('click', () => {
      window.location.href = 'admin.html';
    });

    // Function to update profile UI based on login status
    async function updateProfileUI() {
      const currentUser = await getCurrentUser();
      const userDetails = document.getElementById('user-details');
      const authForms = document.getElementById('auth-forms');
      const profilePhotoSection = document.getElementById('profile-photo-section');
      const usernameDisplay = document.getElementById('username-display');

      if (currentUser) {
        // User is logged in
        usernameDisplay.textContent = currentUser.username;
        userDetails.style.display = 'block';
        authForms.style.display = 'none';
        profilePhotoSection.style.display = 'block';

        // Populate user details
        document.getElementById('user-username').textContent = currentUser.username;
        document.getElementById('user-registered').textContent = new Date(currentUser.createdAt || Date.now()).toLocaleDateString();
        document.getElementById('user-type').textContent = currentUser.isAdmin ? 'Admin' : 'User';
        document.getElementById('admin-link').style.display = currentUser.isAdmin ? 'inline-block' : 'none';

        // Load profile photo or initials
        const savedPhoto = localStorage.getItem('zawadi_profile_photo');
        const avatarContainer = document.getElementById('avatar-container');
        if (savedPhoto) {
          avatarContainer.innerHTML = `<img id="profile-photo" class="profile-photo" src="${savedPhoto}" alt="Profile Photo" />`;
        } else {
          const initialsAvatar = generateInitialsAvatar(currentUser.username);
          avatarContainer.innerHTML = '';
          avatarContainer.appendChild(initialsAvatar);
        }
      } else {
        // User is not logged in
        usernameDisplay.textContent = 'Guest';
        userDetails.style.display = 'none';
        authForms.style.display = 'block';
        profilePhotoSection.style.display = 'none';
      }
    }

    // Initialize UI on page load
    updateProfileUI();
