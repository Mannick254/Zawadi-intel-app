import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const TagPage = () => {
  const { tagName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .contains("tags", [tagName]); // assumes tags column is text[]

      if (error) {
        setErrorMsg("Failed to load articles.");
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };

    fetchArticles();
  }, [tagName]);

  return (
    <section className="tag-page">
      <h2>Articles tagged with "{tagName}"</h2>

      {loading && <p>Loading...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}
      {!loading && !errorMsg && articles.length === 0 && (
        <p>No articles found for this tag.</p>
      )}

      <ul className="tag-articles">
        {articles.map((article) => (
          <li key={article.id} className="tag-article">
            <a href={`/articles/${article.slug || article.id}`}>
              <h3>{article.title}</h3>
            </a>
            <p>{article.content?.slice(0, 120)}...</p>
            <time dateTime={article.created_at}>
              {new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TagPage;
