const correctPassword = "zawadi2025"; // Set your password here

function checkPassword() {
  const input = document.getElementById('passwordInput').value;
  const error = document.getElementById('loginError');
  if (input === correctPassword) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    loadDraft();
    document.getElementById('intelList').innerHTML = '<p>🔍 Search to reveal intel entries.</p>';
    document.getElementById('entryCount').textContent = '';
  } else {
    error.textContent = "Incorrect password. Try again.";
  }
}

// Encrypt and decrypt functions
function encrypt(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function decrypt(text) {
  return decodeURIComponent(escape(atob(text)));
}

// Handle form submission
document.getElementById('intelForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const title = encrypt(document.getElementById('title').value);
  const content = encrypt(document.getElementById('content').value);
  const intel = { title, content, timestamp: new Date().toISOString() };

  let storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];
  storedIntel.push(intel);
  localStorage.setItem('zawadiIntel', JSON.stringify(storedIntel));
  localStorage.removeItem('draftIntel');
  this.reset();
  document.getElementById('intelList').innerHTML = '<p>✅ Intel saved. Search to view.</p>';
  document.getElementById('entryCount').textContent = '';
});

// Delete an intel entry
function deleteIntel(timestamp) {
  let storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];
  storedIntel = storedIntel.filter(entry => entry.timestamp !== timestamp);
  localStorage.setItem('zawadiIntel', JSON.stringify(storedIntel));
  searchIntel(); // Refresh search results
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
  const storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];

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

// Logout logic
function logout() {
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('intelList').innerHTML = '';
  document.getElementById('entryCount').textContent = '';
}

// Auto-save draft
document.getElementById('title').addEventListener('input', saveDraft);
document.getElementById('content').addEventListener('input', saveDraft);

function saveDraft() {
  const draft = {
    title: document.getElementById('title').value,
    content: document.getElementById('content').value
  };
  localStorage.setItem('draftIntel', JSON.stringify(draft));
}

function loadDraft() {
  const draft = JSON.parse(localStorage.getItem('draftIntel'));
  if (draft) {
    document.getElementById('title').value = draft.title;
    document.getElementById('content').value = draft.content;
  }
}

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Splash delay (no auto-display)
window.onload = () => {
  setTimeout(() => {
    document.title = "Zawadi Intel 🔐";
  }, 500);
};
