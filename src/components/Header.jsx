
import React from 'react';

const Header = () => {
  return (
    <nav className="top-nav" aria-label="Main Navigation">
      <div className="logo">
        <img src="/icons/icon-192.png" alt="Zawadi Intel logo" loading="lazy" width="48" height="48" />
        <span className="brand">📜 Zawadi Intel</span>
      </div>
      <button className="menu-toggle" aria-label="Toggle Menu">☰</button>
      <ul className="main-links">
       <li><a href="/" aria-current="page">Home</a></li>
       <li><a href="/global.html">Global</a></li>
       <li><a href="/middle-east.html">Middle East</a></li>
       <li><a href="/books.html">Books</a></li>
       <li><a href="/app.html">Archive</a></li>
       <li><a href="/account.html">Account</a></li>
     </ul>
   </nav>
  );
};

export default Header;
