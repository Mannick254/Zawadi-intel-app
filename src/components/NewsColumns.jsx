import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./NewsColumns.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NewsColumns = ({ category }) => {
  const [news, setNews] = useState([]);
  const [globalNews, setGlobalNews] = useState([]);
  const [africanNews, setAfricanNews] = useState([]);
  const [localNews, setLocalNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      let query = supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
        const { data, error } = await query;
        if (error) {
          console.error(`Error fetching ${category} articles:`, error.message);
        } else {
          setNews(data);
        }
      } else {
        const { data, error } = await query;
        if (error) {
          console.error("Error fetching all articles:", error.message);
          return;
        }
        setGlobalNews(data.filter((a) => a.category === "global"));
        setAfricanNews(data.filter((a) => a.category === "africa"));
        setLocalNews(data.filter((a) => a.category === "local"));
      }
    };

    fetchNews();
  }, [category]);

  const splitStories = (stories) => {
    if (!stories || stories.length === 0) return [null, []];
    const [main, ...others] = stories;
    return [main, others];
  };

  const renderLayout = (stories, title, rowClass) => {
    const [mainStory, otherStories] = splitStories(stories);

    if (!mainStory) {
      return (
        <div className={rowClass}>
          <h2>{title}</h2>
          <p>No articles found in this category at the moment.</p>
        </div>
      );
    }

    return (
      <div className={rowClass}>
        <h2>{title}</h2>
        <div className="featuredLayout">
          <article className="mainStory">
            {mainStory.image_url && (
              <div className="mainImage">
                <a href={`/articles/${mainStory.slug || mainStory.id}`}>
                  <img src={mainStory.image_url} alt={mainStory.title} loading="lazy" />
                </a>
              </div>
            )}
            <div className="mainContent">
              <h3 className="mainTitle">
                <a href={`/articles/${mainStory.slug || mainStory.id}`}>{mainStory.title}</a>
              </h3>
              <div className="mainExcerpt">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {mainStory.content ? `${mainStory.content.slice(0, 160)}...` : ""}
                </ReactMarkdown>
              </div>
              <time className="storyDate" dateTime={mainStory.created_at}>
                {new Date(mainStory.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </article>

          <div className="sideStories">
            {otherStories.map((story) => (
              <article className="sideCard" key={story.id}>
                <div className="sideContent">
                  <h4 className="sideTitle">
                    <a href={`/articles/${story.slug || story.id}`}>{story.title}</a>
                  </h4>
                  <time className="storyDate" dateTime={story.created_at}>
                    {new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </time>
                </div>
                {story.image_url && (
                  <div className="sideImage">
                    <a href={`/articles/${story.slug || story.id}`}>
                      <img src={story.image_url} alt={story.title} loading="lazy" />
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (category) {
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    let rowClass = `${category}-row`;
    if (category === 'africa') {
      rowClass = 'african-row'; 
    }

    return (
      <div className="aj-container">
        <section className="single-row-layout">
          {renderLayout(news, title, rowClass)}
        </section>
      </div>
    );
  }

  return (
    <div className="aj-container">
      <section className="three-row-layout">
        {renderLayout(globalNews, "Global News", "global-row")}
        {renderLayout(africanNews, "Across Africa", "african-row")}
        {renderLayout(localNews, "Local Lens", "local-row")}
      </section>
    </div>
  );
};

export default NewsColumns;
