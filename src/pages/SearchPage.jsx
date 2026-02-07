
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Helmet } from "react-helmet";
import "./SearchPage.css";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get("q");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use Supabase full-text search
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .textSearch("title", `'${query}'`);

        if (error) {
          throw error;
        }

        setResults(data || []);
      } catch (err) {
        setError("Could not fetch search results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <>
      <Helmet>
        <title>{`Search results for "${query}"`}</title>
        <meta name="description" content={`Search results for "${query}" on Zawadi Intel News.`} />
      </Helmet>
      <main className="search-page">
        <h1 className="search-title">
          Search Results for: <span>"{query}"</span>
        </h1>

        {loading && <div className="loading">Searching...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="search-results-grid">
            {results.length > 0 ? (
              results.map((article) => (
                <div key={article.id} className="search-result-card">
                  <Link to={`/articles/${article.slug}`} className="search-result-link">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="search-result-thumb"
                      loading="lazy"
                    />
                    <div className="search-result-content">
                      <h2 className="search-result-article-title">{article.title}</h2>
                      <p className="subtitle">{article.subtitle}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="no-results">No articles found matching your search.</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
