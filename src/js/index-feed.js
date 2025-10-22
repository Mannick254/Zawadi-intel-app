(function(){
  async function loadNews() {
    try {
      const res = await fetch('../data/news.json');
      if (!res.ok) throw new Error('Failed to load news.json');
      const data = await res.json();

      const grid = document.querySelector('.article-grid');
      if (!grid) return;
      grid.innerHTML = '';

      data.forEach(item => {
        const art = document.createElement('article');
        art.className = 'article-card';
        art.innerHTML = `
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <h2><a href="${item.url}">${item.title}</a></h2>
          <p class="meta">${item.category} — ${item.time}</p>
          <p class="excerpt">${item.excerpt}</p>
        `;
        grid.appendChild(art);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // sidebar top stories
  async function loadSidebar() {
    try {
      const res = await fetch('../data/news.json');
      if (!res.ok) throw new Error('Failed to load news.json');
      const data = await res.json();
      const list = document.querySelector('.top-stories');
      if (!list) return;
      list.innerHTML = '';
      data.slice(0,5).forEach(i => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${i.url}">${i.title}</a>`;
        list.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // centre column (in-depth / explainers)
  async function loadCentre() {
    try {
      const res = await fetch('../data/news.json');
      if (!res.ok) throw new Error('Failed to load news.json');
      const data = await res.json();
      const modules = document.querySelectorAll('.centre-module');
      if (!modules || modules.length === 0) return;
      // Fill each centre module with one article or related links
      modules.forEach((mod, idx) => {
        const item = data[ idx ] || data[ idx % data.length ];
        mod.innerHTML = `\
          <h3>${mod.querySelector('h3')?.textContent || 'In Depth'}</h3>\
          <a href="${item.url}"><strong>${item.title}</strong></a>\
          <p class="meta">${item.category} — ${item.time}</p>\
          <p class="excerpt">${item.excerpt}</p>`;
      });
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadSidebar();
    loadCentre();
  });
})();
