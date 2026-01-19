export async function getNews() {
    const res = await fetch('/api/news');
    return res.json();
  }
  