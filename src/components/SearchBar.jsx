
import React from 'react';

const SearchBar = () => {
  return (
    <section className="search-bar">
      <form>
        <input type="text" placeholder="Search stories..." aria-label="Search stories" />
        <button type="submit" className="btn">Search</button>
      </form>
    </section>
  );
};

export default SearchBar;
