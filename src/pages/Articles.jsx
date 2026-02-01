import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./Articles.module.css";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error.message);
      } else {
        setArticles(data);
      }
    };

    fetchArticles();
  }, []);

  if (articles.length === 0) {
    return <p>No articles available yet.</p>;
  }

  return (
    <div className={styles.articlePage}>
    <h1>Articles Page</h1>
    <ul>
      {articles.map((article) => (
        <li key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.content.slice(0, 150)}...</p>
          {article.image_url && (
            <img src={article.image_url} alt={article.title} width="200" />
          )}
          <span style={{ fontStyle: "italic", color: "#555" }}>
            Category: {article.category}
          </span>
        </li>
      ))}
    </ul>
    </div>
  );
}
