import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const FeaturedStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading featured stories:', error);
        setErrorMsg('Failed to load stories.');
      } else {
        setStories(data);
      }
      setLoading(false);
    };

    fetchStories();
  }, []);

  return (
    <section id="featured-stories">
      <h2>Featured Stories</h2>
      {loading && <p>Loading stories...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="featured-row">
        {stories.map(story => (
          <div className="featured-card" key={story.id}>
            <img src={story.image} alt={story.title} loading="lazy" />
            <div className="card-content">
              <h3><a href={story.link}>{story.title}</a></h3>
              <p>{story.description}</p>
              <span className="story-date">
                {new Date(story.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <a href={story.link} className="read-more">Read More &rarr;</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedStories;
