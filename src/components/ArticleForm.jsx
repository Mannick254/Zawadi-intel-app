import styles from "../pages/AdminPage.module.css";

export default function ArticleForm({
  handleSubmit,
  editingId,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  content,
  setContent,
  imageUrl,
  setImageUrl,
  section,
  setSection,
  category,
  setCategory,
  badge,
  setBadge,
  trending,
  setTrending,
  injectSubtitle,
  setInjectSubtitle,
  handleInjectSubtitle,
  injectImageUrl,
  setInjectImageUrl,
  injectImageCaption,
  setInjectImageCaption,
  handleInjectImage,
  author,
  setAuthor,
  dateline,
  setDateline,
  tags,
  setTags,
  videoUrl,
  setVideoUrl,
  relatedLinks,
  setRelatedLinks,
  publicationDate,
  setPublicationDate,
  loading,
  resetForm,
  contentRef
}) {
  return (
    <form onSubmit={handleSubmit} className={styles.articleForm}>
      
      {/* Section & Category */}
      <label>
        Section:
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="news">NewsColumns</option>
          <option value="feature">FeatureStories</option>
          <option value="update">KenyaUpdate</option>
        </select>
      </label>

      {section === "news" && (
        <label>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="global">Global</option>
            <option value="africa">Africa</option>
            <option value="local">Local</option>
          </select>
        </label>
      )}

      {/* Metadata */}
      <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
      <input type="text" placeholder="Dateline (e.g., Nairobi, Kenya)" value={dateline} onChange={(e) => setDateline(e.target.value)} />
      <input type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} />
      <input type="text" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />

      {/* Badge */}
      <label>
        Badge:
        <select value={badge} onChange={(e) => setBadge(e.target.value)}>
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

      {/* Core Editorial Fields */}
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="text" placeholder="Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      
      {/* Rich Content */}
      <textarea
        ref={contentRef}
        placeholder="Content (use subheadings, quotes, etc.)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows="15"
      />

      {/* Multimedia */}
      <input type="text" placeholder="Featured Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <input type="text" placeholder="Video Embed URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
      
      {/* Related Links */}
      <input
        type="text"
        placeholder="Related Links (comma-separated URLs)"
        value={relatedLinks}
        onChange={(e) => setRelatedLinks(e.target.value)}
      />

      {/* Trending Flag */}
      <label>
        <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} />
        Mark as Trending
      </label>

      {/* Inject Tools */}
      <div className={styles.injectContainer}>
        <input
          type="text"
          placeholder="Subtitle to Inject"
          value={injectSubtitle}
          onChange={(e) => setInjectSubtitle(e.target.value)}
        />
        <button type="button" onClick={handleInjectSubtitle}>Inject Subtitle</button>
      </div>

      <div className={styles.injectContainer}>
        <input
          type="text"
          placeholder="Image URL to Inject"
          value={injectImageUrl}
          onChange={(e) => setInjectImageUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image Caption (optional)"
          value={injectImageCaption}
          onChange={(e) => setInjectImageCaption(e.target.value)}
        />
        <button type="button" onClick={handleInjectImage}>Inject Image</button>
      </div>

      {/* Submit Controls */}
      <button type="submit" disabled={loading}>
        {editingId ? "Update" : "Publish"}
      </button>
      {editingId && (
        <button type="button" onClick={resetForm}>
          Cancel Edit
        </button>
      )}
    </form>
  );
}
