const encryptionKey = "ZawadiLegacyKey2025"; // 🔐 Change for production
let currentUser = null;

// AES Encrypt/Decrypt
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

// Sanitize input
function sanitize(input) {
  return input.replace(/<[^>]*>?/gm, '');
}

// Toggle login/register
function toggleRegister() {
  document.getElementById('loginScreen').classList.toggle('hidden');
  document.getElementById('registerScreen').classList.toggle('hidden');
}

// Register user
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

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('registerScreen').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
  } else {
    error.textContent = "Incorrect username or password.";
  }
}

// Logout
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('appContent').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('currentUserDisplay').textContent = '';
}
// Submit intel
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
});
function revealAllIntel() {
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const entries = allIntel[currentUser] || [];
  const list = document.getElementById('intelList');
  list.innerHTML = '';

  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.innerHTML = `
      <h3>${decrypt(entry.title)}</h3>
      <p>${decrypt(entry.content)}</p>
      <small>${entry.timestamp}</small>
    `;
    list.appendChild(div);
  });

  document.getElementById('entryCount').textContent = `Total Entries: ${entries.length}`;
}
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

function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
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
  if (!currentUser) return;
  const draft = JSON.parse(localStorage.getItem(`draftIntel_${currentUser}`));
  if (draft) {
    document.getElementById('title').value = draft.title;
    document.getElementById('content').value = draft.content;
  }
}
