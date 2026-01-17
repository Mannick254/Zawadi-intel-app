document.addEventListener('DOMContentLoaded', () => {
  fetch('/data/kenya.json')
    .then(response => response.json())
    .then(data => {
      const grid = document.getElementById('kenya-latest-update-grid');
      data.forEach(story => {
        const card = document.createElement('article');
        card.className = 'update-card';
        card.innerHTML = `
          <span class="badge ${story.badgeClass}">${story.category}</span>
          <img src="${story.image}" alt="${story.headline}" />
          <h3>${story.headline}</h3>
          <p class="timestamp">${story.timestamp}</p>
          <a href="${story.url}" class="read-more">${story.readMoreText}</a>
          <div class="share-icons">
            <a href="#">🐦</a>
            <a href="#">📘</a>
            <a href="#">📱</a>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(error => console.error('Error loading Kenyan updates:', error));
});
