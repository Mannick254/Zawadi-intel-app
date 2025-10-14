function decrypt(cipher) {
  try {
    // IMPORTANT: Hardcoded key is INSECURE for production data.
    // This is only for demonstration within the original code's structure.
    return CryptoJS.AES.decrypt(cipher, "2025Zawadi").toString(CryptoJS.enc.Utf8);
  } catch {
    // Consider logging the error for debugging
    console.error("Decryption Failed:", cipher);
    return "[Decryption Failed]";
  }
}

function loadPublicIntel() {
  const publicEntries = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const list = document.getElementById('publicList');
  if (!list) {
      console.error("Element with id 'publicList' not found.");
      return;
  }
  list.innerHTML = '';

  // Collect all public entries from all users and from the 'public' array
  let allPublic = [];
  Object.values(publicEntries).forEach(val => {
    if (Array.isArray(val)) {
      allPublic = allPublic.concat(val.filter(e => e.public));
    }
  });

  // Sort by most recent
  allPublic.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (allPublic.length === 0) {
      list.innerHTML = '<p>No public biographies posted yet.</p>';
      return;
  }

  allPublic.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'intel-entry';
    // Added basic sanitation for potentially harmful HTML
    const safeTitle = escapeHTML(decrypt(entry.title));
    const safeContent = escapeHTML(decrypt(entry.content));
    const safeQuote = entry.quote ? escapeHTML(decrypt(entry.quote)) : '';
    const safeAuthor = escapeHTML(entry.author);
    const safeTimestamp = escapeHTML(entry.timestamp);

    div.innerHTML = `
      <h3>${safeTitle}</h3>
      <p>${safeContent}</p>
      ${safeQuote ? `<blockquote class="quote">${safeQuote}</blockquote>` : ''}
      <small>By ${safeAuthor} — ${safeTimestamp}</small>
    `;
    list.appendChild(div);
  });
}

// Basic HTML escaping function to mitigate XSS risks from displaying user input
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&';
            case '<': return '<';
            case '>': return '>';
            case '"': return '"';
            case "'": return '&#039;';
        }
    });
}


// Handle public biography submission
document.addEventListener('DOMContentLoaded', function() {
  const bioForm = document.getElementById('bioForm');
  const bioNameInput = document.getElementById('bioName');
  const bioContentInput = document.getElementById('bioContent');
  const bioQuoteInput = document.getElementById('bioQuote');
  const bioFormMsg = document.getElementById('bioFormMsg');

  if (bioForm) {
    bioForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = bioNameInput.value.trim();
      const content = bioContentInput.value.trim();
      const quote = bioQuoteInput.value.trim();
      const msg = bioFormMsg;

      if (!name || !content) {
        msg.textContent = 'Name and biography are required.';
        return;
      }

      // Encrypt fields
      // IMPORTANT: Hardcoded key and client-side encryption are INSECURE for production data.
      const entry = {
        title: CryptoJS.AES.encrypt(name, "2025Zawadi").toString(),
        content: CryptoJS.AES.encrypt(content, "2025Zawadi").toString(),
        quote: quote ? CryptoJS.AES.encrypt(quote, "2025Zawadi").toString() : '',
        author: name, // Storing author unencrypted might be intentional, but consider implications
        public: true,
        timestamp: new Date().toLocaleString()
      };

      // Save to zawadiIntel
      const allIntel = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
      if (!allIntel['public']) allIntel['public'] = [];
      allIntel['public'].push(entry);
      localStorage.setItem('zawadiIntel', JSON.stringify(allIntel));

      msg.textContent = '✅ Biography posted!';
      bioForm.reset();
      loadPublicIntel();
    });
  } else {
      console.error("Element with id 'bioForm' not found.");
  }
});

function showRandomIntel() {
  const publicEntries = JSON.parse(localStorage.getItem('zawadiIntel')) || {};
  const entries = Object.values(publicEntries).flat().filter(e => e.public);
  if (entries.length === 0) {
      alert("No public biographies available yet.");
      return;
  }

  const entry = entries[Math.floor(Math.random() * entries.length)];
  // Added basic sanitation for the alert box
  const safeTitle = escapeHTML(decrypt(entry.title));
  const safeContent = escapeHTML(decrypt(entry.content));
  const safeAuthor = escapeHTML(entry.author);

  alert(`"${safeTitle}"\n\n${safeContent}\n\n— ${safeAuthor}`);
}

function saveGuestLegacy() {
  const guestLegacyTextarea = document.getElementById('guestLegacy');
  const guestDisplayDiv = document.getElementById('guestDisplay');
  if (!guestLegacyTextarea || !guestDisplayDiv) {
      console.error("Guest legacy elements not found.");
      return;
  }
  const text = guestLegacyTextarea.value.trim();
  localStorage.setItem('guestLegacy', text);
  guestDisplayDiv.textContent = text;
}

window.onload = () => {
  loadPublicIntel();
  const saved = localStorage.getItem('guestLegacy');
  const guestLegacyTextarea = document.getElementById('guestLegacy');
  const guestDisplayDiv = document.getElementById('guestDisplay');

  if (saved && guestLegacyTextarea && guestDisplayDiv) {
    guestLegacyTextarea.value = saved;
    guestDisplayDiv.textContent = saved;
  } else if (guestDisplayDiv) {
      guestDisplayDiv.textContent = ""; // Clear display if no saved legacy
  }
};
