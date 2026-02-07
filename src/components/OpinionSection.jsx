import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./OpinionSection.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const OpinionSection = () => {
  const [opinionArticles, setOpinionArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpinions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("category", "opinion")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching opinion articles:", error.message);
        setError(error.message);
      } else {
        setOpinionArticles(data);
      }
      setLoading(false);
    };

    fetchOpinions();
  }, []);

  if (loading) {
    return (
      <section className="opinion-hub">
        <div className="opinion-container">
          <h2>Opinion & Analysis</h2>
          <p>Loading opinion articles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="opinion-hub">
        <div className="opinion-container">
          <h2>Opinion & Analysis</h2>
          <p>Could not load opinion articles at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="opinion-hub">
      <div className="opinion-container">
        <h2>Opinion & Analysis</h2>
        {opinionArticles.length > 0 ? (
          <div className="opinion-grid">
            {opinionArticles.map((story) => (
              <article className="opinion-piece" key={story.id}>
                {story.image_url && (
                  <div className="opinion-piece-image">
                    <a href={`/articles/${story.slug || story.id}`}>
                      <img
                        src={story.image_url}
                        alt={story.title}
                        loading="lazy"
                      />
                    </a>
                  </div>
                )}
                <div className="opinion-piece-content">
                  <h3 className="opinion-piece-title">
                    <a href={`/articles/${story.slug || story.id}`}>
                      {story.title}
                    </a>
                  </h3>
                  <p className="opinion-piece-author">
                    By {story.author || "Zawadi Intel Contributor"}
                  </p>
                  <div className="opinion-piece-excerpt">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {story.content
                        ? `${story.content.slice(0, 120)}...`
                        : ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No opinion articles available at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default OpinionSection;
