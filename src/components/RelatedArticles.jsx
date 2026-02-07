import { Link } from "react-router-dom";
import "../css/RelatedArticles.css";

const RelatedArticles = ({ related }) => {
  if (!related || related.length === 0) {
    return null;
  }

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder.png';
  };

  return (
    <aside className="related-articles" aria-label="Related articles">
      <h3>Related Articles</h3>
      <div className="related-grid">
        {related.map((rel) => (
          <article key={rel.id} className="related-card">
            <Link to={`/articles/${rel.slug}`} className="related-link">
              {rel.image_url && (
                <img
                  src={rel.image_url}
                  alt={rel.title || "Related article image"}
                  className="related-thumb"
                  loading="lazy"
                  onError={handleImageError}
                />
              )}
              <div className="related-card-content">
                {rel.badge && <span className={`badge ${rel.badge}`}>{rel.badge}</span>}
                <h4 className="related-title">{rel.title}</h4>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </aside>
  );
};

export default RelatedArticles;
