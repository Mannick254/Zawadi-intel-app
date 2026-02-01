import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";

export default function CategoryPage() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      let query = supabase
        .from("articles")
        .select("id, title, subtitle, slug, image_url, badge, created_at");

      if (category.toLowerCase() === 'politics') {
        query = query.or(`category.eq.Politics,badge.eq.Politics`);
      } else {
        query = query.eq("category", category);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setArticles(data || []);
      }
    };
    fetchCategoryArticles();
  }, [category]);

  if (error) return <p className="error">Failed to load articles: {error}</p>;
  if (!articles.length) return <p className="loading">No articles found in {category}.</p>;

  return (
    <>
      <Helmet>
        <title>{category} News | Zawadi Intel News</title>
        <meta name="description" content={`Latest ${category} news and updates from Zawadi Intel News.`} />
        <link rel="canonical" href={`https://zawadiintelnews.vercel.app/category/${category}`} />
      </Helmet>

      <Header />
      <main className="category-page">
        <h1 className="category-title">{category} Articles</h1>
        <div className="category-grid">
          {articles.map((article) => (
            <article key={article.id} className="category-card">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="category-thumb"
                  loading="lazy"
                />
              )}
              <h2>
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </h2>
              {article.subtitle && <p className="subtitle">{article.subtitle}</p>}
              <div className="meta">
                {article.badge && <span className={`badge ${article.badge}`}>{article.badge}</span>}
                <span className="date">{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
