
import React, { useState, useEffect } from 'react';

const KenyaUpdate = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('/data/kenya.json')
      .then(response => response.json())
      .then(data => setStories(data))
      .catch(error => console.error('Error loading Kenyan updates:', error));
  }, []);

  return (
    <section className="kenyan-latest-update">
      <div className="update-container">
        <h2>Kenyan Latest Update</h2>
        <p className="intro">Stay informed with the most recent developments shaping Kenya’s politics, sports, and society.</p>
        <div className="update-grid" id="kenya-latest-update-grid">
          {stories.map((story, index) => (
            <article className="update-card" key={index}>
              <span className={`badge ${story.badgeClass}`}>{story.category}</span>
              <img src={story.image} alt={story.headline} />
              <h3>{story.headline}</h3>
              <p className="timestamp">{story.timestamp}</p>
              <a href={story.url} className="read-more">{story.readMoreText}</a>
              <div className="share-icons">
                <a href="#">🐦</a>
                <a href="#">📘</a>
                <a href="#">📱</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KenyaUpdate;
