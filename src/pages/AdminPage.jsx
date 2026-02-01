import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import styles from "./AdminPage.module.css";
import ArticleForm from "../components/ArticleForm";
import ArticleList from "../components/ArticleList";
import TrendingArticles from "../components/TrendingArticles";
import Preview from "../components/Preview";

const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [section, setSection] = useState("news");
  const [category, setCategory] = useState("global");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [trending, setTrending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [injectImageUrl, setInjectImageUrl] = useState("");
  const [injectImageCaption, setInjectImageCaption] = useState("");
  const [injectSubtitle, setInjectSubtitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (section !== "news") setCategory("");
  }, [section]);

  useEffect(() => {
    if (user?.user_metadata?.role === "admin") {
      fetchItems();
    }
  }, [user, section, category]);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
    query = query.eq("section", section);
    if (section === "news" && category) query = query.eq("category", category);

    const { data, error } = await query;
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else setItems(data);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle || "");
    setContent(item.content);
    setImageUrl(item.image_url || "");
    setCategory(item.category || "");
    setSection(item.section);
    setBadge(item.badge || "");
    setTrending(item.trending || false);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setImageUrl("");
    setCategory("global");
    setSection("news");
    setBadge("");
    setTrending(false);
    setInjectImageUrl("");
    setInjectImageCaption("");
    setInjectSubtitle("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) alert(`Error deleting: ${error.message}`);
    else {
      alert("Article deleted");
      fetchItems();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      window.location.href = "/login";
    }
  };

  const handleInjectSubtitle = () => {
    if (injectSubtitle) {
      const subtitleHtml = `<div class="body-subtitle">${injectSubtitle}</div>`;
      const { current: textarea } = contentRef;
      if (textarea) {
        const { selectionStart, selectionEnd, value } = textarea;
        const newContent =
          value.substring(0, selectionStart) +
          subtitleHtml +
          value.substring(selectionEnd);
        setContent(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + subtitleHtml.length;
          textarea.focus();
        }, 0);
      } else {
        setContent((prev) => `${prev}${subtitleHtml}`);
      }
      setInjectSubtitle("");
    }
  };

  const handleInjectImage = () => {
    if (injectImageUrl) {
      let html = `<img src="${injectImageUrl}" alt="injected image" />`;
      if (injectImageCaption) {
        html = `<figure><img src="${injectImageUrl}" alt="injected image" /><figcaption class="injected-caption">${injectImageCaption}</figcaption></figure>`;
      }
      setContent((prev) => `${prev}${html}`);
      setInjectImageUrl("");
      setInjectImageCaption("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("Title and content are required.");
    setLoading(true);

    const slug = slugify(title);
    const payload = {
      title,
      subtitle,
      content,
      image_url: imageUrl,
      category: section === "news" ? category : null,
      section,
      slug,
      badge,
      trending,
    };

    const checkSlug = await supabase.from("articles").select("id").eq("slug", slug);
    if (!editingId && checkSlug.data.length > 0) {
      setLoading(false);
      return alert("Slug already exists. Choose a different title.");
    }

    const action = editingId
      ? supabase.from("articles").update(payload).eq("id", editingId).select().single()
      : supabase.from("articles").insert(payload).select().single();

    const { data, error } = await action;
    setLoading(false);
    if (error) alert(`Error: ${error.message}`);
    else {
      alert(`Article ${editingId ? "updated" : "created"}: ${data.title}`);
      resetForm();
      fetchItems();
    }
  };

  if (!user) return <p>You must log in to access admin. <a href="/login">Go to Login</a></p>;
  if (user?.user_metadata?.role !== "admin") return <p>Access denied</p>;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <ArticleForm
        handleSubmit={handleSubmit}
        editingId={editingId}
        title={title}
        setTitle={setTitle}
        subtitle={subtitle}
        setSubtitle={setSubtitle}
        content={content}
        setContent={setContent}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        section={section}
        setSection={setSection}
        category={category}
        setCategory={setCategory}
        badge={badge}
        setBadge={setBadge}
        trending={trending}
        setTrending={setTrending}
        injectSubtitle={injectSubtitle}
        setInjectSubtitle={setInjectSubtitle}
        handleInjectSubtitle={handleInjectSubtitle}
        injectImageUrl={injectImageUrl}
        setInjectImageUrl={setInjectImageUrl}
        injectImageCaption={injectImageCaption}
        setInjectImageCaption={setInjectImageCaption}
        handleInjectImage={handleInjectImage}
        loading={loading}
        resetForm={resetForm}
        contentRef={contentRef}
      />

      <Preview
        title={title}
        subtitle={subtitle}
        content={content}
        imageUrl={imageUrl}
        section={section}
        category={category}
        badge={badge}
        trending={trending}
      />

      <h2>
        {section === "news"
          ? `News - ${category} Articles`
          : section === "feature"
          ? "Feature Stories"
          : "Kenya Updates"}
      </h2>

      {loading && <p>Loading articles...</p>}
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      <ArticleList
        items={items}
        section={section}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <TrendingArticles />
    </div>
  );
}
