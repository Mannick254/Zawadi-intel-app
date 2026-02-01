import { Link } from "react-router-dom";

const RelatedArticles = ({ related }) => {
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <aside className="related-articles">
      <h3>Related Articles</h3>
      <div className="related-grid">
        {related.map((rel) => (
          <div key={rel.id} className="related-card">
            <Link to={`/articles/${rel.slug}`} className="related-link">
              {rel.image_url && (
                <img src={rel.image_url} alt={rel.title} className="related-thumb" />
              )}
              <div className="related-card-content">
                {rel.badge && <span className={`badge ${rel.badge}`}>{rel.badge}</span>}
                <h4>{rel.title}</h4>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default RelatedArticles;
