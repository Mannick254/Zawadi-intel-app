const AUTH_TOKEN_KEY = 'zawadi_auth_token_v1';
const GLOBAL_COUNT_KEY = 'zawadi_global_count_v1';

async function verifyToken(token) {
  try {
    const resp = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await resp.json();
    return result.ok ? result : null;
  } catch (e) {
    console.warn('Token verification failed:', e);
    return null;
  }
}

async function registerUser(username, password) {
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await resp.json();
  } catch (e) {
    console.error('Registration error:', e);
    return { ok: false, message: 'Registration failed' };
  }
}

async function loginUser(username, password) {
  try {
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await resp.json();
    if (result.ok && result.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      updateAuthUi?.(); // safe call if defined
      return result;
    }
    return { ok: false, message: result.message || 'Login failed' };
  } catch (e) {
    console.error('Login error:', e);
    return { ok: false, message: 'Server error during login' };
  }
}

function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  updateAuthUi?.();
}

async function getCurrentUser() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  return await verifyToken(token);
}

async function recordLogin(username) {
  try {
    const resp = await fetch('/api/login-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, ts: Date.now() })
    });
    return await resp.json();
  } catch (e) {
    console.warn('Login activity fallback:', e);
    const count = parseInt(localStorage.getItem(GLOBAL_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(GLOBAL_COUNT_KEY, String(count));
    return { totalLogins: count, source: 'local' };
  }
}

// ----------------- AUTH UI -----------------

function createAuthUi() {
  if (document.getElementById('zawadi-auth') || document.getElementById('zawadi-auth-button')) return;

  // Auth button
  const btn = document.createElement('button');
  btn.id = 'zawadi-auth-button';
  btn.className = 'auth-button';
  btn.textContent = 'Login';
  btn.addEventListener('click', () => toggleAuthModal(true));
  document.body.appendChild(btn);

  // Modal container
  const modal = document.createElement('div');
  modal.id = 'zawadi-auth';
  modal.className = 'auth-modal hidden';
  modal.innerHTML = `
    <div class="auth-box">
      <h3>Account</h3>
      <div id="zawadi-msg" class="auth-msg"></div>
      <form id="zawadi-form" class="auth-form">
        <label for="zawadi-username">Username</label>
        <input id="zawadi-username" name="username" required />
        <label for="zawadi-password">Password</label>
        <input id="zawadi-password" name="password" type="password" required />
        <div class="auth-actions">
          <button type="submit" id="zawadi-login">Login</button>
          <button type="button" id="zawadi-register">Register</button>
        </div>
      </form>
      <div class="auth-status">
        <span id="zawadi-status"></span>
        <div>
          <button id="zawadi-logout" class="hidden">Logout</button>
          <button id="zawadi-admin" class="hidden">Admin</button>
        </div>
      </div>
      <button id="zawadi-close" class="auth-close">×</button>
    </div>
  `;
  modal.addEventListener('click', (e) => { if (e.target === modal) toggleAuthModal(false); });
  document.body.appendChild(modal);

  // Events
  const form = document.getElementById('zawadi-form');
  const msg = document.getElementById('zawadi-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = form.username.value.trim();
    const p = form.password.value;
    msg.textContent = 'Processing...';
    msg.classList.remove('error', 'success');
    try {
      const r = await loginUser(u, p);
      if (!r || !r.ok) {
        msg.textContent = r?.message || 'Login failed';
        msg.classList.add('error');
        return;
      }
      msg.textContent = 'Logged in';
      msg.classList.add('success');
      toggleAuthModal(false);
      updateAuthUi();
    } catch {
      msg.textContent = 'Login error';
      msg.classList.add('error');
    }
  });

  document.getElementById('zawadi-register').addEventListener('click', async () => {
    const u = form.username.value.trim();
    const p = form.password.value;
    msg.textContent = 'Processing...';
    msg.classList.remove('error', 'success');
    try {
      const r = await registerUser(u, p);
      if (!r || !r.ok) {
        msg.textContent = r?.message || 'Registration failed';
        msg.classList.add('error');
        return;
      }
      msg.textContent = 'Registered. You can now login.';
      msg.classList.add('success');
    } catch {
      msg.textContent = 'Registration error';
      msg.classList.add('error');
    }
  });

  document.getElementById('zawadi-close').addEventListener('click', () => toggleAuthModal(false));
  document.getElementById('zawadi-logout').addEventListener('click', () => { logoutUser(); toggleAuthModal(false); updateAuthUi(); });
  document.getElementById('zawadi-admin').addEventListener('click', () => { window.location.href = '/admin.html'; });

  updateAuthUi();
}

