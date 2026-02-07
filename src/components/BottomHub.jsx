import React from 'react';
import { Link } from 'react-router-dom';

const BottomHub = () => {
  return (
    <section className="bottom-hub">
      <div className="hub-container">
        {/* Newsletter Signup */}
        <div className="hub-block newsletter">
          <h3>Stay Updated</h3>
          <p>Kenya’s stories, Africa’s perspective, the world’s attention — straight to your inbox.</p>
          <form>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        {/* Popular Tags */}
        <div className="hub-block tags">
          <h3>Explore Topics</h3>
          <div className="tag-list">
            <Link to="/tags/kenya">Kenya</Link>
            <Link to="/tags/economy">Economy</Link>
            <Link to="/tags/climate">Climate</Link>
            <Link to="/tags/politics">Politics</Link>
            <Link to="/tags/africa">Africa</Link>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="hub-block social">
          <h3>Connect & Contact</h3>
          <div className="social-icons">
            <a href="https://twitter.com/zawadiintel" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
            <a href="https://facebook.com/zawadiintel" target="_blank" rel="noopener noreferrer">📘 Facebook</a>
            <a href="https://instagram.com/zawadiintel" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
            <a href="https://linkedin.com/company/zawadiintel" target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>
          </div>
          <div className="contact-info" style={{marginTop: '1rem'}}>
            <p>Email: <a href="mailto:contact@zawadiintel.com">contact@zawadiintel.com</a></p>
            <p>Phone: +254 700 000 000</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="hub-block quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/tags/politics">Politics</Link></li>
            <li><Link to="/tags/technology">Technology</Link></li>
            <li><Link to="/tags/sports">Sports</Link></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BottomHub;
