
import React, { useState, useEffect } from 'react';

const NewsColumns = () => {
  const [globalNews, setGlobalNews] = useState([]);
  const [africanNews, setAfricanNews] = useState([]);
  const [localNews, setLocalNews] = useState([]);
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Replace with your actual NewsAPI key

  useEffect(() => {
    // Fetch Global News
    fetch(`https://newsapi.org/v2/top-headlines?language=en&apiKey=${API_KEY}`)
      .then(response => response.json())
      .then(data => setGlobalNews((data.articles || []).slice(0, 5))) // Get top 5 articles
      .catch(error => console.error('Error loading global news:', error));

    // Fetch African News (e.g., from Nigeria)
    fetch(`https://newsapi.org/v2/top-headlines?country=ng&apiKey=${API_KEY}`)
      .then(response => response.json())
      .then(data => setAfricanNews((data.articles || []).slice(0, 5)))
      .catch(error => console.error('Error loading African news:', error));

    // Fetch Local News (Kenya)
    fetch(`https://newsapi.org/v2/top-headlines?country=ke&apiKey=${API_KEY}`)
      .then(response => response.json())
      .then(data => setLocalNews((data.articles || []).slice(0, 5)))
      .catch(error => console.error('Error loading local news:', error));
  }, []);

  return (
    <main className="aj-container">
      <section className="three-column-layout">
        <div className="global-column">
          <h2>News Today</h2>
          <blockquote>"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt</blockquote>
          <section className="global-news">
            {(globalNews || []).map((article, index) => (
              <article key={index}>
                <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </section>
        </div>

        <div className="african-column">
          <h2>Africa Trending News</h2>
          <section className="african-news">
            {(africanNews || []).map((article, index) => (
              <article key={index}>
                <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3>
                <p>{article.description}</p>
              </article>
            ))}
          </section>
        </div>

        <div className="local-column">
          <h2>Local News</h2>
          <section className="local-news">
            {(localNews || []).map((article, index) => (
              <article key={index}>
                <h3><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3>
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
