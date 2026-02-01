import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet";

export default function AuthorPage() {
  const { name } = useParams();
  const [articles, setArticles] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorData = async () => {
      // Fetch author profile if you have an authors table
      const { data: authorData } = await supabase
        .from("authors")
        .select("*")
        .eq("name", name)
        .single();

      setAuthorInfo(authorData || { name });

      // Fetch articles by this author
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, subtitle, slug, image_url, badge, created_at, category")
        .eq("author", name)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setArticles(data || []);
      }
    };
    fetchAuthorData();
  }, [name]);

  if (error) return <p className="error">Failed to load author: {error}</p>;
  if (!articles.length) return <p className="loading">No articles found for {name}.</p>;

  return (
    <>
      <Helmet>
        <title>{name} | Zawadi Intel News</title>
        <meta name="description" content={`Articles written by ${name} on Zawadi Intel News.`} />
        <link rel="canonical" href={`https://zawadiintelnews.vercel.app/author/${name}`} />
      </Helmet>

      <Header />
      <main className="author-page">
        <section className="author-profile">
          <h1>{authorInfo?.name}</h1>
          {authorInfo?.bio && <p className="bio">{authorInfo.bio}</p>}
          {authorInfo?.avatar_url && (
            <img
              src={authorInfo.avatar_url}
              alt={authorInfo.name}
              className="author-avatar"
              loading="lazy"
            />
          )}
        </section>

        <h2>Articles by {authorInfo?.name}</h2>
        <div className="author-grid">
          {articles.map((article) => (
            <article key={article.id} className="author-card">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="author-thumb"
                  loading="lazy"
                />
              )}
              <h3>
                <Link to={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              {article.subtitle && <p className="subtitle">{article.subtitle}</p>}
              <div className="meta">
                {article.badge && <span className={`badge ${article.badge}`}>{article.badge}</span>}
                <span className="category">{article.category}</span>
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
