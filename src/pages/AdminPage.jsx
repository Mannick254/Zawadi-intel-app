import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./AdminPage.module.css";
import ArticleForm from "../components/ArticleForm";
import ArticleList from "../components/ArticleList";
import TrendingArticles from "../components/TrendingArticles";
import Preview from "../components/Preview";

const slugify = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const initialForm = {
  title: "",
  subtitle: "",
  content: "",
  imageUrl: "",
  category: "global",
  section: "news",
  badge: "",
  trending: false,
  injectImageUrl: "",
  injectImageCaption: "",
  injectSubtitle: "",
};

export default function AdminPage() {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const contentRef = useRef(null);
  const navigate = useNavigate();

  /* ===========================
     Banner Auto-dismiss
     =========================== */
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  /* ===========================
     Fetch Articles
     =========================== */
  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
      query = query.eq("section", form.section);
      if (form.section === "news" && form.category) query = query.eq("category", form.category);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      setItems(data || []);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(`Error fetching articles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [form.section, form.category]);

  /* ===========================
     Handlers
     =========================== */
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...form,
      title: item.title,
      subtitle: item.subtitle || "",
      content: item.content,
      imageUrl: item.image_url || "",
      category: item.category || "global",
      section: item.section,
      badge: item.badge || "",
      trending: item.trending || false,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setSuccessMsg("Article deleted successfully.");
      fetchItems();
    } catch (err) {
      setErrorMsg(`Error deleting article: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login", { replace: true });
  };

  const handleInjectSubtitle = () => {
    if (!form.injectSubtitle) return;
    const textarea = contentRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const newContent = `${form.content.slice(0, cursorPosition)}\n## ${form.injectSubtitle}\n${form.content.slice(cursorPosition)}`;

    setForm({ ...form, content: newContent, injectSubtitle: "" });
    textarea.focus();
  };

  const handleInjectImage = () => {
    if (!form.injectImageUrl) return;
    const textarea = contentRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const caption = form.injectImageCaption ? `"${form.injectImageCaption}"` : "";
    const markdownImage = `![${form.injectImageCaption || "image"}](${form.injectImageUrl} ${caption})\n`;

    const newContent = `${form.content.slice(0, cursorPosition)}\n${markdownImage}\n${form.content.slice(cursorPosition)}`;

    setForm({
      ...form,
      content: newContent,
      injectImageUrl: "",
      injectImageCaption: "",
    });
    textarea.focus();
  };

  /* ===========================
     Submit Handler (with mapping)
     =========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      return setErrorMsg("Title and content are required.");
    }

    setLoading(true);
    try {
      const slug = slugify(form.title);

      // Map camelCase → snake_case for Supabase
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        slug,
        section: form.section,
        category: form.section === "news" ? form.category : null,
        badge: form.badge,
        trending: form.trending,
        image_url: form.imageUrl,
        inject_image_url: form.injectImageUrl,
        inject_image_caption: form.injectImageCaption,
        inject_subtitle: form.injectSubtitle,
      };

      // Check for duplicate slug
      const { data: slugCheck } = await supabase.from("articles").select("id").eq("slug", slug);
      if (!editingId && slugCheck.length > 0) {
        throw new Error("Slug already exists. Choose a different title.");
      }

      const action = editingId
        ? supabase.from("articles").update(payload).eq("id", editingId).select().single()
        : supabase.from("articles").insert(payload).select().single();

      const { data, error } = await action;
      if (error) throw new Error(error.message);

      setSuccessMsg(`Article ${editingId ? "updated" : "created"}: ${data.title}`);
      resetForm();
      fetchItems();
    } catch (err) {
      setErrorMsg(`Error saving article: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     Render
     =========================== */
  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      <ArticleForm
        {...{
          form,
          setForm,
          editingId,
          handleSubmit,
          resetForm,
          contentRef,
          loading,
          handleInjectSubtitle,
          handleInjectImage,
        }}
      />
      <Preview {...form} />

      <section>
        <h2>
          {form.section === "news"
            ? `News - ${form.category} Articles`
            : form.section === "feature"
            ? "Feature Stories"
            : "Kenya Updates"}
        </h2>
        {loading ? (
          <p>Loading articles...</p>
        ) : (
          <ArticleList items={items} handleEdit={handleEdit} handleDelete={handleDelete} />
        )}
      </section>

      <aside>
        <TrendingArticles />
      </aside>
    </div>
  );
}
