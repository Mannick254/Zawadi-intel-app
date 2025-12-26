// scripts/main.js
// ----------------- TOGGLE DROPDOWN MENUS -----------------

function toggleDropdown(button, dropdown) {
  const isOpen = dropdown.classList.contains('show');
  dropdown.classList.toggle('show', !isOpen);
  button.setAttribute('aria-expanded', !isOpen);
}

// Generic dropdown toggle for buttons with .dropdown-btn
document.querySelectorAll('.dropdown-btn').forEach(button => {
  const dropdown = button.nextElementSibling;
  if (!dropdown) return;

  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  button.addEventListener('click', (e) => {
    e.preventDefault();
    toggleDropdown(button, dropdown);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  // Close when a link inside dropdown is clicked
  dropdown.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      dropdown.classList.remove('show');
      button.setAttribute('aria-expanded', 'false');
    }
  });
});

// ----------------- SEARCH BAR -----------------

const searchForm = document.querySelector('.search-bar');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = searchForm.querySelector('input');
    const query = input.value.trim();
    if (query) {
      console.log(`Searching for: ${query}`);
      // Future: redirect to results page
      // window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  });
}

// ----------------- MOBILE MENU -----------------

const menuToggle = document.querySelector('.menu-toggle') || document.querySelector('.nav-toggle');
const mainLinks = document.querySelector('.main-links');

if (menuToggle && mainLinks) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'main-links');

  menuToggle.addEventListener('click', () => {
    const isOpen = mainLinks.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Hide menu when a link is clicked
  mainLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mainLinks.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Hide menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mainLinks.contains(e.target)) {
      mainLinks.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ----------------- AUTHENTICATION -----------------

const AUTH_TOKEN_KEY = 'zawadi_auth_token_v1';
const GLOBAL_COUNT_KEY = 'zawadi_global_count_v1';

async function verifyToken(token) {
  try {
    const resp = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!resp.ok) throw new Error(`Verify failed: ${resp.status}`);
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
    if (!resp.ok) throw new Error(`Register failed: ${resp.status}`);
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
    if (!resp.ok) throw new Error(`Login failed: ${resp.status}`);
    const result = await resp.json();
    if (result.ok && result.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      updateAuthUi();
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
  updateAuthUi();
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
    if (!resp.ok) throw new Error(`Login activity failed: ${resp.status}`);
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
  if (document.getElementById('zawadi-auth')) return;

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
    msg.textContent = '';
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
    msg.textContent = '';
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
  const current = await getCurrentUser();

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


// ----------------- STORY MODAL -----------------

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else {
  safeInit();
}

// ----------------- CLICKABLE TITLES -----------------

function makeTitlesClickable() {
  document.querySelectorAll('.article-title').forEach(title => {
    const link = title.dataset.link;
    if (!link) return; // skip if no link defined

    title.style.cursor = 'pointer'; // visual cue
    title.addEventListener('click', () => {
      window.location.href = link;
    });
  });
}

// ----------------- THEME TOGGLE -----------------

if (typeof initThemeToggle === 'function') {
  initThemeToggle();
} else {
  console.warn('initThemeToggle is not defined');
}
