import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./css/styles.css";
import "./css/admin.css";
import "./css/article-interactive.css";
import "./css/article-base.css";
import "./css/article-components.css";
import "./css/clock-calendar.css";
import "./css/custom.css";
import "./components/FeaturedStories.module.css";
import "./css/kenyaupdate.css";
import "./css/layout.css";
import "./css/template.css";
import "./css/theme.css";
import "./css/widgets.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Pages
import AdminPage from "./pages/AdminPage.jsx";
import Login from "./pages/Login.jsx";
import ArticleDetail from "./components/ArticleDetail.jsx";
import TagPage from "./pages/TagPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import AuthorPage from "./pages/AuthorPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Trending from "./pages/Trending.jsx";

// Lazy load heavy components
const HeroBanner = React.lazy(() => import("./components/HeroBanner"));
const InstallBanner = React.lazy(() => import("./components/InstallBanner"));
const NewsTicker = React.lazy(() => import("./components/NewsTicker"));
const FeaturedStories = React.lazy(() => import("./components/FeaturedStories"));
const KenyaUpdate = React.lazy(() => import("./components/KenyaUpdate"));
const NewsColumns = React.lazy(() => import("./components/NewsColumns"));
const BottomHub = React.lazy(() => import("./components/BottomHub"));

function HomePage() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <HeroBanner />
        <InstallBanner />
        <NewsTicker />
        <FeaturedStories />
        <KenyaUpdate />
        <NewsColumns />
        <BottomHub />
      </Suspense>
    </div>
  );
}

function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/articles/:slug" element={<Layout><ArticleDetail /></Layout>} />
        <Route path="/tags/:tagName" element={<Layout><TagPage /></Layout>} />
        <Route path="/category/:category" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/author/:name" element={<Layout><AuthorPage /></Layout>} />
        <Route path="/trending" element={<Layout><Trending /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
