import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './OpinionSection.css';


const OpinionSection = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchOpinions = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('section', 'opinion')
        .order('publication_date', { ascending: false });

      if (error) {
        console.error('Error fetching opinion articles:', error);
      } else {
        setArticles(data);
      }
    };

    fetchOpinions();
  }, []);

  return (
    <section className="opinion-section">
      <h2 className="opinion-title">Opinion</h2>
      <div className="opinion-grid">
        {articles.map(article => (
          <div key={article.id} className="opinion-card">
            <img src={article.image_url} alt={article.title} />
            <div className="opinion-card-content">
              <h3><a href={`/articles/${article.slug}`}>{article.title}</a></h3>
              <p>{article.subtitle}</p>
              <small>By {article.author} on {new Date(article.publication_date).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OpinionSection;
