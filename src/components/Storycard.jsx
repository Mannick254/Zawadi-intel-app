import { Link } from "react-router-dom";

export default function StoryCard({ article }) {
  return (
    <div className="story-card">
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          className="story-image"
        />
      )}
      <h3>
        <Link to={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p>{article.content.slice(0, 120)}...</p>
      <div className="story-meta">
        <span className="story-category">{article.category}</span>
        {article.badge && (
          <span className={`story-badge ${article.badge}`}>{article.badge}</span>
        )}
      </div>
    </div>
  );
}
