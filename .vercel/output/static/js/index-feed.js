document.addEventListener("DOMContentLoaded", () => {
  const globalNewsContainer = document.querySelector(".global-news");

  fetch("data/global.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!globalNewsContainer) return;
      let articlesHtml = "";
      data.slice(0, 5).forEach(article => {
        articlesHtml += `
          <div class="story-card">
            ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ""}
            <div class="story-content">
              <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h3>
              <p>${article.description || ""}</p>
              <small>${article.source || ""} - ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ""}</small>
            </div>
          </div>
        `;
      });
      globalNewsContainer.innerHTML = articlesHtml;
    })
    .catch(error => {
      console.error("Error fetching global news:", error);
      if (globalNewsContainer) {
        globalNewsContainer.innerHTML = "<p>Error loading news. Please try again later.</p>";
      }
    });
});
