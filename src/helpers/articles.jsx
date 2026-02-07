import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import styles from "../pages/AdminPage.module.css";

// --- Helper Functions ---
export const createExcerpt = (markdown, length = 100) => {
    if (!markdown) return "";
    const text = markdown
        .replace(/[`*#_>!-]/g, "") // Basic Markdown symbols
        .replace(/!\[(.*?)\]\(.*?\)/g, "$1") // Images
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
        .replace(/\n+/g, " "); // Collapse newlines
    return text.length > length ? text.slice(0, length) + "…" : text;
};

// --- Sub-components ---
export const ArticleMeta = ({ item }) => {
    const publicationDate = item.publicationDate || item.created_at;
    const formattedDate = publicationDate
        ? new Date(publicationDate).toLocaleDateString()
        : "Date unavailable";

    return (
        <footer className={styles.meta}>
            <span>Slug: {item.slug}</span>
            {item.author && <span className={styles.author}>By {item.author}</span>}
            {item.dateline && <span className={styles.dateline}>{item.dateline}</span>}
            <time className={styles.date} dateTime={publicationDate}>
                {formattedDate}
            </time>
            {item.badge && (
                <span className={`${styles.badge} ${styles[item.badge]}`}>{item.badge}</span>
            )}
            {item.trending && (
                <span className={`${styles.badge} ${styles.trending}`}>Trending</span>
            )}
        </footer>
    );
};

export const ArticleActions = ({ item, handleEdit, handleDelete, loading }) => (
    <div className={styles.actions}>
        <button
            onClick={() => handleEdit(item)}
            aria-label={`Edit ${item.title}`}
            disabled={loading}
        >
            Edit
        </button>
        <button
            onClick={() => handleDelete(item.id)}
            aria-label={`Delete ${item.title}`}
            disabled={loading}
        >
            Delete
        </button>
        <Link to={`/articles/${item.slug}`} className={styles.readMore}>
            Read More
        </Link>
    </div>
);

export const NewsArticleListItem = ({ item, handleEdit, handleDelete, loading }) => (
    <article className={styles.articleItem}>
        {item.image_url && (
            <img
                src={item.image_url}
                alt={item.title || "Article thumbnail"}
                className={styles.thumbnail}
                loading="lazy"
            />
        )}
        <header className={styles.textBlock}>
            <strong className={styles.title}>{item.title}</strong>
            {item.subtitle && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} className={styles.subtitlePreview}>
                    {item.subtitle}
                </ReactMarkdown>
            )}
        </header>
        <p>{createExcerpt(item.content, 120)}</p>
        <ArticleMeta item={item} />
        <ArticleActions
            item={item}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            loading={loading}
        />
    </article>
);

export const FeaturedArticleCard = ({ item, handleEdit, handleDelete, loading }) => (
    <article className={styles.rowCard}>
        {item.image_url && (
            <img
                src={item.image_url}
                alt={item.title || "Article thumbnail"}
                className={styles.thumbnailLarge}
                loading="lazy"
            />
        )}
        <header>
            <h3>{item.title}</h3>
            {item.subtitle && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} className={styles.subtitle}>
                    {item.subtitle}
                </ReactMarkdown>
            )}
        </header>
        <p>{createExcerpt(item.content, 150)}</p>
        <ArticleMeta item={item} />
        <ArticleActions
            item={item}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            loading={loading}
        />
    </article>
);