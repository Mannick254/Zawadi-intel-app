
import React from 'react';
import '../public/css/style.css';
import '../public/css/layout.css';
import '../public/css/theme.css';
import '../public/css/articles.css';
import '../public/css/featuredstory.css';
import '../public/css/clock-calendar.css';
import '../public/css/admin.css';
import '../public/css/widgets.css';
import '../public/css/custom.css';
import '../public/css/template.css';
import '../public/css/kenyaupdate.css';
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
