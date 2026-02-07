import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "../components/TrendingSidebar.css";

export default function Trending() {
  const [trending, setTrending] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, image_url, category, created_at")
        .eq("trending", true)
        .order("created_at", { ascending: false })
        .limit(6); // show top 6 trending like Al Jazeera

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
      <h2 className="trending-heading">Trending</h2>
      {trending.length === 0 && <p>No trending articles yet.</p>}
      <ul className="trending-list">
        {trending.map((item) => (
          <li key={item.id} className="trending-item">
            <Link to={`/articles/${item.slug}`} className="trending-link">
              {item.image_url && (
                <div className="thumb-wrapper">
                  <img
                    src={item.image_url}
                    alt={item.title || "Trending article image"}
                    loading="lazy"
                    className="trending-thumb"
                  />
                </div>
              )}
              <div className="trending-info">
                <span className="category">{item.category}</span>
                <h3 className="trending-title">{item.title}</h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
