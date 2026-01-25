import React, { useState, useEffect } from 'react';

const KenyaUpdate = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
    const url = `https://newsapi.org/v2/top-headlines?country=ke&apiKey=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setStories(data.articles || []))
      .catch(err => console.error('Error loading Kenyan updates:', err));
  }, []);

  return (
    <section className="kenyan-latest-update">
      <div className="update-container">
        <h2>Kenyan Latest Update</h2>
        <p className="intro">Stay informed with the most recent developments shaping Kenya’s politics, sports, and society.</p>
        <div className="update-grid" id="kenya-latest-update-grid">
          {stories.map((story, index) => (
            <article className="update-card" key={index}>
              <span className="badge">{story.source?.name}</span>
              {story.urlToImage && <img src={story.urlToImage} alt={story.title} />}
              <h3>{story.title}</h3>
              <p className="timestamp">{new Date(story.publishedAt).toLocaleString()}</p>
              <a href={story.url} className="read-more">Read more</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KenyaUpdate;
