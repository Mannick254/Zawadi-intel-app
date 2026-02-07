import styles from "../pages/AdminPage.module.css";

// Helper for consistent state updates
const createChangeHandler = (setForm) => (e) => {
  const { name, value, type, checked } = e.target;
  setForm((prevForm) => ({
    ...prevForm,
    [name]: type === "checkbox" ? checked : value,
  }));
};

export default function ArticleForm({
  handleSubmit,
  editingId,
  form,
  setForm,
  loading,
  resetForm,
  contentRef,
  handleInjectSubtitle,
  handleInjectImage,
}) {
  const handleChange = createChangeHandler(setForm);

  return (
    <form onSubmit={handleSubmit} className={styles.articleForm} aria-live="polite">
      {/* Section & Category */}
      <fieldset>
        <legend>Section & Category</legend>
        <label>
          <span>Section:</span>
          <select
            name="section"
            value={form.section || "news"}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="news">News Columns</option>
            <option value="feature">Feature Stories</option>
            <option value="update">Kenya Update</option>
          </select>
        </label>

        {form.section === "news" && (
          <label>
            <span>Category:</span>
            <select
              name="category"
              value={form.category || "global"}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="global">Global</option>
              <option value="africa">Africa</option>
              <option value="local">Local</option>
            </select>
          </label>
        )}
      </fieldset>

      {/* Metadata */}
      <fieldset>
        <legend>Metadata</legend>
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={form.author || ""}
          onChange={handleChange}
          required
          aria-required="true"
          disabled={loading}
        />
        <input
          type="text"
          name="dateline"
          placeholder="Dateline (e.g., Nairobi, Kenya)"
          value={form.dateline || ""}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="date"
          name="publicationDate"
          value={form.publicationDate || ""}
          onChange={handleChange}
          disabled={loading}
        />
        <small className={styles.helper}>Use YYYY-MM-DD format</small>
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma-separated)"
          value={form.tags || ""}
          onChange={handleChange}
          disabled={loading}
        />
      </fieldset>

      {/* Badge */}
      <fieldset>
        <legend>Details</legend>
        <label>
          <span>Badge:</span>
          <select
            name="badge"
            value={form.badge || ""}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">None</option>
            <option value="politics">Politics</option>
            <option value="environment">Environment</option>
            <option value="business">Business</option>
            <option value="sports">Sports</option>
            <option value="health">Health</option>
            <option value="technology">Technology</option>
            <option value="culture">Culture</option>
            <option value="world">World</option>
          </select>
        </label>
      </fieldset>

      {/* Core Editorial Fields */}
      <fieldset>
        <legend>Content</legend>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title || ""}
          onChange={handleChange}
          required
          aria-required="true"
          disabled={loading}
        />
        <input
          type="text"
          name="subtitle"
          placeholder="Subtitle"
          value={form.subtitle || ""}
          onChange={handleChange}
          disabled={loading}
        />
        <textarea
          ref={contentRef}
          name="content"
          placeholder="Content (Markdown supported: ## for headings, ![alt](url) for images, etc.)"
          value={form.content || ""}
          onChange={handleChange}
          required
          aria-required="true"
          rows="15"
          disabled={loading}
        />
      </fieldset>

      {/* Multimedia */}
      <fieldset>
        <legend>Multimedia</legend>
        <input
          type="url"
          name="imageUrl"
          placeholder="Featured Image URL"
          value={form.imageUrl || ""}
          onChange={handleChange}
          disabled={loading}
        />
        <input
          type="url"
          name="videoUrl"
          placeholder="Video Embed URL"
          value={form.videoUrl || ""}
          onChange={handleChange}
          disabled={loading}
        />
      </fieldset>

      {/* Related Links */}
      <fieldset>
        <legend>Related Links</legend>
        <input
          type="text"
          name="relatedLinks"
          placeholder="Related Links (comma-separated URLs)"
          value={form.relatedLinks || ""}
          onChange={handleChange}
          disabled={loading}
        />
      </fieldset>

      {/* Trending Flag */}
      <label>
        <input
          type="checkbox"
          name="trending"
          checked={form.trending || false}
          onChange={handleChange}
          disabled={loading}
        />
        Mark as Trending
      </label>

      {/* Inject Tools */}
      <fieldset>
        <legend>Inject Tools</legend>
        <div className={styles.injectContainer}>
          <input
            type="text"
            name="injectSubtitle"
            placeholder="Subtitle to Inject"
            value={form.injectSubtitle || ""}
            onChange={handleChange}
            disabled={loading}
          />
          <button type="button" onClick={handleInjectSubtitle} disabled={loading}>
            Inject Subtitle (Markdown ##)
          </button>
        </div>

        <div className={styles.injectContainer}>
          <input
            type="url"
            name="injectImageUrl"
            placeholder="Image URL to Inject"
            value={form.injectImageUrl || ""}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="text"
            name="injectImageCaption"
            placeholder="Image Caption (optional)"
            value={form.injectImageCaption || ""}
            onChange={handleChange}
            disabled={loading}
          />
          <button type="button" onClick={handleInjectImage} disabled={loading}>
            Inject Image (Markdown ![alt](url "caption"))
          </button>
        </div>
      </fieldset>

      {/* Submit Controls */}
      <div className={styles.submitControls}>
        <button type="submit" disabled={loading}>
          {editingId ? "Update Article" : "Publish Article"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} disabled={loading}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}
