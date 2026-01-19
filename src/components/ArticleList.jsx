import { useEffect, useState } from 'react';
import { getArticles } from '../api/articles';

export default function ArticleList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  return (
    <div>
      <h2>Articles</h2>
      {articles.map(a => (
        <div key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.content}</p>
        </div>
      ))}
    </div>
  );
}
