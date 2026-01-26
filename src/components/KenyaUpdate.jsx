import React, { useState, useEffect } from "react";

const KenyaUpdate = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Instead of fetching, just set mock data
    const mockStories = [
      {
        source: { name: "Mock Times" },
        title: "Kenya prepares for major sporting event",
        publishedAt: new Date().toISOString(),
        url: "#",
        urlToImage: "https://via.placeholder.com/300x200",
      },
      {
        source: { name: "Daily Mock" },
        title: "Economic reforms spark debate in Nairobi",
        publishedAt: new Date().toISOString(),
        url: "#",
        urlToImage: "https://via.placeholder.com/300x200",
      },
    ];
    setStories(mockStories);
  }, []);

  return (
    <section className="kenyan-latest-update">
      <div className="update-container">
        <h2>Kenyan Latest Update</h2>
        <p className="intro">
          Stay informed with the most recent developments shaping Kenya’s politics, sports, and society.
        </p>
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
