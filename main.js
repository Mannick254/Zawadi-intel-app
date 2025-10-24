// scripts/main.js

// Toggle dropdown menus (e.g. Home ▾)
document.querySelectorAll('.home-btn').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});

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

// Optional: Mobile nav toggle (if added later)
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.querySelector('.main-links').classList.toggle('open');
  });
}

// Install prompt for mobile devices
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can install the PWA
  showInstallButton();
  // If the browser does not support beforeinstallprompt, show a local fallback on mobile
  setTimeout(() => {
    tryShowInstallFallback();
  }, 700);
});

window.addEventListener('appinstalled', (evt) => {
  // Log install to analytics
  console.log('PWA was installed');
  // Hide the install button
  hideInstallButton();
  // Hide banner if present
  hideInstallBanner();
  // If the browser does not support beforeinstallprompt, show a local fallback on mobile
  setTimeout(() => {
    tryShowInstallFallback();
  }, 700);
});

function showInstallButton() {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'inline-block';
  }
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
}

// --- Install fallback helpers ---
function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/windows/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function tryShowInstallFallback() {
  // If we have the native beforeinstallprompt flow available, don't show fallback
  var supportsPrompt = ('onbeforeinstallprompt' in window) || (typeof window.BeforeInstallPromptEvent !== 'undefined');
  // If already installed (display-mode standalone or navigator.standalone), skip
  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  isStandalone = isStandalone || (navigator.standalone === true);

  if (supportsPrompt || isStandalone) return;

  // Only show fallback on mobile devices
  if (!isIos() && !isAndroid()) return;

  var banner = document.getElementById('install-banner');
  if (!banner) return;

  var textEl = banner.querySelector('.install-text');
  var installBtn = document.getElementById('install-button');

  if (isIos()) {
    // iOS: instruct to use Share -> Add to Home Screen
    if (textEl) textEl.innerHTML = 'To install this site: tap the Share button (▴) in Safari and choose "Add to Home Screen".';
  } else if (isAndroid()) {
    if (textEl) textEl.innerHTML = 'To install: open the browser menu (⋮) and choose "Add to Home screen".';
  }

  // Hide the programmatic install button (not supported) and show banner
  if (installBtn) installBtn.style.display = 'none';
  banner.style.display = 'flex';
}

function hideInstallButton() {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
}

function hideInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
}

function installApp() {
  // Hide the app provided install promotion
  hideInstallButton();
  hideInstallBanner();
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
}

// --- Simple client-side auth and login-tracking ---
// Admin credentials: Nickson / Zawadi@123
const AUTH_USERS_KEY = 'zawadi_users_v1';
const CURRENT_USER_KEY = 'zawadi_current_user_v1';
const GLOBAL_COUNT_KEY = 'zawadi_global_count_v1';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function hashPw(pw) {
  // lightweight obfuscation - not a replacement for server-side hashing
  return btoa(pw);
}

// Ensure admin exists
(function ensureAdmin() {
  const users = getUsers();
  if (!users['Nickson']) {
    users['Nickson'] = { password: hashPw('Zawadi@123'), isAdmin: true };
    saveUsers(users);
  }
})();

function registerUser(username, password) {
  if (!username || !password) return { ok: false, message: 'Username and password required' };
  const users = getUsers();
  if (users[username]) return { ok: false, message: 'User already exists' };
  users[username] = { password: hashPw(password), isAdmin: false, createdAt: Date.now() };
  saveUsers(users);
  return { ok: true };
}

