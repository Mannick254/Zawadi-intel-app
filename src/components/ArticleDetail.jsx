import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CommentBox from "./CommentBox";
import LikeButton from "./LikeButton";
import ShareButtons from "./ShareButtons";
import SubscribeForm from "./SubscribeForm";
import { Helmet } from "react-helmet";
import RelatedArticles from "./RelatedArticles";
import TrendingSidebar from "./TrendingSidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);

  // Engagement toggles
  const [showLike, setShowLike] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setArticle(data);

        const { data: relatedData } = await supabase
          .from("articles")
          .select("id, title, slug, badge, image_url")
          .eq("category", data.category)
          .neq("slug", slug)
          .limit(3);

        setRelated(relatedData || []);
      }
    };
    fetchArticle();
  }, [slug]);

  if (!article && !error) return <p className="loading">Loading article...</p>;
  if (error) return <p className="error">Failed to load article: {error}</p>;

  // Utility: estimate reading time
  const estimateReadingTime = (text = "") => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.ceil(words / 200); // ~200 words/minute
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Zawadi Intel News</title>
        <meta name="description" content={article.content.slice(0, 150)} />
        <meta
          name="keywords"
          content={Array.isArray(article.tags) ? article.tags.join(", ") : "news, Kenya, Africa"}
        />
        <link rel="canonical" href={`https://zawadiintelnews.vercel.app/articles/${slug}`} />
        {/* Open Graph, Twitter, JSON-LD omitted for brevity */}
      </Helmet>

      <main className="article-layout">
        <div className="article-content">
          <article className="news-article">
            <header className="article-header">
              {article.badge && <span className={`badge ${article.badge}`}>{article.badge}</span>}
              <h1>{article.title}</h1>
              {article.subtitle && <h2 className="subtitle">{article.subtitle}</h2>}
              <div className="article-meta">
                {article.author && (
                  <span className="author">
                    By <a href={`/author/${article.author}`}>{article.author}</a>
                  </span>
                )}
                {article.dateline && <span className="dateline">{article.dateline}</span>}
                {article.category && (
                  <span className="category">
                    Category: <a href={`/category/${article.category}`}>{article.category}</a>
                  </span>
                )}
                <span className="published">
                  Published: {new Date(article.created_at).toLocaleString()}
                </span>
                {article.updated_at && (
                  <span className="updated">
                    Updated: {new Date(article.updated_at).toLocaleString()}
                  </span>
                )}
                <span className="reading-time">{estimateReadingTime(article.content)} min read</span>
                {article.verified && <span className="badge verified">Fact‑Checked</span>}
              </div>
            </header>

            {/* Hero Image */}
            {article.image_url && (
              <figure className="hero-image">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="article-image"
                  loading="lazy"
                />
                {article.image_caption && (
                  <figcaption className="caption">{article.image_caption}</figcaption>
                )}
              </figure>
            )}

            {/* Engagement toolbar */}
            <div className="article-engagement">
              <span className="engagement-link" onClick={() => setShowLike(!showLike)}>👍 Like</span>
              <span className="engagement-link" onClick={() => setShowShare(!showShare)}>🔗 Share</span>
              <span className="engagement-link" onClick={() => setShowComment(!showComment)}>💬 Comment</span>

              {showLike && <LikeButton />}
              {showShare && <ShareButtons url={`https://zawadiintelnews.vercel.app/articles/${slug}`} />}
              {showComment && <CommentBox />}
            </div>

            {/* Body rendered via Markdown */}
            <div className="article-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Mid-article CTA */}
            <SubscribeForm />

            {/* Related Articles */}
            <RelatedArticles related={related} />

            {/* Tags */}
            {Array.isArray(article.tags) && (
              <div className="tags">
                {article.tags.map((tag) => (
                  <a key={tag} href={`/tag/${tag}`} className="tag-link">
                    #{tag}
                  </a>
                ))}
              </div>
            )}
          </article>
        </div>

        {/* Sidebar */}
        <TrendingSidebar />
      </main>
    </>
  );
}
