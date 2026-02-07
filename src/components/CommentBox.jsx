import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CommentBox({ articleId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("* ")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(data);
      }
      if (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ text, article_id: articleId }])
        .single();

      if (data) {
        setComments([data, ...comments]);
        setText("");
      } else {
        console.error("Error posting comment:", error);
      }
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
        {comments.map((c) => (
          <li key={c.id}>
            <p>{c.text}</p>
            <small>{new Date(c.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
