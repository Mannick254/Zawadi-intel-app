(function() {
  async function fetchNewsData() {
    try {
      const res = await fetch("data/news.json");
      if (!res.ok) throw new Error("Failed to load news.json");
      const data = await res.json();
      return filterExpired(data);
    } catch (err) {
      console.error("Error fetching news:", err);
      return [];
    }
  }

  function filterExpired(data) {
    const now = new Date();
    return data.filter(item => {
      if (!item.expire) return true;
      const expire = new Date(item.expire);
      return expire >= now;
    });
  }

  function renderGrid(data) {
    const grid = document.querySelector(".article-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      const art = document.createElement("article");
      art.className = "article-card";
      art.innerHTML = `
        <img src="${item.image || "/icons/icon-192.png"}" alt="${item.title}" loading="lazy" />
        <h2><a href="${item.url}">${item.title}</a></h2>
        <p class="meta">${item.category || "General"} — ${item.time || ""}</p>
        <p class="excerpt">${item.excerpt || ""}</p>
      `;
      fragment.appendChild(art);
    });
    grid.appendChild(fragment);
  }

  function renderSidebar(data) {
    const list = document.querySelector(".top-stories");
    if (!list) return;
    list.innerHTML = "";

    const fragment = document.createDocumentFragment();
    data.slice(0, 5).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.url}">${item.title}</a>`;
      fragment.appendChild(li);
    });
    list.appendChild(fragment);
  }

  function renderCentre(data) {
    const modules = document.querySelectorAll(".centre-module");
    if (!modules || modules.length === 0) return;

    modules.forEach((mod, idx) => {
      const item = data[idx] || data[idx % data.length];
      mod.innerHTML = `
        <h3>${mod.querySelector("h3")?.textContent || "In Depth"}</h3>
        <a href="${item.url}"><strong>${item.title}</strong></a>
        <p class="meta">${item.category || "General"} — ${item.time || ""}</p>
        <p class="excerpt">${item.excerpt || ""}</p>
      `;
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const newsData = await fetchNewsData();
    renderGrid(newsData);
    renderSidebar(newsData);
    renderCentre(newsData);
  });
})();
