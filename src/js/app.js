// === Unified Authentication & Encryption Logic ===
const encryptionKey = "2025Zawadi";
let currentUser = localStorage.getItem('currentUser') || null;

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
}
function decrypt(cipher) {
  try {
    return CryptoJS.AES.decrypt(cipher, encryptionKey).toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Failed]";
  }
}

function sanitize(input) {
  return input.replace(/<[^>]*>?/gm, '');
}

function getRegisteredUserCount() {
  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  return Object.keys(users).length;
}
window.showRegisteredUserCount = function() {
  alert('Total registered users: ' + getRegisteredUserCount());
}
// ===== Modal Dialog Logic =====
document.addEventListener('DOMContentLoaded', function() {
  // Modal elements
  const authModal = document.getElementById('authModal');
  const profileModal = document.getElementById('profileModal');
  // Triggers
  const openAuth = document.getElementById('openAuthModal');
  const openProfile = document.getElementById('openProfileModal');
  // Close buttons
  const closeAuth = document.getElementById('closeAuthModal');
  const closeProfile = document.getElementById('closeProfileModal');
  // Auth tabs
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');
  const panelLogin = document.getElementById('authLoginPanel');
  const panelRegister = document.getElementById('authRegisterPanel');

  // Open modals
  if (openAuth) openAuth.onclick = () => { authModal.style.display = 'block'; };
  if (openProfile) openProfile.onclick = () => { profileModal.style.display = 'block'; loadProfileModal(); };
  // Close modals
  if (closeAuth) closeAuth.onclick = () => { authModal.style.display = 'none'; };
  if (closeProfile) closeProfile.onclick = () => { profileModal.style.display = 'none'; };
  // Tab switching
  if (tabLogin && tabRegister && panelLogin && panelRegister) {
    tabLogin.onclick = () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      panelLogin.style.display = '';
      panelRegister.style.display = 'none';
    };
    tabRegister.onclick = () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      panelRegister.style.display = '';
      panelLogin.style.display = 'none';
    };
  }
  // Close modal on outside click
  window.onclick = function(event) {
    if (event.target === authModal) authModal.style.display = 'none';
    if (event.target === profileModal) profileModal.style.display = 'none';
  };

  // Add submit listeners for login and register forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      loginUser();
    });
  }
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      registerUser();
    });
  }

  // Show auth modal if not logged in
  if (!currentUser && authModal) authModal.style.display = 'block';
  if (currentUser) {
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
    loadDraft();
    revealAllIntel();
  }
});

