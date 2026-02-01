import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from '../pages/AdminPage.module.css';

export default function TrendingArticles() {
  const [trendingArticles, setTrendingArticles] = useState([]);

  useEffect(() => {
    fetchTrendingArticles();
  }, []);

  const fetchTrendingArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('trending', true)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching trending:', error);
    else setTrendingArticles(data);
  };

  return (
    <div className={styles.trendingContainer}>
      <h2>Trending Articles</h2>
      {trendingArticles.length === 0 && <p>No trending articles yet.</p>}
      {trendingArticles.map((article) => (
        <article key={article.id} className={styles.trendingCard}>
          {article.image_url && <img src={article.image_url} alt={article.title} width="150" />}
          <h3>{article.title}</h3>
          {article.subtitle && <h4 className={styles.subtitle} dangerouslySetInnerHTML={{ __html: article.subtitle }} />}
          <div dangerouslySetInnerHTML={{ __html: article.content.slice(0, 100) }} />
          <div className={styles.meta}>
            <span className={styles.badge}>{article.section}</span>
            {article.badge && <span className={`${styles.badge} ${styles[article.badge]}`}>{article.badge}</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
