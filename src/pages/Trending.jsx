import React from "react";

export default function Trending() {
  // Placeholder for trending articles
  const trendingArticles = [
    { id: 1, title: "Trending Article 1", path: "/news/trending-1" },
    { id: 2, title: "Trending Article 2", path: "/news/trending-2" },
    { id: 3, title: "Trending Article 3", path: "/news/trending-3" },
  ];

  return (
    <div>
      <h1>Trending Articles</h1>
      <ul>
        {trendingArticles.map((article) => (
          <li key={article.id}>
            <a href={article.path}>{article.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