// Profile Modal Logic
function loadProfileModal() {
  if (!currentUser) return;
  const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`)) || {};
  document.getElementById('profileDisplayNameModal').value = profile.displayName || '';
  document.getElementById('profileBioModal').value = profile.bio || '';
  updateProfileInfoModal(profile);
}
function updateProfileInfoModal(profile) {
  const infoDiv = document.getElementById('profileInfoModal');
  if (!infoDiv) return;
  infoDiv.innerHTML = '';
  if (profile.displayName) {
    infoDiv.innerHTML += `<strong>Display Name:</strong> ${profile.displayName}<br/>`;
  }
  if (profile.bio) {
    infoDiv.innerHTML += `<strong>Bio:</strong> ${profile.bio}`;
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const profileFormModal = document.getElementById('profileFormModal');
  if (profileFormModal) {
    profileFormModal.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!currentUser) return;
      const displayName = document.getElementById('profileDisplayNameModal').value.trim();
      const bio = document.getElementById('profileBioModal').value.trim();
      const profile = { displayName, bio };
      localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profile));
      updateProfileInfoModal(profile);
      showNotification('Profile updated!', 'success');
    });
  }
});
// ===== Notification System =====
function showNotification(message, type = "info") {
  let notif = document.getElementById('notificationBar');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notificationBar';
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.zIndex = '9999';
    notif.style.background = type === 'success' ? '#4caf50' : (type === 'error' ? '#f44336' : '#333');
    notif.style.color = '#fff';
    notif.style.padding = '12px 30px';
    notif.style.borderRadius = '8px';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notif.style.fontSize = '1.1em';
    notif.style.opacity = '0.95';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.display = 'block';
  setTimeout(() => { notif.style.display = 'none'; }, 2500);
}

// Toggle login/register (if using screen-based modals)
function toggleRegister() {
  document.getElementById('loginScreen').classList.toggle('hidden');
  document.getElementById('registerScreen').classList.toggle('hidden');
}
function registerUser() {
  const username = sanitize(document.getElementById('newUsername').value.trim());
  const password = sanitize(document.getElementById('newPassword').value);
  const error = document.getElementById('registerError');

  if (!username || !password || username.length < 3) {
    error.textContent = "Please enter a valid username and password.";
    return;
  }

  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  if (users[username]) {
    error.textContent = "User already exists.";
    return;
  }

  users[username] = encrypt(password);
  localStorage.setItem('zawadiUsers', JSON.stringify(users));
  error.textContent = "✅ Registered successfully. You can now log in.";
}

// Login user
function loginUser() {
  const username = sanitize(document.getElementById('usernameInput').value.trim());
  const password = sanitize(document.getElementById('passwordInput').value);
  const error = document.getElementById('loginError');

  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  if (users[username] && decrypt(users[username]) === password) {
    currentUser = username;
    localStorage.setItem('currentUser', username);

    // Hide login/register modals, show app content
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
    loadDraft();
    revealAllIntel();
    loadProfile();
    showNotification('Login successful!', 'success');
  } else {
    error.textContent = "Incorrect username or password.";
    showNotification('Incorrect username or password.', 'error');
  }
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('appContent').classList.add('hidden');
  document.getElementById('currentUserDisplay').textContent = '';
  // Show login modal
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.style.display = 'block';
  showNotification('Logged out.', 'info');
}

// 📥 Submit intel
document.getElementById('intelForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!currentUser) return;

  const title = encrypt(sanitize(document.getElementById('title').value));
  const content = encrypt(sanitize(document.getElementById('content').value));
  const tags = sanitize(document.getElementById('tagsInput').value);

  // All entries are public and saved under a shared/public key
  const intel = {
    title,
    content,
    tags,
    author: currentUser,
    public: true,
    timestamp: new Date().toISOString()
  };

  if (!navigator.onLine) {
    // Queue for later
    let queued = JSON.parse(localStorage.getItem('zawadiQueuedIntel')) || [];
    queued.push(intel);
    localStorage.setItem('zawadiQueuedIntel', JSON.stringify(queued));
    showNotification('You are offline. Your biography will be saved when you are back online.', 'error');
    return;
  }

  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  if (!allIntel['public']) allIntel['public'] = [];
  allIntel['public'].push(intel);

  localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  localStorage.removeItem(`draftIntel_${currentUser}`);
  this.reset();
  revealAllIntel();
  showNotification('Biography submitted and made public!', 'success');
});

// Auto-save queued biographies when back online
window.addEventListener('online', function() {
  const queued = JSON.parse(localStorage.getItem('zawadiQueuedIntel')) || [];
  if (queued.length === 0) return;
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  if (!allIntel['public']) allIntel['public'] = [];
  allIntel['public'] = allIntel['public'].concat(queued);
  localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  localStorage.removeItem('zawadiQueuedIntel');
  revealAllIntel();
  showNotification('Queued biographies have been saved now that you are online.', 'success');
});

// ===== User Profile Logic =====
function loadProfile() {
  if (!currentUser) return;
  const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`)) || {};
  document.getElementById('profileDisplayName').value = profile.displayName || '';
  document.getElementById('profileBio').value = profile.bio || '';
  document.getElementById('profileThemeColor').value = profile.themeColor || '#00bcd4';
  updateProfileInfo(profile);
  // Load avatar
  const avatar = profile.avatar || '👤';
  document.getElementById('profileAvatar').innerHTML = avatar.startsWith('data:') ? `<img src="${avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;">` : avatar;
  document.getElementById('profileAvatarModal').innerHTML = avatar.startsWith('data:') ? `<img src="${avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;">` : avatar;
  // Chrome-style card update
  document.getElementById('chromeProfileName').textContent = profile.displayName ? `👤 ${profile.displayName}` : '👤 User Profile';
  document.querySelector('.chrome-profile-card').style.setProperty('--chrome-theme', profile.themeColor || '#00bcd4');
}

