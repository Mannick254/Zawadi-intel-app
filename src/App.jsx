import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop.jsx";
import TinyBar from "./components/TinyBar.jsx";
import RequireAdmin from "./components/RequireAdmin"; // 🔒 Admin guard

// Pages
import AdminPage from "./pages/AdminPage.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ArticleDetail from "./components/ArticleDetail.jsx";
import TagPage from "./pages/TagPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import AuthorPage from "./pages/AuthorPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Trending from "./pages/Trending.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AboutUs from "./pages/AboutUs.jsx";

// Lazy load heavy components
const InstallBanner = React.lazy(() => import("./components/InstallBanner"));
const NewsTicker = React.lazy(() => import("./components/NewsTicker"));
const FeaturedStories = React.lazy(() => import("./components/FeaturedStories"));
const KenyaUpdate = React.lazy(() => import("./components/KenyaUpdate"));
const NewsColumns = React.lazy(() => import("./components/NewsColumns"));
const OpinionSection = React.lazy(() => import("./components/OpinionSection"));
const BottomHub = React.lazy(() => import("./components/BottomHub"));

function HomePage() {
  return (
    <Suspense fallback={<div className="loader">Loading homepage...</div>}>
      <InstallBanner />
      <NewsTicker />
      <FeaturedStories />
      <KenyaUpdate />
      <NewsColumns />
      <OpinionSection />
      <BottomHub />
    </Suspense>
  );
}

function Layout({ children }) {
  return (
    <>
      <header>
        <Header />
        <TinyBar />
      </header>
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Proper Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please refresh the page.</h2>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route
            path="/admin"
            element={
              <Layout>
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              </Layout>
            }
          />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/articles/:slug" element={<Layout><ArticleDetail /></Layout>} />
          <Route path="/tags/:tagName" element={<Layout><TagPage /></Layout>} />
          <Route path="/category/:category" element={<Layout><CategoryPage /></Layout>} />
          <Route path="/author/:name" element={<Layout><AuthorPage /></Layout>} />
          <Route path="/trending" element={<Layout><Trending /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}
