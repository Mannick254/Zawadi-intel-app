import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const KenyaUpdate = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("section", "update") // only KenyaUpdate section
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching stories:", error.message);
      } else {
        setStories(data);
      }
    };

    fetchStories();
  }, []);

  return (
    <section className="kenyan-latest-update">
      <div className="update-container">
        <h2>Kenyan Latest Update</h2>
        <p className="intro">
          Stay informed with the most recent developments shaping Kenya’s politics, sports, and society.
        </p>
        <div className="update-grid" id="kenya-latest-update-grid">
          {stories.map((story) => (
            <article className="update-card" key={story.id}>
              <span className="badge">{story.badge || "KenyaUpdate"}</span>
              {story.image_url && <img src={story.image_url} alt={story.title} />}
              <h3>{story.title}</h3>
              <p className="timestamp">
                {new Date(story.created_at).toLocaleString()}
              </p>
              <a href={`/articles/${story.slug || story.id}`} className="read-more">
                Read more
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KenyaUpdate;
