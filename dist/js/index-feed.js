document.addEventListener("DOMContentLoaded", () => {
  const globalNewsContainer = document.querySelector(".global-news");
  if (!globalNewsContainer) return;

  // Utility to safely render article card
  function renderArticle(article) {
    const publishedDate = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString()
      : "";

    return `
      <div class="story-card">
        ${article.image ? `<img src="${article.image}" alt="${article.title || "News image"}">` : ""}
        <div class="story-content">
          <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h3>
          <p>${article.description || ""}</p>
          <small>${article.source || ""} ${publishedDate}</small>
        </div>
      </div>
    `;
  }

  // Fetch and render global news
  fetch("data/global.json") // ✅ use correct relative path
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch global.json: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const articlesHtml = data.slice(0, 5).map(renderArticle).join("");
      globalNewsContainer.innerHTML = articlesHtml;
    })
    .catch(error => {
      console.error("Error fetching global news:", error);
      globalNewsContainer.innerHTML = "<p>Error loading news. Please try again later.</p>";
    });
});
