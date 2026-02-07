import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const KenyaUpdate = () => {
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      let query = supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("section", "update")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("badge", filter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching stories:", error.message);
      } else {
        setStories(data);
      }
      setLoading(false);
    };

    fetchStories();
  }, [filter]);

  const timeAgo = (dateString) => {
    const diff = (Date.now() - new Date(dateString)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <section className="kenyan-latest-update">
      <div className="update-container">
        <h2>Kenyan Latest Update</h2>
        <p className="intro">
          Stay informed with the most recent developments shaping Kenya’s politics, business, culture, sports, and society.
        </p>

        {/* Filter Buttons */}
        <div className="filters">
          {["all", "politics", "business", "culture", "sports", "society"].map((cat) => (
            <button
              key={cat}
              className={filter === cat ? "active" : ""}
              onClick={() => setFilter(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading">Loading updates...</p>
        ) : (
          <div className="update-grid" id="kenya-latest-update-grid">
            {stories.map((story) => (
              <article className="update-card" key={story.id}>
                <span className={`badge ${story.badge?.toLowerCase()}`}>
                  {story.badge || "KenyaUpdate"}
                </span>
                {story.image_url && (
                  <img
                    src={story.image_url}
                    alt={story.title}
                    loading="lazy" // performance boost
                  />
                )}
                <h3>
                  <a href={`/articles/${story.slug || story.id}`}>{story.title}</a>
                </h3>
                {/* Optional excerpt */}
                {story.excerpt && (
                  <p className="excerpt">{story.excerpt.slice(0, 120)}...</p>
                )}
                <p className="timestamp">{timeAgo(story.created_at)}</p>
                <a
                  href={`/articles/${story.slug || story.id}`}
                  className="read-more"
                >
                  Read more
                </a>
                {/* Share Icons */}
                <div className="share-icons">
                  <a
                    href={`https://twitter.com/share?url=${window.location.origin}/articles/${story.slug || story.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🐦
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/articles/${story.slug || story.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📘
                  </a>
                  <a
                    href={`https://wa.me/?text=${window.location.origin}/articles/${story.slug || story.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📱
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default KenyaUpdate;
