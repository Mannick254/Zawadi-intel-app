import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/style.css';
// ... your other CSS imports
import HeroBanner from './components/HeroBanner';
import SearchBar from './components/SearchBar';
import InstallBanner from './components/InstallBanner';
import NewsTicker from './components/NewsTicker';
import FeaturedStories from './components/FeaturedStories';
import KenyaUpdate from './components/KenyaUpdate';
import NewsColumns from './components/NewsColumns';
import BottomHub from './components/BottomHub';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage'; // new admin component

function HomePage() {
  return (
    <div>
      <HeroBanner />
      <SearchBar />
      <InstallBanner />
      <NewsTicker />
      <FeaturedStories />
      <KenyaUpdate />
      <NewsColumns />
      <BottomHub />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