function toggleAuthModal(show) {
  const m = document.getElementById('zawadi-auth');
  if (!m) return;
  m.classList.toggle('hidden', !show);
}

async function updateAuthUi() {
  const btn = document.getElementById('zawadi-auth-button');
  const status = document.getElementById('zawadi-status');
  const logout = document.getElementById('zawadi-logout');
  const adminBtn = document.getElementById('zawadi-admin');

  let current = null;
  try {
    current = await getCurrentUser();
  } catch (err) {
    console.warn("Auth UI update failed:", err);
  }

  if (current) {
    btn.textContent = current.username;
    status.textContent = `Signed in as ${current.username}`;
    logout.classList.remove('hidden');
    adminBtn.classList.toggle('hidden', !current.isAdmin);
  } else {
    btn.textContent = 'Login';
    status.textContent = 'Not signed in';
    logout.classList.add('hidden');
    adminBtn.classList.add('hidden');
  }
}

function showModal(html, title, sourceUrl) {
  createModalIfNeeded();
  const modal = document.getElementById('story-modal');
  const body = document.getElementById('story-modal-body');
  if (!modal || !body) return;

  body.innerHTML = '';

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'modal-toolbar';

  const metaSpan = document.createElement('div');
  metaSpan.className = 'meta';
  metaSpan.textContent = sourceUrl ? sourceUrl.replace(/^https?:\/\//, '') : '';

  const actions = document.createElement('div');
  const openBtn = document.createElement('button');
  openBtn.textContent = 'Open original';
  openBtn.addEventListener('click', () => { if (sourceUrl) window.open(sourceUrl, '_blank'); });

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy link';
  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && sourceUrl) await navigator.clipboard.writeText(sourceUrl);
      else prompt('Copy link', sourceUrl || location.href);
    } catch {
      prompt('Copy link', sourceUrl || location.href);
    }
  });

  actions.appendChild(openBtn);
  actions.appendChild(copyBtn);
  toolbar.appendChild(metaSpan);
  toolbar.appendChild(actions);

  // Article
  const article = document.createElement('article');
  article.className = 'modal-article';
  if (title) {
    const h = document.createElement('h1');
    h.textContent = title;
    article.appendChild(h);
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const articleEl = tempDiv.querySelector('article');
  let cleanHtml = articleEl ? articleEl.innerHTML : html;

  const bodyWrapper = document.createElement('div');
  bodyWrapper.className = 'modal-body';
  bodyWrapper.innerHTML = cleanHtml;

  const firstP = bodyWrapper.querySelector('p');
  if (firstP && firstP.textContent.length > 50) {
    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = firstP.textContent;
    firstP.remove();
    article.appendChild(lead);
  }

  article.appendChild(bodyWrapper);

  body.appendChild(toolbar);
  body.appendChild(article);

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// ----------------- CLICK HANDLER -----------------

let _storyModalOpen = false;

function openStoryModal(el, titleText, source) {
  _storyModalOpen = true;
  try {
    showModal(el.innerHTML, titleText, source);
  } finally {
    _storyModalOpen = false;
  }
}

// Auto-open fragment on load
window.addEventListener('DOMContentLoaded', () => {
  const fragOnLoad = location.hash.slice(1);
  if (fragOnLoad) {
    const elOnLoad = document.getElementById(fragOnLoad);
    if (elOnLoad) {
      const titleText = elOnLoad.querySelector('h1,h2,h3')?.textContent || document.title;
      setTimeout(() => openStoryModal(elOnLoad, titleText, location.href), 60);
    }
  }
});

// Handle clicks on story links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a.story-title-link');
  if (!a || _storyModalOpen) return;

  const href = a.getAttribute('href');
  if (!href) return;

  const localCard = a.closest('.story-card');
  const preferredFragment = localCard?.id || null;

  // In-page anchor
  if (href.startsWith('#')) {
    const frag = preferredFragment || href.slice(1);
    const el = document.getElementById(frag);
    if (el) {
      e.preventDefault();
      const titleText = el.querySelector('h1,h2,h3')?.textContent || a.textContent;
      const source = `${location.href.split('#')[0]}#${frag}`;
      openStoryModal(el, titleText, source);
      return;
    }
  }

  // Same-origin fetch
  try {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;

    e.preventDefault();
    const fragment = preferredFragment || (url.hash ? url.hash.slice(1) : null);

    _storyModalOpen = true;
    fetch(url.pathname + url.search)
      .then(resp => {
        if (!resp.ok) throw new Error('Fetch failed');
        return resp.text();
      })
      .then(text => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const found = extractArticleFromDoc(doc, fragment);
        if (found) {
          showModal(found.html, found.title || a.textContent.trim(), url.href + (fragment ? `#${fragment}` : ''));
        } else {
          window.location.href = href;
        }
      })
      .catch(err => {
        console.warn('Could not load story inline, falling back to navigation', err);
        window.location.href = href;
      })
      .finally(() => { _storyModalOpen = false; });
  } catch (err) {
    console.warn('story modal handler error', err);
  }
});

