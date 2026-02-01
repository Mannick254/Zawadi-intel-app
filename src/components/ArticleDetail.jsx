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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);

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
  const estimateReadingTime = (text) => {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200); // ~200 words/minute
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Zawadi Intel News</title>
        <meta name="description" content={article.content.slice(0, 150)} />
        <meta name="keywords" content={article.tags?.join(", ") || "news, Kenya, Africa"} />
        <link rel="canonical" href={`https://zawadiintelnews.vercel.app/articles/${slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content.slice(0, 150)} />
        <meta property="og:image" content={article.image_url} />
        <meta property="og:url" content={`https://zawadiintelnews.vercel.app/articles/${slug}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.content.slice(0, 150)} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            image: [article.image_url],
            author: { "@type": "Person", name: article.author || "Zawadi Intel News" },
            publisher: {
              "@type": "Organization",
              name: "Zawadi Intel News",
              logo: { "@type": "ImageObject", url: "https://zawadiintelnews.vercel.app/logo.png" }
            },
            datePublished: article.created_at,
            dateModified: article.updated_at || article.created_at,
            description: article.content.slice(0, 150)
          })}
        </script>
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
                <span className="category">
                  Category: <a href={`/category/${article.category}`}>{article.category}</a>
                </span>
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

            {/* Body rendered via Markdown */}
            <div className="article-body">
              <ReactMarkdown
                children={article.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({node, ...props}) => <h2 className="subheading" {...props} />,
                  h3: ({node, ...props}) => <h3 className="minor-heading" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="pull-quote" {...props} />,
                  img: ({node, ...props}) => <img className="inline-image" loading="lazy" {...props} />,
                  a: ({node, ...props}) => <a className="inline-link" {...props} />
                }}
              />
            </div>

            {/* Engagement */}
            <LikeButton />
            <ShareButtons url={`https://zawadiintelnews.vercel.app/articles/${slug}`} />
            <CommentBox />

            {/* Mid-article CTA */}
            <SubscribeForm />

            {/* Related Articles */}
            <RelatedArticles related={related} />

            {/* Tags */}
            {article.tags && (
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
