// Cleanup: Remove Raila Odinga biography from public entries if present
function removeRailaOdingaFromPublic() {
  const key = "ZawadiLegacyKey2025";
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  if (allIntel['public']) {
    allIntel['public'] = allIntel['public'].filter(e => {
      try {
        return CryptoJS.AES.decrypt(e.title, key).toString(CryptoJS.enc.Utf8) !== "Raila Amolo Odinga";
      } catch { return true; }
    });
    localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  }
}
// Call cleanup once on load
removeRailaOdingaFromPublic();
// ===== Modal Dialog Logic =====
document.addEventListener('DOMContentLoaded', function() {
  // Modal elements
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const profileModal = document.getElementById('profileModal');
  // Triggers
  const openLogin = document.getElementById('openLoginModal');
  const openRegister = document.getElementById('openRegisterModal');
  const openProfile = document.getElementById('openProfileModal');
  // Close buttons
  const closeLogin = document.getElementById('closeLoginModal');
  const closeRegister = document.getElementById('closeRegisterModal');
  const closeProfile = document.getElementById('closeProfileModal');
  // Switch links
  const toRegister = document.getElementById('toRegisterModal');
  const toLogin = document.getElementById('toLoginModal');

  // Open modals
  if (openLogin) openLogin.onclick = () => { loginModal.style.display = 'block'; };
  if (openRegister) openRegister.onclick = () => { registerModal.style.display = 'block'; };
  if (openProfile) openProfile.onclick = () => { profileModal.style.display = 'block'; loadProfileModal(); };
  // Close modals
  if (closeLogin) closeLogin.onclick = () => { loginModal.style.display = 'none'; };
  if (closeRegister) closeRegister.onclick = () => { registerModal.style.display = 'none'; };
  if (closeProfile) closeProfile.onclick = () => { profileModal.style.display = 'none'; };
  // Switch between login/register
  if (toRegister) toRegister.onclick = () => { loginModal.style.display = 'none'; registerModal.style.display = 'block'; };
  if (toLogin) toLogin.onclick = () => { registerModal.style.display = 'none'; loginModal.style.display = 'block'; };
  // Close modal on outside click
  window.onclick = function(event) {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === registerModal) registerModal.style.display = 'none';
    if (event.target === profileModal) profileModal.style.display = 'none';
  };
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

let currentUser = localStorage.getItem('currentUser') || null;

if (currentUser) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appContent').classList.remove('hidden');
  document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
  loadDraft();
  revealAllIntel();
}


// 🔐 Encryption handled by crypto-vault.js
// Functions encrypt(text) and decrypt(cipher) are already loaded

// 🧼 Sanitize input
function sanitize(input) {
  return input.replace(/<[^>]*>?/gm, '');
}

// 🔁 Toggle login/register view
function toggleRegister() {
  document.getElementById('loginScreen').classList.toggle('hidden');
  document.getElementById('registerScreen').classList.toggle('hidden');
}

// 🆕 Register user
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

// 🔐 Login user
function loginUser() {
  const username = sanitize(document.getElementById('usernameInput').value.trim());
  const password = sanitize(document.getElementById('passwordInput').value);
  const error = document.getElementById('loginError');

  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  if (users[username] && decrypt(users[username]) === password) {
    currentUser = username;
    localStorage.setItem('currentUser', username);

  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('registerScreen').classList.add('hidden');
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

// 🚪 Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('appContent').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('currentUserDisplay').textContent = '';
  showNotification('Logged out.', 'info');
}

// 📥 Submit intel
document.getElementById('intelForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!currentUser) return;

  const title = encrypt(sanitize(document.getElementById('title').value));
  const content = encrypt(sanitize(document.getElementById('content').value));
  const tags = sanitize(document.getElementById('tagsInput').value);
  const isPublic = document.getElementById('makePublic').checked;

  const intel = {
    title,
    content,
    tags,
    author: currentUser,
    public: isPublic,
    timestamp: new Date().toISOString()
  };

  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const userIntel = allIntel[currentUser] || [];
  userIntel.push(intel);
  allIntel[currentUser] = userIntel;

  localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  localStorage.removeItem(`draftIntel_${currentUser}`);
  this.reset();
  revealAllIntel();
  showNotification('Intel submitted!', 'success');
// ===== User Profile Logic =====
function loadProfile() {
  if (!currentUser) return;
  const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`)) || {};
  document.getElementById('profileDisplayName').value = profile.displayName || '';
  document.getElementById('profileBio').value = profile.bio || '';
  updateProfileInfo(profile);
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
      const profile = { displayName, bio };
      localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profile));
      updateProfileInfo(profile);
      showNotification('Profile updated!', 'success');
    });
  }
});
});

// 📖 Reveal all entries
function revealAllIntel() {
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const entries = allIntel[currentUser] || [];
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
        ${entry.public ? '<span class="public-badge">🌍 Public</span>' : ''}
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
window.onload = function() {
  currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appContent').classList.remove('hidden');
  document.getElementById('currentUserDisplay').textContent = `Logged in as: ${currentUser}`;
  loadDraft();
  loadProfile();
  }
};