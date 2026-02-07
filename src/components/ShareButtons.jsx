export default function ShareButtons({ url, title }) {
  // Use the article title to create a more descriptive message for sharing.
  const text = title ? `${title} 

${url}` : url;

  return (
    <div className="share-buttons">
      <h4>Share this article</h4>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer">Facebook</a>
      <a href={`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(title || '')}`} target="_blank" rel="noreferrer">Twitter</a>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  );
}
