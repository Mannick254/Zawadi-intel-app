const correctPassword = "1234OCHY"; // You can change this

function checkPassword() {
  const input = document.getElementById('passwordInput').value;
  const error = document.getElementById('loginError');
  if (input === correctPassword) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    displayIntel(); // Load entries after unlocking
  } else {
    error.textContent = "Incorrect password. Try again.";
  }
}


// Handle form submission
document.getElementById('intelForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const intel = { title, content, timestamp: new Date().toISOString() };

  let storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];
  storedIntel.push(intel);
  localStorage.setItem('zawadiIntel', JSON.stringify(storedIntel));
  displayIntel();
  this.reset();
});

// Display all intel entries
function displayIntel() {
  const intelList = document.getElementById('intelList');
  intelList.innerHTML = '';
  let storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];

  // Sort by newest first
  storedIntel.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  storedIntel.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.innerHTML = `
      <h3>${entry.title}</h3>
      <p>${entry.content}</p>
      <small>${entry.timestamp}</small>
      <button onclick="deleteIntel('${entry.timestamp}')">Delete</button>
    `;
    intelList.appendChild(div);
  });
}

// Delete an intel entry
function deleteIntel(timestamp) {
  let storedIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || [];
  storedIntel = storedIntel.filter(entry => entry.timestamp !== timestamp);
  localStorage.setItem('zawadiIntel', JSON.stringify(storedIntel));
  displayIntel();
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

  const filtered = storedIntel.filter(entry =>
    entry.title.toLowerCase().includes(query) ||
    entry.content.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    intelList.innerHTML = '<p>No matching intel found.</p>';
    return;
  }

  filtered.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    div.innerHTML = `
      <h3>${highlight(entry.title, query)}</h3>
      <p>${highlight(entry.content, query)}</p>
      <small>${entry.timestamp}</small>
      <button onclick="deleteIntel('${entry.timestamp}')">Delete</button>
    `;
    intelList.appendChild(div);
  });
}

// Load intel on page load
window.onload = displayIntel;
const correctPassword = "zawadi2025"; // You can change this

function checkPassword() {
  const input = document.getElementById('passwordInput').value;
  if (input === correctPassword) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    displayIntel(); // Load entries after unlocking
  } else {
    document.getElementById('loginError').textContent = "Incorrect password. Try again.";
  }
}
document.getElementById('passwordForm').addEventListener('submit', function(e) {