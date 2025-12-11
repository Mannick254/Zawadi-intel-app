// scripts/main.js

// Toggle dropdown menus (e.g. Home ▾)
document.querySelectorAll('.home-btn').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});

// Toggle News dropdown
const newsBtn = document.querySelector('.news-btn');
const newsDropdown = document.querySelector('.news-dropdown');

if (newsBtn && newsDropdown) {
  newsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    newsDropdown.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!newsBtn.contains(e.target) && !newsDropdown.contains(e.target)) {
      newsDropdown.classList.remove('show');
    }
  });

  // Close dropdown when a link is clicked
  newsDropdown.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      newsDropdown.classList.remove('show');
    }
  });
}

// Basic search bar functionality (logs query)
const searchForm = document.querySelector('.search-bar');
if (searchForm) {
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = this.querySelector('input').value.trim();
    if (query) {
      console.log(`Searching for: ${query}`);
      // Future: Redirect to search results or filter archive
    }
  });
}

// Toggle mobile menu
const menuToggle = document.querySelector(".nav-toggle");
const mainLinks = document.querySelector(".main-links");

if (menuToggle && mainLinks) {
  menuToggle.addEventListener("click", () => {
    mainLinks.classList.toggle("show");
  });

  // Hide menu when a link is clicked
  mainLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      mainLinks.classList.remove("show");
    }
  });

  // Hide menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !mainLinks.contains(e.target) && mainLinks.classList.contains("show")) {
      mainLinks.classList.remove("show");
    }
  });
}

// --- Server-side auth with token-based sessions ---
// Admin credentials: Nickson / Zawadi@123
const AUTH_TOKEN_KEY = 'zawadi_auth_token_v1';
const GLOBAL_COUNT_KEY = 'zawadi_global_count_v1';

async function verifyToken(token) {
  // Try server first
  try {
    const resp = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await resp.json();
    if (resp.ok && result.ok) return result;
  } catch (e) {
    // continue to fallback
  }
  // Client-side fallback: decode token
  try {
    const decoded = atob(token);
    const [username, ts] = decoded.split(':');
    if (username && ts) {
      const users = JSON.parse(localStorage.getItem('zawadi_users') || '{}');
      const user = users[username];
      if (user) {
        return { ok: true, username, isAdmin: user.isAdmin };
      }
    }
  } catch (e) {}
  return null;
}

// Hide expired story cards based on data-expire attribute
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();

  document.querySelectorAll(".story-card").forEach(card => {
    const expireDate = new Date(card.dataset.expire);
    if (expireDate < now) {
      card.style.display = "none";
    }
  });
});

async function registerUser(username, password) {
  // Try server first
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await resp.json();
    if (resp.ok) return result;
  } catch (e) {
    // continue to fallback
  }
  // Client-side fallback: store users in localStorage
  console.warn('Warning: using insecure client-side registration. This is for demo purposes only.');
  const users = JSON.parse(localStorage.getItem('zawadi_users') || '{}');
  if (users[username]) return { ok: false, message: 'User already exists' };
  users[username] = { password: btoa(password), isAdmin: false, createdAt: Date.now() }; // Simple base64 encoding (not secure, for demo only)
  localStorage.setItem('zawadi_users', JSON.stringify(users));
  return { ok: true };
}

async function loginUser(username, password) {
  // Try server first
  try {
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await resp.json();
    if (resp.ok) {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      updateAuthUi();
      // The server should handle login recording. No need to call recordLogin here.
      return result;
    }
  } catch (e) {
    // continue to fallback
  }
  // Client-side fallback: check localStorage
  console.warn('Warning: using insecure client-side login. This is for demo purposes only.');
  const users = JSON.parse(localStorage.getItem('zawadi_users') || '{}');
  const user = users[username];
  if (!user || atob(user.password) !== password) return { ok: false, message: 'Invalid credentials' };
  const token = btoa(username + ':' + Date.now()); // Simple token
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  updateAuthUi();
  // record login globally
  recordLogin(username).catch(() => {});
  return { ok: true, token, isAdmin: user.isAdmin };
}

function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  updateAuthUi();
}

async function getCurrentUser() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  return await verifyToken(token);
}