function updateProfileInfo(profile) {
  const infoDiv = document.getElementById('profileInfo');
  if (!infoDiv) return;
  infoDiv.innerHTML = '';
  if (profile.displayName) {
    infoDiv.innerHTML += `<strong>Display Name:</strong> ${profile.displayName}<br/>`;
  }
  if (profile.bio) {
    infoDiv.innerHTML += `<strong>Bio:</strong> ${profile.bio}`;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!currentUser) return;
      const displayName = document.getElementById('profileDisplayName').value.trim();
      const bio = document.getElementById('profileBio').value.trim();
      const themeColor = document.getElementById('profileThemeColor').value || '#00bcd4';
      const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`)) || {};
      profile.displayName = displayName;
      profile.bio = bio;
      profile.themeColor = themeColor;
      localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profile));
      updateProfileInfo(profile);
      document.getElementById('chromeProfileName').textContent = displayName ? `👤 ${displayName}` : '👤 User Profile';
      document.querySelector('.chrome-profile-card').style.setProperty('--chrome-theme', themeColor);
      document.getElementById('profileMsg').textContent = 'Profile saved!';
      setTimeout(() => { document.getElementById('profileMsg').textContent = ''; }, 2000);
      showNotification('Profile updated!', 'success');
    });
    // Live update theme color
    document.getElementById('profileThemeColor').addEventListener('input', function() {
      document.querySelector('.chrome-profile-card').style.setProperty('--chrome-theme', this.value);
    });
  }
});

// Photo Upload and Cropping Logic
let cropImage = null;
let cropCanvas = null;
let cropCtx = null;
let cropStartX = 0, cropStartY = 0, cropEndX = 100, cropEndY = 100;

function togglePhotoUpload() {
  document.getElementById('photoUpload').click();
}

function togglePhotoUploadModal() {
  document.getElementById('photoUploadModal').click();
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    cropImage = new Image();
    cropImage.onload = function() {
      document.getElementById('cropModal').style.display = 'block';
      cropCanvas = document.getElementById('cropCanvas');
      cropCtx = cropCanvas.getContext('2d');
      cropCanvas.width = 400;
      cropCanvas.height = 400;
      const scale = Math.min(cropCanvas.width / cropImage.width, cropCanvas.height / cropImage.height);
      const scaledWidth = cropImage.width * scale;
      const scaledHeight = cropImage.height * scale;
      const x = (cropCanvas.width - scaledWidth) / 2;
      const y = (cropCanvas.height - scaledHeight) / 2;
      cropCtx.drawImage(cropImage, x, y, scaledWidth, scaledHeight);
      // Draw initial crop rectangle
      drawCropRect();
    };
    cropImage.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function drawCropRect() {
  if (!cropCtx) return;
  cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  const scale = Math.min(cropCanvas.width / cropImage.width, cropCanvas.height / cropImage.height);
  const scaledWidth = cropImage.width * scale;
  const scaledHeight = cropImage.height * scale;
  const x = (cropCanvas.width - scaledWidth) / 2;
  const y = (cropCanvas.height - scaledHeight) / 2;
  cropCtx.drawImage(cropImage, x, y, scaledWidth, scaledHeight);
  cropCtx.strokeStyle = 'red';
  cropCtx.lineWidth = 2;
  cropCtx.strokeRect(cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
}

cropCanvas.addEventListener('mousedown', function(e) {
  const rect = cropCanvas.getBoundingClientRect();
  cropStartX = e.clientX - rect.left;
  cropStartY = e.clientY - rect.top;
  cropEndX = cropStartX;
  cropEndY = cropStartY;
  drawCropRect();
});

cropCanvas.addEventListener('mousemove', function(e) {
  if (e.buttons !== 1) return;
  const rect = cropCanvas.getBoundingClientRect();
  cropEndX = e.clientX - rect.left;
  cropEndY = e.clientY - rect.top;
  drawCropRect();
});

document.getElementById('cropBtn').addEventListener('click', function() {
  if (!cropImage || !cropCtx) return;
  const scale = Math.min(cropCanvas.width / cropImage.width, cropCanvas.height / cropImage.height);
  const scaledWidth = cropImage.width * scale;
  const scaledHeight = cropImage.height * scale;
  const x = (cropCanvas.width - scaledWidth) / 2;
  const y = (cropCanvas.height - scaledHeight) / 2;
  const cropWidth = Math.abs(cropEndX - cropStartX);
  const cropHeight = Math.abs(cropEndY - cropStartY);
  const cropX = Math.min(cropStartX, cropEndX) - x;
  const cropY = Math.min(cropStartY, cropEndY) - y;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;
  tempCtx.drawImage(cropImage, cropX / scale, cropY / scale, cropWidth / scale, cropHeight / scale, 0, 0, cropWidth, cropHeight);
  const croppedDataURL = tempCanvas.toDataURL('image/png');
  // Save to profile
  const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`)) || {};
  profile.avatar = croppedDataURL;
  localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profile));
  loadProfile();
  document.getElementById('cropModal').style.display = 'none';
  showNotification('Avatar updated!', 'success');
});

