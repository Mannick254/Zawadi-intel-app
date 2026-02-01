import { useState } from "react";

export default function CommentBox() {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setComments([...comments, { text, date: new Date().toLocaleString() }]);
      setText("");
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your comment..."
        />
        <button type="submit">Post</button>
      </form>
      <ul>
        {comments.map((c, idx) => (
          <li key={idx}>
            <p>{c.text}</p>
            <small>{c.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
