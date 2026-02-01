import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "./TrendingSidebar.css"; // optional styling file

export default function TrendingSidebar() {
  const [trending, setTrending] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, image_url, badge, category")
        .eq("trending", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setError(error.message);
      } else {
        setTrending(data || []);
      }
    };
    fetchTrending();
  }, []);

  if (error) return <p className="error">Failed to load trending: {error}</p>;

  return (
    <aside className="trending-sidebar">
      <h2>Trending Now</h2>
      {trending.length === 0 && <p>No trending articles yet.</p>}
      <ul>
        {trending.map((item) => (
          <li key={item.id} className="trending-item">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="trending-thumb"
              />
            )}
            <div className="trending-info">
              <Link to={`/articles/${item.slug}`} className="trending-title">
                {item.title}
              </Link>
              {item.badge && <span className={`badge ${item.badge}`}>{item.badge}</span>}
              <span className="category">{item.category}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