document.getElementById('cancelCropBtn').addEventListener('click', function() {
  document.getElementById('cropModal').style.display = 'none';
});

document.getElementById('closeCropModal').addEventListener('click', function() {
  document.getElementById('cropModal').style.display = 'none';
});

// 📖 Reveal all entries
function revealAllIntel() {
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const entries = allIntel['public'] || [];
  const list = document.getElementById('intelList');
  list.innerHTML = '';

  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-card intel-entry fade-in';
    div.innerHTML = `
      <div class="intel-card-header">
        <span class="intel-icon">🧠</span>
        <h3>${decrypt(entry.title)}</h3>
      </div>
      <p>${decrypt(entry.content)}</p>
      ${entry.tags ? `<div class="intel-tags">${entry.tags.split(',').map(tag => `<span class='tag'>#${tag.trim()}</span>`).join(' ')}</div>` : ''}
      <div class="intel-card-footer">
        <small>${entry.timestamp}</small>
        <span class="public-badge">🌍 Public</span>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('entryCount').textContent = `Total Entries: ${entries.length}`;
}

// 🔍 Search entries
function searchIntel() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const entries = allIntel[currentUser] || [];
  const list = document.getElementById('intelList');
  list.innerHTML = '';

  const filtered = entries.filter(entry =>
    decrypt(entry.title).toLowerCase().includes(query) ||
    decrypt(entry.content).toLowerCase().includes(query)
  );

  filtered.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.innerHTML = `
      <h3>${highlight(decrypt(entry.title), query)}</h3>
      <p>${highlight(decrypt(entry.content), query)}</p>
      <small>${entry.timestamp}</small>
    `;
    list.appendChild(div);
  });

  document.getElementById('entryCount').textContent = `Total Entries: ${filtered.length}`;
}

// ✨ Highlight search matches
function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 📝 Draft logic
document.getElementById('title').addEventListener('input', saveDraft);
document.getElementById('content').addEventListener('input', saveDraft);

function saveDraft() {
  if (!currentUser) return;
  const draft = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value
  };
  localStorage.setItem(`draftIntel_${currentUser}`, JSON.stringify(draft));
}

function loadDraft() {
  const draft = JSON.parse(localStorage.getItem(`draftIntel_${currentUser}`));
  if (draft) {
    document.getElementById('title').value = draft.title;
    document.getElementById('content').value = draft.content;
  }
}
// 🔄 On load, check if user is logged in
