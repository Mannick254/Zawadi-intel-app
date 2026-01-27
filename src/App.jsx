import React from "react";
import { Routes, Route } from "react-router-dom";

// Global styles
import "./css/style.css";
import "./css/admin.css";
import "./css/article.css";
import "./css/articles.css";
import "./css/clock-calendar.css";
import "./css/custom.css";
import "./css/featuredstory.css";
import "./css/kenyaupdate.css";
import "./css/layout.css";
import "./css/template.css";
import "./css/theme.css";
import "./css/widgets.css";

// Component imports
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import SearchBar from "./components/SearchBar";
import InstallBanner from "./components/InstallBanner";
import NewsTicker from "./components/NewsTicker";
import FeaturedStories from "./components/FeaturedStories";
import KenyaUpdate from "./components/KenyaUpdate";
import NewsColumns from "./components/NewsColumns";
import BottomHub from "./components/BottomHub";
import Footer from "./components/Footer";

// Pages
import AdminPage from "./pages/AdminPage.jsx";
import Login from "./pages/Login.jsx";

function HomePage() {
  return (
    <div>
      <Header />
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
