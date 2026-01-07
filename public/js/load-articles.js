document.addEventListener("DOMContentLoaded", () => {
    // Load Global News
    fetch("data/global.json")
      .then(res => res.json())
      .then(articles => {
        const container = document.querySelector(".global-news");
        articles.forEach(article => {
          const el = document.createElement("article");
          el.classList.add("story-card");
          el.innerHTML = `
            <a href="${article.url}">
              <h2>${article.title}</h2>
              ${article.image ? `<img src="${article.image}" alt="${article.altText}" />` : ""}
              <p>${article.summary}</p>
            </a>
          `;
          container.appendChild(el);
        });
      });
  
    // Load Africa News
    fetch("data/africa.json")
      .then(res => res.json())
      .then(articles => {
        const container = document.querySelector(".african-news");
        articles.forEach(article => {
          const el = document.createElement("article");
          el.classList.add("story-card");
          el.innerHTML = `
            <a href="${article.url}">
              <h2>${article.title}</h2>
              ${article.image ? `<img src="${article.image}" alt="${article.altText}" />` : ""}
              <p>${article.summary}</p>
            </a>
          `;
          container.appendChild(el);
        });
      });
  
    // Load Local News
    fetch("data/local.json")
      .then(res => res.json())
      .then(articles => {
        const container = document.querySelector(".local-news");
        articles.forEach(article => {
          const el = document.createElement("article");
          el.classList.add("story-card");
          el.innerHTML = `
            <a href="${article.url}">
              <h2>${article.title}</h2>
              ${article.image ? `<img src="${article.image}" alt="${article.altText}" />` : ""}
              <p>${article.summary}</p>
            </a>
          `;
          container.appendChild(el);
        });
      });
  });
  