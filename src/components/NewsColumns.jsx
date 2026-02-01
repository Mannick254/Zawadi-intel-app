import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // adjust path if needed
import StoryCard from "./Storycard"; // ✅ import StoryCard

const NewsColumns = () => {
  const [globalNews, setGlobalNews] = useState([]);
  const [africanNews, setAfricanNews] = useState([]);
  const [localNews, setLocalNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error.message);
        return;
      }

      // Split into categories
      setGlobalNews(data.filter((a) => a.category === "global"));
      setAfricanNews(data.filter((a) => a.category === "africa"));
      setLocalNews(data.filter((a) => a.category === "local"));
    };

    fetchNews();
  }, []);

  return (
    <main className="aj-container">
      <section className="three-column-layout">
        <div className="global-column">
          <h2>News Today</h2>
          <section className="global-news article-list">
            {globalNews.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </section>
        </div>

        <div className="african-column">
          <h2>Africa Trending News</h2>
          <section className="african-news article-list">
            {africanNews.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </section>
        </div>

        <div className="local-column">
          <h2>Local News</h2>
          <section className="local-news article-list">
            {localNews.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
};

export default NewsColumns;