async function recordLogin(username) {
  // Try to notify a server endpoint first
  try {
    const resp = await fetch('/api/login-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, ts: Date.now() })
    });
    if (resp.ok) return await resp.json();
  } catch (e) {
    // continue to fallback
  }
  // Fallback: count in localStorage (per-browser)
  const count = parseInt(localStorage.getItem(GLOBAL_COUNT_KEY) || '0', 10) + 1;
  localStorage.setItem(GLOBAL_COUNT_KEY, String(count));
  return { totalLogins: count, source: 'local' };
}

// Inject a small auth button and modal into the page
function createAuthUi() {
  if (document.getElementById('zawadi-auth')) return;

  // auth button
  const btn = document.createElement('button');
  btn.id = 'zawadi-auth-button';
  btn.style.position = 'fixed';
  btn.style.right = '12px';
  btn.style.top = '12px';
  btn.style.zIndex = 9999;
  btn.style.padding = '6px 10px';
  btn.style.borderRadius = '4px';
  btn.style.border = '1px solid rgba(0,0,0,0.15)';
  btn.style.background = '#fff';
  btn.style.cursor = 'pointer';
  btn.addEventListener('click', () => toggleAuthModal(true));
  document.body.appendChild(btn);

  // modal container
  const modal = document.createElement('div');
  modal.id = 'zawadi-auth';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.left = '0';
  modal.style.top = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.zIndex = 9998;
  modal.innerHTML = `
    <div style="max-width:380px;margin:8% auto;background:#fff;padding:18px;border-radius:6px;">
      <h3 style="margin:0 0 10px 0">Account</h3>
      <div id="zawadi-msg" style="color:#a33;margin-bottom:8px"></div>
      <label>Username</label>
      <input id="zawadi-username" style="width:100%;padding:8px;margin:6px 0" />
      <label>Password</label>
      <input id="zawadi-password" type="password" style="width:100%;padding:8px;margin:6px 0" />
      <div style="display:flex;gap:8px;margin-top:10px">
        <button id="zawadi-login" style="flex:1;padding:8px">Login</button>
        <button id="zawadi-register" style="flex:1;padding:8px">Register</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <span id="zawadi-status" style="font-size:13px;color:#333"></span>
        <div>
          <button id="zawadi-logout" style="display:none;padding:6px">Logout</button>
          <button id="zawadi-admin" style="display:none;padding:6px;margin-left:6px">Admin</button>
        </div>
      </div>
      <button id="zawadi-close" style="position:absolute;right:12px;top:12px;border:none;background:transparent;font-size:18px;cursor:pointer">×</button>
    </div>
  `;
  modal.addEventListener('click', (e) => { if (e.target === modal) toggleAuthModal(false); });
  document.body.appendChild(modal);

  // events
  document.getElementById('zawadi-login').addEventListener('click', async () => {
    const u = document.getElementById('zawadi-username').value.trim();
    const p = document.getElementById('zawadi-password').value;
    const msg = document.getElementById('zawadi-msg');
    msg.textContent = '';
    try {
      const r = await loginUser(u, p);
      if (!r || !r.ok) { msg.textContent = r && r.message ? r.message : 'Login failed'; return; }
      msg.style.color = 'green';
      msg.textContent = 'Logged in';
      toggleAuthModal(false);
    } catch (e) {
      msg.textContent = 'Login error';
    }
  });
  document.getElementById('zawadi-register').addEventListener('click', async () => {
    const u = document.getElementById('zawadi-username').value.trim();
    const p = document.getElementById('zawadi-password').value;
    const msg = document.getElementById('zawadi-msg');
    msg.textContent = '';
    try {
      const r = await registerUser(u, p);
      if (!r || !r.ok) { msg.textContent = r && r.message ? r.message : 'Registration failed'; return; }
      msg.style.color = 'green';
      msg.textContent = 'Registered. You can now login.';
    } catch (e) {
      msg.textContent = 'Registration error';
    }
  });
  document.getElementById('zawadi-close').addEventListener('click', () => toggleAuthModal(false));
  document.getElementById('zawadi-logout').addEventListener('click', () => { logoutUser(); toggleAuthModal(false); });
  document.getElementById('zawadi-admin').addEventListener('click', () => { window.location.href = '/admin.html'; });

  updateAuthUi();
}

function toggleAuthModal(show) {
  const m = document.getElementById('zawadi-auth');
  if (!m) return;
  m.style.display = show ? 'block' : 'none';
}

