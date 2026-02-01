import styles from "../pages/AdminPage.module.css";

const excerpt = (html, length = 100) => {
  const text = html.replace(/<[^>]+>/g, ""); // strip HTML tags
  return text.length > length ? text.slice(0, length) + "…" : text;
};

export default function ArticleList({ items, section, handleEdit, handleDelete }) {
  return (
    section === "news" ? (
      <ul className={styles.articleList}>
        {items.map((item) => (
          <li key={item.id} className={styles.articleItem}>
            {/* Image */}
            {item.image_url && <img src={item.image_url} alt={item.title} className={styles.thumbnail} />}
            
            {/* Title & Subtitle */}
            <div className={styles.textBlock}>
              <strong className={styles.title}>{item.title}</strong>
              {item.subtitle && (
                <div
                  className={styles.subtitlePreview}
                  dangerouslySetInnerHTML={{ __html: item.subtitle }}
                />
              )}
              <p>{excerpt(item.content, 120)}</p>
            </div>

            {/* Metadata */}
            <div className={styles.meta}>
              <span>Slug: {item.slug}</span>
              {item.author && <span className={styles.author}>By {item.author}</span>}
              {item.dateline && <span className={styles.dateline}>{item.dateline}</span>}
              {item.publicationDate && (
                <span className={styles.date}>
                  {new Date(item.publicationDate).toLocaleDateString()}
                </span>
              )}
              {item.badge && <span className={`${styles.badge} ${styles[item.badge]}`}>{item.badge}</span>}
              {item.trending && <span className={`${styles.badge} ${styles.trending}`}>Trending</span>}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
              <a href={`/articles/${item.slug}`} className={styles.readMore}>Read More</a>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className={styles.rowContainer}>
        {items.map((item) => (
          <article key={item.id} className={styles.rowCard}>
            {item.image_url && <img src={item.image_url} alt={item.title} className={styles.thumbnailLarge} />}
            
            <h3>{item.title}</h3>
            {item.subtitle && (
              <h4
                className={styles.subtitle}
                dangerouslySetInnerHTML={{ __html: item.subtitle }}
              />
            )}
            <p>{excerpt(item.content, 150)}</p>

            {/* Metadata */}
            <div className={styles.meta}>
              {item.author && <span className={styles.author}>By {item.author}</span>}
              {item.dateline && <span className={styles.dateline}>{item.dateline}</span>}
              {item.publicationDate && (
                <span className={styles.date}>
                  {new Date(item.publicationDate).toLocaleDateString()}
                </span>
              )}
              {item.badge && <span className={`${styles.badge} ${styles[item.badge]}`}>{item.badge}</span>}
              {item.trending && <span className={`${styles.badge} ${styles.trending}`}>Trending</span>}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
              <a href={`/articles/${item.slug}`} className={styles.readMore}>Read More</a>
            </div>
          </article>
        ))}
      </div>
    )
  );
}
