import styles from "../pages/AdminPage.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";

const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Preview({
  title,
  subtitle,
  content,
  imageUrl,
  section,
  category,
  badge,
  trending,
  author,
  dateline,
  publicationDate,
  tags,
  videoUrl,
  relatedLinks,
}) {
  return (
    <div className={styles.previewContainer}>
      <h2>Preview</h2>
      <article className={styles.previewCard}>
        
        {/* Featured Image */}
        {imageUrl && (
          <figure className={styles.featuredImage}>
            <img
              src={imageUrl}
              alt={title ? `Featured image for ${title}` : "Featured image"}
              loading="lazy"
            />
            {subtitle && <figcaption>{subtitle}</figcaption>}
          </figure>
        )}

        {/* Title & Subtitle */}
        <h3>{title || "Untitled"}</h3>
        {subtitle && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} className={styles.subtitle}>
            {subtitle}
          </ReactMarkdown>
        )}

        {/* Metadata */}
        <section className={styles.metaInfo}>
          {author && <span className={styles.author}>By {author}</span>}
          {dateline && <span className={styles.dateline}>{dateline}</span>}
          {publicationDate && (
            <time className={styles.date} dateTime={publicationDate}>
              {new Date(publicationDate).toLocaleDateString()}
            </time>
          )}
        </section>

        {/* Content */}
        <section className={styles.content}>
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <p>Content will appear here...</p>
          )}
        </section>

        {/* Video Embed */}
        {videoUrl && (
          <div className={styles.videoEmbed}>
            <iframe
              src={videoUrl}
              title="Embedded video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Tags */}
        {tags && (
          <aside className={styles.tags}>
            {tags.split(",").map((tag) => (
              <span key={tag.trim()} className={styles.tag}>
                {tag.trim()}
              </span>
            ))}
          </aside>
        )}

        {/* Related Links */}
        {relatedLinks && (
          <aside className={styles.related}>
            <h5>Related</h5>
            <ul>
              {relatedLinks.split(",").map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Related link ${idx + 1}`}
                  >
                    {link.trim()}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Badges */}
        <div className={styles.meta}>
          <span className={styles.badge}>{section}</span>
          {section === "news" && <span className={styles.badge}>{category}</span>}
          {badge && <span className={`${styles.badge} ${styles[badge]}`}>{badge}</span>}
          {trending && <span className={`${styles.badge} ${styles.trending}`}>Trending</span>}
        </div>

        {/* Slug */}
        <small>Slug: {slugify(title || "untitled")}</small>
      </article>
    </div>
  );
}

Preview.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  content: PropTypes.string,
  imageUrl: PropTypes.string,
  section: PropTypes.string,
  category: PropTypes.string,
  badge: PropTypes.string,
  trending: PropTypes.bool,
  author: PropTypes.string,
  dateline: PropTypes.string,
  publicationDate: PropTypes.string,
  tags: PropTypes.string,
  videoUrl: PropTypes.string,
  relatedLinks: PropTypes.string,
};