async function updateAuthUi() {
  const btn = document.getElementById('zawadi-auth-button');
  const status = document.getElementById('zawadi-status');
  const logout = document.getElementById('zawadi-logout');
  const adminBtn = document.getElementById('zawadi-admin');
  const current = await getCurrentUser();
  if (current) {
    if (btn) btn.textContent = current.username;
    if (status) status.textContent = `Signed in as ${current.username}`;
    if (logout) logout.style.display = 'inline-block';
    if (adminBtn) adminBtn.style.display = current.isAdmin ? 'inline-block' : 'none';
  } else {
    if (btn) btn.textContent = 'Login';
    if (status) status.textContent = 'Not signed in';
    if (logout) logout.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}

// Initialize auth UI on pages where this script loads
if (typeof document !== 'undefined') {
  try { createAuthUi(); } catch (e) { /* ignore */ }
}

// Make story headings clickable: wrap the heading in a link that points to the card's primary link
function makeTitlesClickable() {
  try {
    const cards = Array.from(document.querySelectorAll('.story-card'));
    cards.forEach(card => {
      // find first meaningful link inside the card
      const link = card.querySelector('a[href]');
      if (!link) return;
      // find first heading inside the card
      const heading = card.querySelector('h1,h2,h3,h4,h5');
      if (!heading) return;
      // if heading already contains a link, skip
      if (heading.querySelector('a')) return;
      // create an anchor that points to the primary link
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.className = 'story-title-link';
      a.setAttribute('aria-label', (heading.textContent || 'Open story').trim());
      // move heading's children into the anchor
      while (heading.firstChild) a.appendChild(heading.firstChild);
      heading.appendChild(a);
      // make the whole heading keyboard friendly
      a.style.color = 'inherit';
      a.style.textDecoration = 'none';
      a.style.cursor = 'pointer';
    });
  } catch (e) {
    console.warn('makeTitlesClickable failed', e);
  }
}

// Run after DOM ready so existing story cards are present
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', makeTitlesClickable);
else makeTitlesClickable();

// --- Inline story modal: fetch & show full story when a title is clicked ---
function setupStoryModal() {
  if (typeof document === 'undefined') return;

  function createModalIfNeeded() {
    if (document.getElementById('story-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'story-modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'none';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.zIndex = 99999;
    modal.innerHTML = `
      <div id="story-modal-content" style="max-width:900px;width:95%;max-height:90%;overflow:auto;border-radius:8px;background:#fff;padding:18px;position:relative;">
        <button id="story-modal-close" aria-label="Close story" style="position:absolute;right:12px;top:12px;border:none;background:transparent;font-size:22px;cursor:pointer">×</button>
        <div id="story-modal-body"></div>
      </div>`;
    document.body.appendChild(modal);

    // close handlers
    document.getElementById('story-modal-close').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModal(); });
  }

  function showModal(html, title, sourceUrl) {
    createModalIfNeeded();
    const modal = document.getElementById('story-modal');
    const body = document.getElementById('story-modal-body');
    if (!modal || !body) return;
    // set content
    body.innerHTML = '';

    // Build a toolbar with source / actions
    const toolbar = document.createElement('div');
    toolbar.className = 'modal-article';
    const tbar = document.createElement('div');
    tbar.className = 'modal-toolbar';

    const metaSpan = document.createElement('div');
    metaSpan.className = 'meta';
    metaSpan.textContent = sourceUrl ? sourceUrl.replace(/^https?:\/\//, '') : '';

    const actions = document.createElement('div');

    const openBtn = document.createElement('button');
    openBtn.className = 'open-link';
    openBtn.textContent = 'Open original';
    openBtn.addEventListener('click', () => { if (sourceUrl) window.open(sourceUrl, '_blank'); });

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy link';
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && sourceUrl) await navigator.clipboard.writeText(sourceUrl);
        else prompt('Copy link', sourceUrl || location.href);
      } catch (e) { prompt('Copy link', sourceUrl || location.href); }
    });

    actions.appendChild(openBtn);
    actions.appendChild(copyBtn);
    tbar.appendChild(metaSpan);
    tbar.appendChild(actions);
    toolbar.appendChild(tbar);

    // Article container with Al-Jazeera style: headline, meta, lead, body
    const article = document.createElement('article');
    article.className = 'modal-article';

    // Title
    if (title) {
      const h = document.createElement('h1');
      h.textContent = title;
      article.appendChild(h);
    }

    // Parse the html and extract ONLY the first <article> element to avoid showing the whole page
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const articleEl = tempDiv.querySelector('article');
    let cleanHtml = html;
    
    if (articleEl) {
      // Found an article element; use only its innerHTML
      cleanHtml = articleEl.innerHTML;
    } else {
      // No article found; try to extract just the content without parent wrappers
      // Remove common page wrapper elements
      const mainContent = tempDiv.querySelector('main, .aj-main, .content, [role="main"]');
      if (mainContent) {
        cleanHtml = mainContent.innerHTML;
      }
      // As a last resort, use the first significant content block
      const firstSection = tempDiv.querySelector('section, .section, [role="region"]');
      if (firstSection) {
        cleanHtml = firstSection.innerHTML;
      }
    }

    // attach cleaned html into a body wrapper and attempt to extract a lead paragraph
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'modal-body';
    bodyWrapper.innerHTML = cleanHtml;

    // If first child paragraph looks like a lead, promote it
    const firstP = bodyWrapper.querySelector('p');
    if (firstP) {
      const lead = document.createElement('p');
      lead.className = 'lead';
      lead.textContent = firstP.textContent;
      // remove the promoted paragraph from bodyWrapper to avoid duplication
      firstP.parentNode && firstP.parentNode.removeChild(firstP);
      article.appendChild(lead);
    }

    article.appendChild(bodyWrapper);
    toolbar.appendChild(article);

    body.appendChild(toolbar);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    const modal = document.getElementById('story-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Extract content from fetched document: look for fragment ID, then sensible article selectors
  // IMPORTANT: always return ONLY the inner HTML of the first <article> element to avoid showing multiple articles
  function extractArticleFromDoc(doc, fragmentId) {
    let targetArticle = null;
    
    // If fragmentId is provided, find that specific article by id
    if (fragmentId) {
      const el = doc.getElementById(fragmentId);
      if (el && el.tagName && el.tagName.toLowerCase() === 'article') {
        targetArticle = el;
      } else if (el) {
        // If the element is a parent, find the first <article> child
        targetArticle = el.querySelector('article');
      }
      if (!targetArticle) {
        console.debug('[story-modal] fragment article not found in fetched doc:', fragmentId);
      }
    }
    
    // If no fragment found, try common selectors to find the first article
    if (!targetArticle) {
      const selectors = ['article.story-card', 'article', '.feature-article', '.story-card', '.feature'];
      for (const sel of selectors) {
        targetArticle = doc.querySelector(sel);
        if (targetArticle) break;
      }
    }
    
    // If we found an article, extract ONLY its inner HTML (not the article tag itself, just contents)
    if (targetArticle) {
      const title = targetArticle.querySelector('h1,h2,h3') ? (targetArticle.querySelector('h1,h2,h3').textContent || '') : '';
      // Return only the article's inner content, stripping all outer wrappers
      return { html: targetArticle.innerHTML, title: title };
    }
    
    console.debug('[story-modal] no article found in fetched doc');
    return null;
  }

  // Click handler (delegated)
  // Track modal open state to avoid re-entrant handling
  let _storyModalOpen = false;

  // Auto-open if the page loads with a hash (useful for testing and deep-linking)
  try {
    if (location && location.hash) {
      const fragOnLoad = location.hash.slice(1);
      // open after a short delay so DOM has fully initialized
      window.addEventListener('DOMContentLoaded', () => {
        try {
          const elOnLoad = document.getElementById(fragOnLoad);
          if (elOnLoad) {
            console.debug('[story-modal] auto-opening fragment on load:', fragOnLoad);
            _storyModalOpen = true;
            const titleText = elOnLoad.querySelector('h1,h2,h3') ? (elOnLoad.querySelector('h1,h2,h3').textContent || '') : document.title;
            const source = location.href;
            // ensure the modal exists and then show
            setTimeout(() => { showModal(elOnLoad.innerHTML, titleText, source); _storyModalOpen = false; }, 60);
          }
        } catch (e) { /* ignore auto-open errors */ }
      });
    }
  } catch (e) { /* ignore */ }

  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a.story-title-link');
    if (!a) return;
    // Prevent duplicate handling while modal content is being prepared
    if (_storyModalOpen) return;

    // Only handle same-origin links
    try {
      const href = a.getAttribute('href');
      if (!href) return;

      // prefer the id of the nearest .story-card in the current document when available
      const localCard = a.closest && a.closest('.story-card');
      const preferredFragment = (localCard && localCard.id) ? localCard.id : null;

      // If it's an in-page anchor on the same document, open that specific element
      if (href.startsWith('#')) {
        const frag = preferredFragment || href.slice(1);
        const el = document.getElementById(frag);
        if (el) {
          e.preventDefault();
          _storyModalOpen = true;
          const titleText = el.querySelector('h1,h2,h3') ? (el.querySelector('h1,h2,h3').textContent || '') : a.textContent;
          const source = location.href.split('#')[0] + '#' + frag;
          console.debug('[story-modal] opening in-page fragment', frag, 'source:', source);
          showModal(el.innerHTML, titleText, source);
          _storyModalOpen = false;
          return;
        }
      }

      const url = new URL(href, location.href);
      // only handle same-origin
      if (url.origin !== location.origin) return;

      e.preventDefault();
      const fragmentFromHref = url.hash ? url.hash.slice(1) : null;
      // prefer the local card id as the fragment when present to ensure we open exactly the clicked story
      const fragment = preferredFragment || fragmentFromHref || null;

      _storyModalOpen = true;
      // fetch the target page and extract the article
      fetch(url.pathname + url.search).then(resp => {
        if (!resp.ok) throw new Error('Fetch failed');
        return resp.text();
      }).then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const found = extractArticleFromDoc(doc, fragment);
        if (found) {
          console.debug('[story-modal] fetched and extracted fragment:', fragment, 'title:', found.title);
          showModal(found.html, found.title || a.textContent.trim(), url.href + (fragment ? ('#' + fragment) : ''));
        } else {
          // fallback: open the link normally
          window.location.href = href;
        }
      }).catch(err => {
        console.warn('Could not load story inline, falling back to navigation', err);
        window.location.href = href;
      }).finally(() => { _storyModalOpen = false; });
    } catch (err) {
      // ignore and allow default
      console.warn('story modal handler error', err);
    }
  });
}

