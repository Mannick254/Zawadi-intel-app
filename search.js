
document.addEventListener('DOMContentLoaded', () => {
  const resultsContainer = document.getElementById('results-container');
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('query');

  if (query) {
    fetchArticlesAndSearch(query);
  } else {
    resultsContainer.innerHTML = '<p>No search query provided.</p>';
  }

  async function fetchArticlesAndSearch(query) {
    try {
      const response = await fetch('articles.json'); 
      const articles = await response.json();
      const searchResults = articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) || 
        article.content.toLowerCase().includes(query.toLowerCase())
      );

      displayResults(searchResults);
    } catch (error) {
      resultsContainer.innerHTML = '<p>Error loading search results.</p>';
      console.error('Error fetching or searching articles:', error);
    }
  }

  function displayResults(results) {
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }

    const resultsList = document.createElement('ul');
    results.forEach(result => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = result.url;
      link.textContent = result.title;
      listItem.appendChild(link);
      resultsList.appendChild(listItem);
    });

    resultsContainer.appendChild(resultsList);
  }
});
