import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to the new search page with the query
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for news..."
          aria-label="Search for news"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn search-btn">
          Search
        </button>
      </form>
    </section>
  );
};

export default SearchBar;
