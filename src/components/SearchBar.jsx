import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("articles") // or "stories" depending on your table
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`) // search in both title and content
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Search error:", error.message);
      setErrorMsg("Failed to fetch search results.");
    } else {
      setResults(data);
    }

    setLoading(false);
  };

  return (
    <section className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search stories..."
          aria-label="Search stories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn">Search</button>
      </form>

      {loading && <p>Searching...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="search-results">
        {results.map((r) => (
          <div className="result-card" key={r.id}>
            {r.image_url && <img src={r.image_url} alt={r.title} />}
            <div className="result-content">
              <h3><a href={`/articles/${r.slug}`}>{r.title}</a></h3>
              <p>{r.content.slice(0, 120)}...</p>
              <small>
                {new Date(r.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SearchBar;
