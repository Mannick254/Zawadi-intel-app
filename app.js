(function () {
  // User system (persistent via localStorage)
  let users = {}; // { username: { password, avatar } }
  let loggedInUser = null;
  let cropper = null;

  const USERS_KEY = 'zawadi_users_v1';
  const CURRENT_KEY = 'zawadi_current_v1';

  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      users = raw ? JSON.parse(raw) : {};
    } catch (e) {
      users = {};
    }
  }

  function saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setCurrentUser(username) {
    loggedInUser = username;
    if (username) localStorage.setItem(CURRENT_KEY, username);
    else localStorage.removeItem(CURRENT_KEY);
    updateHeaderAuthUI();
  }

  function getCurrentUser() {
    return localStorage.getItem(CURRENT_KEY) || null;
  }

  // Toggle helpers for forms
  function showRegister() {
    document.querySelectorAll('#loginForm').forEach(f => f.style.display = 'none');
    document.querySelectorAll('#registerForm').forEach(f => f.style.display = 'block');
  }

  function showLogin() {
    document.querySelectorAll('#registerForm').forEach(f => f.style.display = 'none');
    document.querySelectorAll('#loginForm').forEach(f => f.style.display = 'block');
  }

  function showUserDetails(username) {
    document.querySelectorAll('#displayName').forEach(el => el.textContent = username);
    document.querySelectorAll('#loginForm').forEach(f => f.style.display = 'none');
    document.querySelectorAll('#userDetails').forEach(el => el.style.display = 'block');
    document.querySelectorAll('#uploadSection').forEach(el => el.style.display = 'block');
  }

  function updateHeaderAuthUI() {
    // show avatar in #userAuth if logged in, else show login button
    document.querySelectorAll('#userAuth').forEach(container => {
      container.querySelectorAll('.header-avatar').forEach(n => n.remove());
      const openBtn = container.querySelector('#openLoginBtn');
      if (loggedInUser) {
        const avatarSrc = users[loggedInUser] && users[loggedInUser].avatar ? users[loggedInUser].avatar : `https://www.gravatar.com/avatar/${md5(loggedInUser)}?d=mp&f=y`;
        const img = document.createElement('img');
        img.className = 'header-avatar';
        img.src = avatarSrc;
        img.alt = loggedInUser;
        img.width = 36;
        img.height = 36;
        img.style.borderRadius = '50%';
        img.style.marginLeft = '8px';
        img.onclick = () => {
          // toggle userDetails in this container
          const ud = container.querySelector('#userDetails');
          if (ud) ud.style.display = ud.style.display === 'block' ? 'none' : 'block';
        };
        if (openBtn) openBtn.style.display = 'none';
        container.appendChild(img);
        showUserDetails(loggedInUser);
      } else {
        if (openBtn) openBtn.style.display = 'inline-block';
        document.querySelectorAll('#userDetails').forEach(el => el.style.display = 'none');
      }
    });
  }

  // Basic MD5 for gravatar fallback (small implementation)
  function md5(str) {
    // simple hash fallback for non-critical use (not cryptographic)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  // Init users and current state
  loadUsers();
  const initial = getCurrentUser();
  if (initial) loggedInUser = initial;
  updateHeaderAuthUI();

  // Submit handling (login/register) using event delegation
  document.addEventListener('submit', function (e) {
    const id = e.target && e.target.id;
    if (id === 'loginForm') {
      e.preventDefault();
      const form = e.target;
      const username = form.querySelector('#username')?.value?.trim();
      const password = form.querySelector('#password')?.value;
      if (username && password && users[username] && users[username].password === password) {
        setCurrentUser(username);
        document.querySelectorAll('#loginError').forEach(el => el.textContent = '');
      } else {
        document.querySelectorAll('#loginError').forEach(el => el.textContent = 'Wrong username or password.');
      }
    } else if (id === 'registerForm') {
      e.preventDefault();
      const form = e.target;
      const newUsername = form.querySelector('#newUsername')?.value?.trim();
      const newPassword = form.querySelector('#newPassword')?.value;
      if (!newUsername || !newPassword) {
        alert('Please provide username and password');
        return;
      }
      if (users[newUsername]) {
        alert('Username already exists.');
        return;
      }
      users[newUsername] = { password: newPassword, avatar: null };
      saveUsers();
      showLogin();
      alert('Registration successful. Please login.');
    }
  });

  // Logout
  function logout() {
    setCurrentUser(null);
  }

  // Image upload and crop
  document.addEventListener('change', function (e) {
    const target = e.target;
    if (!target) return;
    if (target.id === 'profileUpload' || target.id === 'photoUpload' || target.id === 'photoUploadModal') {
      const file = target.files && target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.getElementById('cropImage');
        if (img) {
          img.src = event.target.result;
          document.getElementById('cropContainer').style.display = 'block';
          if (cropper) cropper.destroy();
          // create cropper if library available
          try {
            cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1, autoCropArea: 1 });
          } catch (err) {
            cropper = null;
          }
        } else {
          // no crop UI on this page, save directly
          const current = loggedInUser || getCurrentUser();
          if (current) {
            users[current] = users[current] || {};
            users[current].avatar = event.target.result;
            saveUsers();
            updateHeaderAuthUI();
            alert('Avatar updated');
          } else {
            alert('Please login to set an avatar.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  });

  function cropImage() {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 128, height: 128 });
    const croppedImage = canvas.toDataURL("image/png");
    // save avatar for current user
    const current = loggedInUser || getCurrentUser();
    if (current) {
      users[current] = users[current] || {};
      users[current].avatar = croppedImage;
      saveUsers();
      updateHeaderAuthUI();
      alert('Avatar saved');
    }
    // update any visible image elements too
    const profileImg = document.querySelector('.user-profile img') || document.querySelector('#userAuth img');
    if (profileImg) profileImg.src = croppedImage;
    document.getElementById('cropContainer').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
  }

  // Close auth modal when clicking outside
  document.addEventListener('click', function (e) {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    const openBtn = document.getElementById('openLoginBtn');
    if (authModal.style.display === 'block' && !authModal.contains(e.target) && e.target !== openBtn) {
      authModal.style.display = 'none';
    }
  });

  // Zawadi Pulse toggle
  function togglePulse() {
    const spotlight = document.getElementById("pulseSpotlight");
    spotlight.style.display = spotlight.style.display === "none" ? "block" : "none";
  }

  // Shuffle utility
  function shuffleSection(sectionId) {
    const container = document.getElementById(sectionId);
    if (!container) return;
    const items = Array.from(container.children);
    items.sort(() => Math.random() - 0.5);
    container.innerHTML = '';
    items.forEach(item => container.appendChild(item));
  }

  // Load HTML section
  function loadSection(sectionId, sourceUrl) {
    fetch(sourceUrl)
      .then(response => {
        if (!response.ok) throw new Error("Failed to load section");
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const content = doc.querySelector('main') || doc.body;
        document.getElementById(sectionId).innerHTML = content.innerHTML;
      })
      .catch(error => {
        document.getElementById(sectionId).innerHTML = "<p>Error loading content.</p>";
        console.error(error);
      });
  }

  // Load JSON biographies
  function loadBiographiesFromJSON(jsonPath, containerId) {
    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        data.forEach(artist => {
          const card = document.createElement('div');
          card.className = 'artist-card';
          card.innerHTML = `
            <img src="${artist.image || 'default.jpg'}" alt="${artist.name || 'Unknown'}" class="bio-photo" />
            <h3>${artist.name || 'Unnamed Artist'}</h3>
            <p>${artist.bio || 'Biography not available.'}</p>
            <a href="${artist.link || '#'}">📖 Read Bio</a>
          `;
          container.appendChild(card);
        });
        shuffleSection(containerId);
      })
      .catch(error => {
        console.error('Error loading biographies:', error);
      });
  }

  // Homepage content loading
  loadBiographiesFromJSON('data/biographies.json', 'featured-biographies');
  loadSection('latest-news', 'news.html');
  loadSection('sports-highlights', 'sport.html');
  loadSection('media-showcase', 'media.html');
  loadSection('books-spotlight', 'books.html');
  loadSection('african-sports', 'sport.html');
  loadSection('african-climate', 'climate.html');
  loadSection('middle-east-news', 'middleeast.html');
  loadSection('asia-europe-news', 'global.html');

  // Auto-shuffle
  setTimeout(() => {
    shuffleSection('featured-biographies');
    shuffleSection('latest-news');
  }, 1000);

  setInterval(() => {
    shuffleSection('latest-news');
  }, 60000);

  // Expose functions if needed globally
  window.toggleProfileMenu = toggleProfileMenu;
  window.showRegister = showRegister;
  window.showLogin = showLogin;
  window.logout = logout;
  window.cropImage = cropImage;
  window.togglePulse = togglePulse;
})();
