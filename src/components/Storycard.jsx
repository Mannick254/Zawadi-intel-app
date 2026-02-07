import { Link } from "react-router-dom";

// Utility to safely generate excerpts
const excerpt = (text, length) =>
  text ? text.slice(0, length) + (text.length > length ? "..." : "") : "";

export default function StoryCard({ article, layout = "default" }) {
  if (!article) return null;

  return (
    <article className={`story-card story-card--${layout}`}>
      {/* Big layout */}
      {layout === "big" && (
        <>
          <header>
            <h2 className="story-title">
              <Link to={`/articles/${article.slug}`} aria-label={article.title}>
                {article.title}
              </Link>
            </h2>
          </header>
          {article.image_url && (
            <figure>
              <img
                src={article.image_url}
                alt={article.title || "Article image"}
                className="story-image big-image"
                loading="lazy"
              />
            </figure>
          )}
          <p className="story-excerpt">{excerpt(article.content, 200)}</p>
          <footer className="story-meta">
            <span className="story-category">{article.category}</span>
            {article.badge && (
              <span className={`story-badge story-badge--${article.badge}`}>
                {article.badge}
              </span>
            )}
          </footer>
        </>
      )}

      {/* Side layout */}
      {layout === "side" && (
        <div className="side-layout">
          <div className="side-text">
            <h3 className="story-title">
              <Link to={`/articles/${article.slug}`} aria-label={article.title}>
                {article.title}
              </Link>
            </h3>
            <p className="story-excerpt">{excerpt(article.content, 120)}</p>
            <footer className="story-meta">
              <span className="story-category">{article.category}</span>
              {article.badge && (
                <span className={`story-badge story-badge--${article.badge}`}>
                  {article.badge}
                </span>
              )}
            </footer>
          </div>
          {article.image_url && (
            <figure>
              <img
                src={article.image_url}
                alt={article.title || "Article image"}
                className="story-image side-image"
                loading="lazy"
              />
            </figure>
          )}
        </div>
      )}

      {/* Rectangular layout */}
      {layout === "rect" && (
        <div className="rect-layout">
          {article.image_url && (
            <figure>
              <img
                src={article.image_url}
                alt={article.title || "Article image"}
                className="story-image rect-image"
                loading="lazy"
              />
            </figure>
          )}
          <div className="rect-text">
            <h3 className="story-title">
              <Link to={`/articles/${article.slug}`} aria-label={article.title}>
                {article.title}
              </Link>
            </h3>
            <p className="story-excerpt">{excerpt(article.content, 100)}</p>
            <footer className="story-meta">
              <span className="story-category">{article.category}</span>
              {article.badge && (
                <span className={`story-badge story-badge--${article.badge}`}>
                  {article.badge}
                </span>
              )}
            </footer>
          </div>
        </div>
      )}

      {/* Default layout */}
      {layout === "default" && (
        <>
          {article.image_url && (
            <figure>
              <img
                src={article.image_url}
                alt={article.title || "Article image"}
                className="story-image"
                loading="lazy"
              />
            </figure>
          )}
          <h3 className="story-title">
            <Link to={`/articles/${article.slug}`} aria-label={article.title}>
              {article.title}
            </Link>
          </h3>
          <p className="story-excerpt">{excerpt(article.content, 120)}</p>
          <footer className="story-meta">
            <span className="story-category">{article.category}</span>
            {article.badge && (
              <span className={`story-badge story-badge--${article.badge}`}>
                {article.badge}
              </span>
            )}
          </footer>
        </>
      )}
    </article>
  );
}
