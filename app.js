const authorUsername = "Nickson"; // Your author account name
const authorPassword = "blessedhots2025"; // Your private access password


let currentUser = null;

// Encrypt and decrypt functions
function encrypt(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function decrypt(text) {
  return decodeURIComponent(escape(atob(text)));
}

// Toggle between login and registration
function toggleRegister() {
  const loginScreen = document.getElementById('loginScreen');
  const registerScreen = document.getElementById('registerScreen');
  if (loginScreen.style.display === 'none') {
    loginScreen.style.display = 'block';
    registerScreen.style.display = 'none';
  } else {
    loginScreen.style.display = 'none';
    registerScreen.style.display = 'block';
  }
}

// Register new user
function registerUser() {
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value;
  const error = document.getElementById('registerError');

  if (!username || !password) {
    error.textContent = "Username and password required.";
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
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const error = document.getElementById('loginError');
  document.getElementById('settingsPanel').style.display = (currentUser === authorUsername) ? 'block' : 'none';


  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  if (users[username] && decrypt(users[username]) === password) {
    currentUser = username;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
    loadDraft();
    document.getElementById('intelList').innerHTML = '<p>🔍 Search to reveal intel entries.</p>';
    document.getElementById('entryCount').textContent = '';
  } else {
    error.textContent = "Invalid credentials.";
  }
}

// Handle form submission
document.getElementById('intelForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!currentUser) return;

  const title = encrypt(document.getElementById('title').value);
  const content = encrypt(document.getElementById('content').value);
  const intel = { title, content, timestamp: new Date().toISOString() };

  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const userIntel = allIntel[currentUser] || [];
  userIntel.push(intel);
  allIntel[currentUser] = userIntel;
  localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  localStorage.removeItem(`draftIntel_${currentUser}`);
  this.reset();
  document.getElementById('intelList').innerHTML = '<p>✅ Intel saved. Search to view.</p>';
  document.getElementById('entryCount').textContent = '';
});

// Delete an intel entry
function deleteIntel(timestamp) {
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  let userIntel = allIntel[currentUser] || [];
  userIntel = userIntel.filter(entry => entry.timestamp !== timestamp);
  allIntel[currentUser] = userIntel;
  localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));
  searchIntel();
}

// Highlight matched text
function highlight(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Search intel entries
function searchIntel() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const intelList = document.getElementById('intelList');
  intelList.innerHTML = '';
  const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const storedIntel = allIntel[currentUser] || [];

  if (!query) {
    intelList.innerHTML = '<p>🔍 Enter a keyword to reveal intel.</p>';
    document.getElementById('entryCount').textContent = '';
    return;
  }

  const filtered = storedIntel.filter(entry =>
    decrypt(entry.title).toLowerCase().includes(query) ||
    decrypt(entry.content).toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    intelList.innerHTML = '<p>No matching intel found.</p>';
    document.getElementById('entryCount').textContent = 'Total Entries: 0';
    return;
  }

  filtered.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.innerHTML = `
      <h3>${highlight(decrypt(entry.title), query)}</h3>
      <p>${highlight(decrypt(entry.content), query)}</p>
      <small>${entry.timestamp}</small>
      <button onclick="deleteIntel('${entry.timestamp}')">Delete</button>
    `;
    intelList.appendChild(div);
  });

  document.getElementById('entryCount').textContent = `Total Entries: ${filtered.length}`;
}

// Auto-save draft
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

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Install prompt logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.createElement('button');
  installBtn.textContent = '📥 Install Zawadi Intel';
  installBtn.style.margin = '10px';
  installBtn.onclick = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Zawadi Intel installed');
      }
      deferredPrompt = null;
    });
  };

  document.body.appendChild(installBtn);
});

// Splash delay
window.onload = () => {
  setTimeout(() => {
    document.title = "Zawadi Intel 🔐";
  }, 500);
};
function logout() {
  currentUser = null;
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('intelList').innerHTML = '';
  document.getElementById('entryCount').textContent = '';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('currentUserDisplay').textContent = '';
}
function loginUser() {
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const error = document.getElementById('loginError');

  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};
  if (users[username] && decrypt(users[username]) === password) {
    currentUser = username;

    // Log login history
    const loginLog = JSON.parse(localStorage.getItem('zawadiLoginLog')) || [];
    loginLog.push({ user: username, time: new Date().toISOString() });
    localStorage.setItem('zawadiLoginLog', JSON.stringify(loginLog));

    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('currentUserDisplay').textContent = `👤 Logged in as: ${currentUser}`;
    loadDraft();
    document.getElementById('intelList').innerHTML = '<p>🔍 Search to reveal intel entries.</p>';
    document.getElementById('entryCount').textContent = '';
  } else {
    error.textContent = "Invalid credentials.";
  }
}
function showLoginStats() {
  const statsDiv = document.getElementById('loginStats');

  // Check if current user is the author
  if (currentUser !== authorUsername) {
    statsDiv.innerHTML = "<p style='color:red;'>Access denied. Author only.</p>";
    return;
  }

  // Prompt for password
  const input = prompt("🔐 Author access only. Enter password:");
  if (input !== authorPassword) {
    statsDiv.innerHTML = "<p style='color:red;'>Incorrect password.</p>";
    return;
  }

  // Show login stats
  const loginLog = JSON.parse(localStorage.getItem('zawadiLoginLog')) || [];
  const users = JSON.parse(localStorage.getItem('zawadiUsers')) || {};

  let html = `<p>Total Registered Users: ${Object.keys(users).length}</p>`;
  html += `<p>Total Logins Recorded: ${loginLog.length}</p>`;
  html += `<ul>`;
  loginLog.slice().reverse().forEach(entry => {
    html += `<li>${entry.user} logged in at ${new Date(entry.time).toLocaleString()}</li>`;
  });
  html += `</ul>`;

  statsDiv.innerHTML = html;
}