// Attach on ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupStoryModal);
else setupStoryModal();

// Additional install prompt script
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').style.display = 'block';
});

// Attach install prompt to any install buttons (banner button or header/install buttons). Use querySelectorAll
Array.from(document.querySelectorAll('#install-banner button, button#install-button')).forEach(btn => {
  btn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
        const banner = document.getElementById('install-banner');
        if (banner) banner.style.display = 'none';
      });
    }
  });
});

// --- Push Notification Subscription ---
async function subscribeUser() {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BOA0NjzLhlXvX05nWd0Q7MrDE3A8zSvUGKH-aQ0_cejhmWI7BRCdUFALsckKWHCol11QVhcifANZwvOSNdnnmNI"
      });
      console.log("User subscribed:", JSON.stringify(subscription));
      // Send subscription to your server to store
      await fetch("/save-subscription", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Push subscription failed:", error);
    }
  }
}

// Notifications button
document.getElementById("enable-notifications").addEventListener("click", () => {
  subscribeUser();
});

// Missing functions for onclick handlers
function installApp() {
  alert("Install feature coming soon!");
}

function calc() {
  const num1 = parseFloat(document.getElementById('num1').value) || 0;
  const num2 = parseFloat(document.getElementById('num2').value) || 0;
  const result = num1 + num2;
  document.getElementById('calc-result').textContent = `Result: ${result}`;
}

