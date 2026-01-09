document.addEventListener('DOMContentLoaded', () => {
    fetch('/data/featured-card.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const featuredRow = document.querySelector('#featured-stories .featured-row');
            if (featuredRow) {
                data.forEach(story => {
                    const card = document.createElement('div');
                    card.classList.add('featured-card');

                    card.innerHTML = `
                        <div class="card-image">
                            <a href="${story.url}">
                                <img src="${story.image}" alt="${story.headline}">
                            </a>
                            <span class="badge ${story.badgeClass}">${story.category}</span>
                        </div>
                        <div class="card-content">
                            <h3><a href="${story.url}">${story.headline}</a></h3>
                            <div class="card-meta">
                                <span>${story.timestamp}</span>
                                <span class="engagement">${story.engagement}</span>
                            </div>
                            <a href="${story.url}" class="read-more">${story.readMoreText} &rarr;</a>
                        </div>
                    `;
                    featuredRow.appendChild(card);
                });
            }
        })
        .catch(error => console.error('Error loading featured stories:', error));
});
