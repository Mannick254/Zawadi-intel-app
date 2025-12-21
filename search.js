document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('results-container');
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('query');

  if (query) {
    resultsContainer.innerHTML = '<p>🔎 Searching...</p>';
    fetchArticlesAndSearch(query.trim());
  } else {
    resultsContainer.innerHTML = '<p>No search query provided.</p>';
  }

  async function fetchArticlesAndSearch(query) {
    try {
      const response = await fetch('articles.json');
      if (!response.ok) throw new Error('Failed to load articles.json');
      const articles = await response.json();

      const searchResults = articles.filter(article =>
        (article.title && article.title.toLowerCase().includes(query.toLowerCase())) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query.toLowerCase())) ||
        (article.content && article.content.toLowerCase().includes(query.toLowerCase()))
      );

      displayResults(searchResults, query);
    } catch (error) {
      resultsContainer.innerHTML = '<p>Error loading search results.</p>';
      console.error('Error fetching or searching articles:', error);
    }
  }

  function displayResults(results, query) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `<p>No results found for "<strong>${query}</strong>".</p>`;
      return;
    }

    const resultsList = document.createElement('section');
    resultsList.className = 'search-results';

    results.forEach(result => {
      const articleItem = document.createElement('article');
      const link = document.createElement('a');
      link.href = result.url;
      link.textContent = result.title;

      const excerpt = document.createElement('p');
      excerpt.textContent = result.excerpt || result.content?.substring(0, 150) + '...';

      articleItem.appendChild(link);
      articleItem.appendChild(excerpt);
      resultsList.appendChild(articleItem);
    });

    resultsContainer.innerHTML = ''; // clear loading text
    resultsContainer.appendChild(resultsList);
  }
});
