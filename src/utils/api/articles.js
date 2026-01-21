export async function getArticles() {
    const res = await fetch('/api/articles');
    return res.json();
  }
  
  export async function createArticle(article) {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    return res.json();
  }
  