import styles from "../pages/AdminPage.module.css";

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
  relatedLinks
}) {
  return (
    <div className={styles.previewContainer}>
      <h2>Preview</h2>
      <article className={styles.previewCard}>
        
        {/* Featured Image */}
        {imageUrl && (
          <figure className={styles.featuredImage}>
            <img src={imageUrl} alt={title} />
            <figcaption>{subtitle}</figcaption>
          </figure>
        )}

        {/* Title & Subtitle */}
        <h3>{title || "Untitled"}</h3>
        {subtitle && (
          <h4
            className={styles.subtitle}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}

        {/* Metadata */}
        <div className={styles.metaInfo}>
          {author && <span className={styles.author}>By {author}</span>}
          {dateline && <span className={styles.dateline}>{dateline}</span>}
          {publicationDate && (
            <span className={styles.date}>
              {new Date(publicationDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: content || "Content will appear here..." }}
        />

        {/* Video Embed */}
        {videoUrl && (
          <div className={styles.videoEmbed}>
            <iframe
              src={videoUrl}
              title="Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Tags */}
        {tags && (
          <div className={styles.tags}>
            {tags.split(",").map((tag) => (
              <span key={tag.trim()} className={styles.tag}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Related Links */}
        {relatedLinks && (
          <div className={styles.related}>
            <h5>Related</h5>
            <ul>
              {relatedLinks.split(",").map((link, idx) => (
                <li key={idx}>
                  <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                    {link.trim()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Badges */}
        <div className={styles.meta}>
          <span className={styles.badge}>{section}</span>
          {section === "news" && <span className={styles.badge}>{category}</span>}
          {badge && <span className={`${styles.badge} ${styles[badge]}`}>{badge}</span>}
          {trending && <span className={`${styles.badge} ${styles.trending}`}>Trending</span>}
        </div>

        {/* Slug */}
        <small>Slug: {slugify(title)}</small>
      </article>
    </div>
  );
}