function loginUser(username, password) {
  const users = getUsers();
  const u = users[username];
  if (!u) return { ok: false, message: 'User not found. Please register.' };
  if (u.password !== hashPw(password)) return { ok: false, message: 'Invalid password' };
  const current = { username: username, isAdmin: !!u.isAdmin, loggedAt: Date.now() };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
  // record login globally (try server, fallback to localStorage)
  recordLogin(username).catch(() => {});
  updateAuthUi();
  return { ok: true };
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  updateAuthUi();
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

async function recordLogin(username) {
  // Try to notify a server endpoint first
  try {
    const resp = await fetch('/api/login', {
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
  document.getElementById('zawadi-login').addEventListener('click', () => {
    const u = document.getElementById('zawadi-username').value.trim();
    const p = document.getElementById('zawadi-password').value;
    const r = loginUser(u, p);
    const msg = document.getElementById('zawadi-msg');
    if (!r.ok) { msg.textContent = r.message; return; }
    msg.textContent = 'Logged in';
    toggleAuthModal(false);
  });
  document.getElementById('zawadi-register').addEventListener('click', () => {
    const u = document.getElementById('zawadi-username').value.trim();
    const p = document.getElementById('zawadi-password').value;
    const r = registerUser(u, p);
    const msg = document.getElementById('zawadi-msg');
    if (!r.ok) { msg.textContent = r.message; return; }
    msg.textContent = 'Registered. You can now login.';
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

function updateAuthUi() {
  const btn = document.getElementById('zawadi-auth-button');
  const status = document.getElementById('zawadi-status');
  const logout = document.getElementById('zawadi-logout');
  const adminBtn = document.getElementById('zawadi-admin');
  const current = getCurrentUser();
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

  function showModal(html, title) {
    createModalIfNeeded();
    const modal = document.getElementById('story-modal');
    const body = document.getElementById('story-modal-body');
    if (!modal || !body) return;
    // set content
    body.innerHTML = '';
    if (title) {
      const h = document.createElement('h2');
      h.textContent = title;
      body.appendChild(h);
    }
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    body.appendChild(wrapper);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    const modal = document.getElementById('story-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Extract content from fetched document: look for fragment ID, then sensible article selectors
  function extractArticleFromDoc(doc, fragmentId) {
    if (fragmentId) {
      const el = doc.getElementById(fragmentId);
      if (el) return { html: el.innerHTML, title: el.querySelector('h1,h2,h3') ? (el.querySelector('h1,h2,h3').textContent || '') : '' };
    }
    // common selectors to try
    const selectors = ['.feature-article', 'article.story-card', 'article', '.story-card', '.feature'];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) return { html: el.innerHTML, title: el.querySelector('h1,h2,h3') ? (el.querySelector('h1,h2,h3').textContent || '') : '' };
    }
    return null;
  }

  // Click handler (delegated)
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a.story-title-link');
    if (!a) return;
    // Only handle same-origin links
    try {
      const href = a.getAttribute('href');
      if (!href) return;
      // If it's an in-page anchor on the same document
      if (href.startsWith('#')) {
        const el = document.getElementById(href.slice(1));
        if (el) {
          e.preventDefault();
          showModal(el.innerHTML, el.querySelector('h1,h2,h3') ? (el.querySelector('h1,h2,h3').textContent || '') : a.textContent);
          return;
        }
      }
      const url = new URL(href, location.href);
      // only handle same-origin
      if (url.origin !== location.origin) return;

      e.preventDefault();
      const fragment = url.hash ? url.hash.slice(1) : null;
      // fetch the target page and extract the article
      fetch(url.pathname + url.search).then(resp => {
        if (!resp.ok) throw new Error('Fetch failed');
        return resp.text();
      }).then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const found = extractArticleFromDoc(doc, fragment);
        if (found) {
          showModal(found.html, found.title || a.textContent.trim());
        } else {
          // fallback: open the link normally
          window.location.href = href;
        }
      }).catch(err => {
        console.warn('Could not load story inline, falling back to navigation', err);
        window.location.href = href;
      });
    } catch (err) {
      // ignore and allow default
      console.warn('story modal handler error', err);
    }
  });
}

// Attach on ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupStoryModal);
else setupStoryModal();

// --- Page shuffle on refresh or after 1 minute ---
(function setupPageShuffle() {
  // list of site pages to shuffle between (relative to site root)
  const pages = [
    '/index.html', '/news.html', '/global.html', '/africa.html', '/media.html',
    '/biography.html', '/books.html', '/app.html', '/offline.html', '/sport.html'
  ];

  function currentPage() {
    const p = location.pathname;
    // normalize: if path ends with /, treat as /index.html
    if (p === '/' || p === '') return '/index.html';
    return p;
  }

  function pickRandomPage() {
    const cur = currentPage();
    const candidates = pages.filter(p => p !== cur && p !== '/admin.html');
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Shuffle story cards on the current page by reordering their DOM nodes
  // This preserves event listeners and avoids duplicating IDs
  function shuffleStories() {
    try {
      const cards = Array.from(document.querySelectorAll('.story-card'));
      if (!cards || cards.length < 2) return;

      // Group cards by their immediate parent so we shuffle within containers
      const groups = new Map();
      cards.forEach(card => {
        const parent = card.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(card);
      });

      // For each group, perform an in-place Fisher-Yates shuffle of the nodes
      let total = 0;
      groups.forEach((nodes, parent) => {
        if (!nodes || nodes.length < 2) return;
        total += nodes.length;
        const shuffled = nodes.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
        }
        // Append nodes in shuffled order; appendChild moves existing nodes
        shuffled.forEach(node => parent.appendChild(node));
      });

      console.log('Shuffled', total, 'stories (by reordering nodes)');
    } catch (e) {
      console.warn('shuffleStories failed', e);
    }
  }

  // Detect reload (modern and legacy)
  function isReload() {
    try {
      const nav = window.performance.getEntriesByType && window.performance.getEntriesByType('navigation');
      if (nav && nav.length && nav[0].type) return nav[0].type === 'reload';
      if (performance && performance.navigation) return performance.navigation.type === 1;
    } catch (e) {}
    return false;
  }

  // If user wants to disable shuffling for this session
  function shuffleDisabled() { return sessionStorage.getItem('zawadi_shuffle_off') === '1'; }

  // Perform immediate story shuffle on reload
  if (isReload() && !shuffleDisabled()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', shuffleStories);
    } else {
      shuffleStories();
    }
    return;
  }

  // Otherwise set a 60s timer to shuffle
  if (!shuffleDisabled()) {
    var shuffleSeconds = 60;
    var banner = document.createElement('div');
    banner.id = 'shuffle-banner';
    banner.style.position = 'fixed';
    banner.style.left = '12px';
    banner.style.right = '12px';
    banner.style.bottom = '80px';
    banner.style.background = 'rgba(0,0,0,0.75)';
    banner.style.color = '#fff';
    banner.style.padding = '8px 10px';
    banner.style.borderRadius = '8px';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';
    banner.style.zIndex = 2200;
    // show a non-numeric message (hide the visible seconds count)
    banner.innerHTML = `<div id="shuffle-text">Shuffling page soon</div><div style="display:flex;gap:8px"><button id="shuffle-cancel" style="background:#777;color:#fff;border:none;padding:6px;border-radius:6px;">Cancel</button><button id="shuffle-now" style="background:#1a73e8;color:#fff;border:none;padding:6px;border-radius:6px;">Now</button></div>`;
    document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(banner); });

    var remaining = shuffleSeconds;
    // keep the internal countdown but do not update the visible text
    var countdownInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        shuffleStories();
      }
    }, 1000);

    // Cancel and Now handlers
    document.addEventListener('click', function (e) {
      if (!e.target) return;
      if (e.target.id === 'shuffle-cancel') {
        clearInterval(countdownInterval);
        var b = document.getElementById('shuffle-banner'); if (b) b.remove();
        sessionStorage.setItem('zawadi_shuffle_off', '1');
      }
      if (e.target.id === 'shuffle-now') {
        clearInterval(countdownInterval);
        var b = document.getElementById('shuffle-banner'); if (b) b.remove();
        shuffleStories();
      }
    });
  }
})();