// ----------------- INSTALL PROMPT -----------------

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('install-banner');
  if (banner) banner.classList.remove('hidden');
});

document.querySelectorAll('#install-banner button, button#install-button').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      console.log(`User ${choiceResult.outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
      deferredPrompt = null;
      const banner = document.getElementById('install-banner');
      if (banner) banner.classList.add('hidden');
    });
  });
});

// ----------------- OTHER -----------------

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
// ----------------- INITIALIZATION -----------------

function safeInit() {
  if (typeof createAuthUi === 'function') {
    createAuthUi();
  } else {
    console.warn('createAuthUi is not defined');
  }

  if (typeof makeTitlesClickable === 'function') {
    makeTitlesClickable();
  } else {
    console.warn('makeTitlesClickable is not defined');
  }

  if (typeof setupStoryModal === 'function') {
    setupStoryModal();
  } else {
    console.warn('setupStoryModal is not defined');
  }

  initTicker();
  initMobileNav();
  initArticleLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  safeInit();
}
//________CLICABLE TITLE_________
function makeTitlesClickable() {
  document.querySelectorAll('.article-title').forEach(title => {
    if (title.dataset.clickBound) return;
    const link = title.dataset.link;
    if (!link) return;
    title.style.cursor = 'pointer';
    title.addEventListener('click', () => { window.location.href = link; });
    title.dataset.clickBound = true;
  });
}
//_________NEWS TICKER________
function initTicker() {
  const ticker = document.getElementById("newsTicker");
  if (!ticker) return;

  const headlines = document.querySelectorAll(".story-card h2");
  headlines.forEach(headline => {
    const li = document.createElement("li");
    li.textContent = headline.textContent;
    li.classList.add("hidden");
    ticker.appendChild(li);
  });

  let index = 0;
  const items = ticker.querySelectorAll("li");
  if (items.length > 0) {
    items[0].classList.remove("hidden");
    setInterval(() => {
      items.forEach((item, i) => item.classList.toggle("hidden", i !== index));
      index = (index + 1) % items.length;
    }, 3000);
  }
}
//_________MOBILE NAV______
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.main-links');
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("show");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}
//_______ARTICLE LOADER_______
async function initArticleLoader() {
  const articleContainer = document.getElementById('article-container');
  const articleTitle = document.getElementById('article-title');
  const articleContent = document.getElementById('article-content');

  if (!articleContainer || !articleTitle || !articleContent) return;

  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  if (!articleId) {
    articleContainer.innerHTML = '<p>Article not found.</p>';
    return;
  }

  try {
    const response = await fetch(`/api/articles/${articleId}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    const article = await response.json();

    document.title = `${article.title} — Zawadi Intel News`;
    articleTitle.textContent = article.title;
    articleContent.innerHTML = article.content;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', article.content.replace(/<[^>]+>/g, '').substring(0, 150));
    }
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', `https://zawadiintelnews.vercel.app/article.html?id=${article.id}`);
    }
  } catch (error) {
    console.error('Error loading article:', error);
    articleContainer.innerHTML = '<p>Error loading article. Please try again later.</p>';
  }
}
