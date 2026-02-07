import React from 'react';
import {
  NewsArticleListItem,
  FeaturedArticleCard,
} from '../helpers/articles';
import styles from '../pages/AdminPage.module.css';

// --- Main Component ---
export default function ArticleList({ items, section, handleEdit, handleDelete, loading }) {
  if (loading) return <p>Loading articles...</p>;
  if (!items || items.length === 0)
    return <p className={styles.empty}>No articles available for this section.</p>;

  return section === 'news' ? (
    <ul className={styles.articleList}>
      {items.map((item) => (
        <NewsArticleListItem
          key={item.id}
          item={item}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          loading={loading}
        />
      ))}
    </ul>
  ) : (
    <div className={styles.cardContainer}>
      {items.map((item) => (
        <FeaturedArticleCard
          key={item.id}
          item={item}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          loading={loading}
        />
      ))}
    </div>
  );
}