function saveNotes() {
  const notes = document.getElementById('notes').value;
  localStorage.setItem('offline-notes', notes);
  document.getElementById('notes-status').textContent = 'Notes saved!';
  setTimeout(() => {
    document.getElementById('notes-status').textContent = '';
  }, 2000);
}

function play(button) {
  // Simple tic-tac-toe logic
  if (button.textContent === '') {
    button.textContent = 'X';
    // Basic AI: random empty cell
    const buttons = Array.from(document.querySelectorAll('#tic-tac-toe button'));
    const empty = buttons.filter(b => b.textContent === '');
    if (empty.length > 0) {
      const random = empty[Math.floor(Math.random() * empty.length)];
      random.textContent = 'O';
    }
  }
}

function toggleStory(element) {
  const story = element.parentElement;
  const content = story.querySelector('.text-block');
  if (content) {
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  }
}

function supportUkraine() {
  window.open('https://www.unicef.org/emergencies/ukraine-crisis', '_blank');
}

function sharePage() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}

function joinDiscussion() {
  alert('Discussion feature coming soon!');
}

function learnCybersecurity() {
  window.open('https://www.cisa.gov/secure-our-world', '_blank');
}

function findTestingCenter() {
  window.open('https://www.who.int/health-topics/hiv-aids', '_blank');
}
