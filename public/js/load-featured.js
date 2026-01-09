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

                    const storyDate = new Date(story.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    card.innerHTML = `
                        <div class="card-image">
                            <a href="${story.link}">
                                <img src="${story.image}" alt="${story.alt}">
                            </a>
                            <span class="category-badge ${story.categoryClass}">${story.category}</span>
                        </div>
                        <div class="card-content">
                            <h3><a href="${story.link}">${story.headline}</a></h3>
                            <p>${story.description}</p>
                            <div class="card-meta">
                                <span class="date">${storyDate}</span>
                                <span class="timestamp">${story.timestamp}</span>
                            </div>
                            <div class="card-footer">
                                <span class="engagement">${story.engagementCount}</span>
                                <a href="${story.link}" class="read-more">Read More &rarr;</a>
                            </div>
                        </div>
                    `;
                    featuredRow.appendChild(card);
                });
            }
        })
        .catch(error => console.error('Error loading featured stories:', error));
});
