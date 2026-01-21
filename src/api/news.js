export async function getNews() {
    const res = await fetch('/api/articles');
    return res.json();
  }
  