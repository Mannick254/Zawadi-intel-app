import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import styles from "./Articles.module.css";
import LikeButton from "../components/LikeButton";
import CommentBox from "../components/CommentBox";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true) // only published articles
        .order("created_at", { ascending: false });

      setLoading(false);

      if (error) {
        console.error("Error fetching articles:", error.message);
        setErrorMsg(error.message);
      } else {
        setArticles(data || []);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <p className={styles.status}>Loading articles...</p>;
  }

  if (errorMsg) {
    return <p className={styles.error}>⚠️ {errorMsg}</p>;
  }

  if (articles.length === 0) {
    return <p className={styles.status}>No articles available yet.</p>;
  }

  return (
    <div className={styles.articlePage}>
      <h1 className={styles.pageTitle}>Articles</h1>
      <ul className={styles.articleList}>
        {articles.map((article) => (
          <li key={article.id} className={styles.articleCard}>
            <h3 className={styles.articleTitle}>{article.title}</h3>
            <p className={styles.articleExcerpt}>
              {article.content ? `${article.content.slice(0, 150)}...` : ""}
            </p>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className={styles.articleImage}
                loading="lazy"
              />
            )}

            <span className={styles.articleMeta}>
              Category: {article.category || "Uncategorized"}
            </span>

            <div className={styles.articleActions}>
              <LikeButton articleId={article.id} />
              <CommentBox articleId={article.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
