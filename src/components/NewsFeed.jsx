import { useEffect, useState } from 'react';
import { getNews } from '../api/news';

export default function NewsFeed() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNews().then(data => setNews(data.articles || []));
  }, []);

  return (
    <div>
      <h2>Top Headlines Today</h2>
      {news.map((n, i) => (
        <div key={i}>
          <h3>{n.title}</h3>
          <p>{n.description}</p>
          <a href={n.url} target="_blank" rel="noreferrer">Read more</a>
        </div>
      ))}
    </div>
  );
}
