document.addEventListener("DOMContentLoaded", () => {
  /**
   * Utility to load articles from a JSON file into a container
   * @param {string} url - Path to the JSON file
   * @param {string} selector - CSS selector for the container
   */
  function loadArticles(url, selector) {
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status}`);
        }
        return res.json();
      })
      .then(articles => {
        const container = document.querySelector(selector);
        if (!container) return;

        articles.forEach(article => {
          const el = document.createElement("article");
          el.classList.add("story-card");
          el.innerHTML = `
            <a href="${article.url}">
              <h2>${article.title}</h2>
              ${article.image ? `<img src="${article.image}" alt="${article.altText || "News image"}" />` : ""}
              <p>${article.summary}</p>
            </a>
          `;
          container.appendChild(el);
        });
      })
      .catch(err => {
        console.error(`Error loading articles from ${url}:`, err);
      });
  }

  // Load different sections
  loadArticles("data/global.json", ".global-news");
  loadArticles("data/africa.json", ".african-news");
  loadArticles("data/local.json", ".local-news");
});
