import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { supabase } from '../supabaseClient';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isSticky, setSticky] = useState(false);
  const [user, setUser] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUser(data.user);
    };

    window.addEventListener('scroll', handleScroll);
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser ?? null);
      }
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const handleAccountClick = (e) => {
    if (window.innerWidth <= 480) {
      e.preventDefault();
      setAccountDropdownOpen(!accountDropdownOpen);
    }
  };

  return (
    <>
      <nav className={`top-nav ${isSticky ? 'sticky-header' : ''}`} aria-label="Main Navigation">
        <div className="aj-container nav-inner">
          {/* Logo */}
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

          {/* Navigation links */}
          <ul className={`main-links ${menuOpen ? 'show' : ''}`}>
            <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
            <li><Link to="/category/global" onClick={handleLinkClick}>Global</Link></li>
            <li><Link to="/category/africa" onClick={handleLinkClick}>Africa</Link></li>
            <li><Link to="/category/local" onClick={handleLinkClick}>Local</Link></li>
            <li><Link to="/category/opinion" onClick={handleLinkClick}>Opinion</Link></li>
          </ul>

          {/* Search + Account */}
          <div className="nav-controls">
            <div className="dropdown account">
              <a href="#" onClick={handleAccountClick}>Account</a>
              <ul className={`dropdown-content account-dropdown ${accountDropdownOpen ? 'show' : ''}`}>
                {user ? (
                  <>
                    <li><Link to="/profile" onClick={handleLinkClick}>Profile</Link></li>
                    <li><a href="#" onClick={() => { handleLogout(); handleLinkClick(); }}>Logout</a></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" onClick={handleLinkClick}>User Login</Link></li>
                    <li className="divider" />
                    <li><Link to="/admin" onClick={handleLinkClick}>Admin Login</Link></li>
                  </>
                )}
              </ul>
            </div>
            <button
              className="search-toggle"
              aria-label="Toggle Search"
              onClick={() => setSearchVisible(!searchVisible)}
            >
              🔍
            </button>
          </div>

          {/* Menu Toggle (floats right on mobile) */}
          <button
            className="menu-toggle"
            aria-label="Toggle Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>
      {searchVisible && <SearchBar />}
    </>
  );
};

export default Header;
