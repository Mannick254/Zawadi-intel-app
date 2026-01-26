import React, { useState, useEffect } from "react";

const NewsColumns = () => {
  const [globalNews, setGlobalNews] = useState([]);
  const [africanNews, setAfricanNews] = useState([]);
  const [localNews, setLocalNews] = useState([]);

  useEffect(() => {
    // Mock data instead of API calls
    const mockGlobal = [
      { title: "Global headline 1", description: "Summary of global news", url: "#" },
      { title: "Global headline 2", description: "Another global story", url: "#" },
    ];
    const mockAfrican = [
      { title: "African headline 1", description: "Summary of African news", url: "#" },
      { title: "African headline 2", description: "Another African story", url: "#" },
    ];
    const mockLocal = [
      { title: "Kenya headline 1", description: "Summary of local news", url: "#" },
      { title: "Kenya headline 2", description: "Another local story", url: "#" },
    ];

    setGlobalNews(mockGlobal);
    setAfricanNews(mockAfrican);
    setLocalNews(mockLocal);
  }, []);

  return (
    <main className="aj-container">
      <section className="three-column-layout">
        <div className="global-column">
          <h2>News Today</h2>
          <blockquote>
            "The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt
          </blockquote>
          <section className="global-news">
            {globalNews.map((article, index) => (
              <article key={index}>
                <h3><a href={article.url}>{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </section>
        </div>

        <div className="african-column">
          <h2>Africa Trending News</h2>
          <section className="african-news">
            {africanNews.map((article, index) => (
              <article key={index}>
                <h3><a href={article.url}>{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </section>
        </div>

        <div className="local-column">
          <h2>Local News</h2>
          <section className="local-news">
            {localNews.map((article, index) => (
              <article key={index}>
                <h3><a href={article.url}>{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
};

export default NewsColumns;
