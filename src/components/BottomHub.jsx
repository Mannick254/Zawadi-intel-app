
import React from 'react';

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
            <a href="/tags/kenya">Kenya</a>
            <a href="/tags/economy">Economy</a>
            <a href="/tags/climate">Climate</a>
            <a href="/tags/politics">Politics</a>
            <a href="/tags/africa">Africa</a>
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
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/tags/politics">Politics</a></li>
            <li><a href="/tags/technology">Technology</a></li>
            <li><a href="/tags/sports">Sports</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BottomHub;
