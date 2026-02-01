import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <nav className={`top-nav ${isSticky ? 'sticky-header' : ''}`} aria-label="Main Navigation">
        <div className="aj-container">
          <div className="logo">
            <img
              src="/icons/icon-192.png"
              alt="Zawadi Intel logo"
              loading="lazy"
              width="48"
              height="48"
            />
            <span className="brand">📜 Zawadi Intel</span>
          </div>

          {/* Search Toggle */}
          <button
            className="search-toggle"
            aria-label="Toggle Search"
            onClick={() => setSearchVisible(!searchVisible)}
          >
            🔍
          </button>

          {/* Menu Toggle button */}
          <button
            className="menu-toggle"
            aria-label="Toggle Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Navigation links */}
          <ul className={`main-links ${menuOpen ? 'show' : ''}`}>
            <li><a href="/" aria-current="page">Home</a></li>
            <li><a href="/trending">Trending</a></li>
            <li><a href="/category/politics">Politics</a></li>
            <li><a href="/admin">Admin</a></li>
          </ul>
        </div>
      </nav>
      {searchVisible && <SearchBar />}
    </>
  );
};

export default Header;
