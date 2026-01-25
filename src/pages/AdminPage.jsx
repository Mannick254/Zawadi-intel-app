import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // make sure you created supabaseClient.js

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Check session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  // Fetch all articles
  useEffect(() => {
    if (user?.user_metadata?.role === 'admin') {
      fetchArticles();
    }
  }, [user]);

  const fetchArticles = async () => {
    const res = await fetch('/api/articles');
    const data = await res.json();
    if (data.ok) {
      setArticles(data.data);
    } else {
      alert(`Error fetching articles: ${data.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const res = await fetch(`/api/articles?id=${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Article updated: ${data.data.title}`);
        setEditingId(null);
        setTitle('');
        setContent('');
        fetchArticles();
      } else {
        alert(`Error updating: ${data.message}`);
      }
    } else {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.ok) {
        alert(`Article created: ${data.data.title}`);
        setTitle('');
        setContent('');
        fetchArticles();
      } else {
        alert(`Error creating: ${data.message}`);
      }
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    const res = await fetch(`/api/articles?id=${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      alert('Article deleted');
      fetchArticles();
    } else {
      const data = await res.json();
      alert(`Error deleting: ${data.message}`);
    }
  };

  // ✅ Protect the page
  if (!user) {
    return <p>You must log in to access admin. <a href="/login">Go to Login</a></p>;
  }

  if (user?.user_metadata?.role !== 'admin') {
    return <p>Access denied</p>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Article Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">{editingId ? 'Update Article' : 'Publish Article'}</button>
      </form>

      <h2>Existing Articles</h2>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong> — {article.content.slice(0, 50)}...
            <button onClick={() => handleEdit(article)}>Edit</button>
            <button onClick={() => handleDelete(article.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
