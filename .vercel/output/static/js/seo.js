// public/js/seo.js

/**
 * Dynamically updates SEO meta tags based on the current page content.
 */
async function updateSeoTags() {
  // Example: Update tags on an article page
  if (window.location.pathname.includes('article.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (articleId) {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        if (response.ok) {
          const article = await response.json();
          document.title = `${article.title} — Zawadi Intel News`;
          
          const descriptionTag = document.querySelector('meta[name="description"]');
          if (descriptionTag) {
            descriptionTag.setAttribute('content', article.content.substring(0, 160));
          }

          const canonicalTag = document.querySelector('link[rel="canonical"]');
          if (canonicalTag) {
            canonicalTag.setAttribute('href', window.location.href);
          }
        }
      } catch (error) {
        console.error('Failed to update SEO tags:', error);
      }
    }
  }
}

// Run the function on page load
document.addEventListener('DOMContentLoaded', updateSeoTags);
