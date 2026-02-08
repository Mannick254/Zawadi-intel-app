import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./FeaturedStories.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FeaturedStories = () => {
  const [mainStory, setMainStory] = useState(null);
  const [sideStories, setSideStories] = useState([]);
  const [mustRead, setMustRead] = useState([]);
  const [mostRelevant, setMostRelevant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);

      try {
        // Featured stories
        const { data: featured, error: featuredError } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .eq("section", "feature")
          .order("created_at", { ascending: false });

        if (featuredError) throw featuredError;

        if (featured && featured.length > 0) {
          setMainStory(featured[0]);
          setSideStories(featured.slice(1, 5));
        }

        // MUST READ
        const { data: mustReadData, error: mustReadError } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .eq("must_read", true)
          .order("created_at", { ascending: false });

        if (mustReadError) throw mustReadError;
        setMustRead(mustReadData || []);

        // MOST RELEVANT
        const { data: mostRelevantData, error: mostRelevantError } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .eq("most_relevant", true)
          .order("created_at", { ascending: false });

        if (mostRelevantError) throw mostRelevantError;
        setMostRelevant(mostRelevantData || []);

      } catch (err) {
        console.error("Error loading stories:", err.message);
        setErrorMsg("Failed to load stories.");
      }

      setLoading(false);
    };

    fetchStories();
  }, []);

  if (loading) return <p className={styles.status}>Loading stories...</p>;
  if (errorMsg) return <p className={styles.error}>{errorMsg}</p>;
  if (!mainStory) return <p className={styles.status}>No featured stories available at the moment.</p>;

  return (
    <section id="featured-stories" className={styles.featuredStories}>
      <div className={styles.featuredHeader}></div>

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
            <div className={styles.mainExcerpt}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {mainStory.content ? `${mainStory.content.slice(0, 160)}...` : ""}
              </ReactMarkdown>
            </div>
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
          {sideStories.map((story) => (
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

        {/* Third column */}
        <aside className={styles.thirdColumn}>
          <div className={styles.mustRead}>
            <div className={styles.mustReadHeading}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {`### **MUST READ**`}
              </ReactMarkdown>
            </div>
            <div className={styles.mustReadList}>
              {mustRead.map((story) => (
                <div key={story.id} className={styles.mustReadItem}>
                  <a href={`/articles/${story.slug || story.id}`}>
                    {story.title}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <hr className={styles.separator} />

          <div className={styles.mostRelevant}>
            <div className={styles.mostRelevantHeading}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {`### **MOST RELEVANT**`}
              </ReactMarkdown>
            </div>
            <div className={styles.relevantList}>
              {mostRelevant.map((story) => (
                <div key={story.id} className={styles.relevantItem}>
                  <a href={`/articles/${story.slug || story.id}`}>
                    {story.title}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default FeaturedStories;
