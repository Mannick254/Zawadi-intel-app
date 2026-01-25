
import React from 'react';
import './css/style.css';
import './css/layout.css';
import './css/theme.css';
import './css/articles.css';
import './css/featuredstory.css';
import './css/clock-calendar.css';
import './css/admin.css';
import './css/widgets.css';
import './css/custom.css';
import './css/template.css';
import './css/kenyaupdate.css';
import HeroBanner from './components/HeroBanner';
import SearchBar from './components/SearchBar';
import InstallBanner from './components/InstallBanner';
import NewsTicker from './components/NewsTicker';
import FeaturedStories from './components/FeaturedStories';
import KenyaUpdate from './components/KenyaUpdate';
import NewsColumns from './components/NewsColumns';
import BottomHub from './components/BottomHub';
import Footer from './components/Footer';

function App() {
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

export default App;
