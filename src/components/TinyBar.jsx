import React from 'react';
import { Link } from 'react-router-dom';

const TinyBar = () => {
  const linkStyle = {
    margin: '0 10px',
    color: '#333',
    textDecoration: 'none',
    fontSize: '12px'
  };

  const trendingButtonStyle = {
    backgroundColor: '#e53e3e',
    color: '#fff',
    padding: '0.25rem 0.6rem',
    borderRadius: '5px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
  };

  return (
    <div style={{ backgroundColor: '#f2f2f2', padding: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Link to="/trending" style={trendingButtonStyle}>
        Trending
      </Link>
      <Link to="/category/politics" style={linkStyle}>
        Politics
      </Link>
      <Link to="/category/climate" style={linkStyle}>
        Climate
      </Link>
      <Link to="/category/education" style={linkStyle}>
        Education
      </Link>
      <Link to="/category/society" style={linkStyle}>
        Society
      </Link>
    </div>
  );
};

export default TinyBar;
