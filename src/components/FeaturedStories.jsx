import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./FeaturedStories.module.css";

const FeaturedStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("section", "feature")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading featured stories:", error.message);
        setErrorMsg("Failed to load stories.");
      } else {
        setStories(data || []);
      }
      setLoading(false);
    };

    fetchStories();
  }, []);

  if (loading) return <p className={styles.status}>Loading stories...</p>;
  if (errorMsg) return <p className={styles.error}>{errorMsg}</p>;
  if (stories.length === 0)
    return <p className={styles.status}>No featured stories available at the moment.</p>;

  const [mainStory, ...otherStories] = stories;

  return (
    <section id="featured-stories" className={styles.featuredStories}>
      <div className={styles.featuredHeader}>
      
        {/* Intro minimized for newsroom feel */}
      </div>

      <div className={styles.featuredLayout}>
        {/* Hero story */}
        <article className={styles.mainStory}>
          {mainStory.image_url && (
            <div className={styles.mainImage}>
              <a href={`/articles/${mainStory.slug || mainStory.id}`}>
                <img
                  src={mainStory.image_url}
                  alt={mainStory.title || "Featured story image"}
                  loading="lazy"
                />
              </a>
            </div>
          )}
          <div className={styles.mainContent}>
            <h3 className={styles.mainTitle}>
              <a href={`/articles/${mainStory.slug || mainStory.id}`}>
                {mainStory.title}
              </a>
            </h3>
            <p className={styles.mainExcerpt}>
              {mainStory.content?.slice(0, 160)}...
            </p>
            <time className={styles.storyDate} dateTime={mainStory.created_at}>
              {new Date(mainStory.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </article>

        {/* Side stories */}
        <div className={styles.sideStories}>
          {otherStories.map((story) => (
            <article className={styles.sideCard} key={story.id}>
              <div className={styles.sideContent}>
                <h4 className={styles.sideTitle}>
                  <a href={`/articles/${story.slug || story.id}`}>
                    {story.title}
                  </a>
                </h4>
                <time className={styles.storyDate} dateTime={story.created_at}>
                  {new Date(story.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </div>
              {story.image_url && (
                <div className={styles.sideImage}>
                  <a href={`/articles/${story.slug || story.id}`}>
                    <img
                      src={story.image_url}
                      alt={story.title || "Story image"}
                      loading="lazy"
                    />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStories;
