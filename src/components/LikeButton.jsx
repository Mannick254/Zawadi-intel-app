import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function LikeButton({ articleId }) {
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("like_count")
        .eq("article_id", articleId)
        .single();

      if (data) {
        setLikes(data.like_count);
      } else if (error && error.code === "PGRST116") {
        // No row found, so create one
        const { data: newLike, error: insertError } = await supabase
          .from("likes")
          .insert({ article_id: articleId, like_count: 0 })
          .single();
        if (newLike) {
          setLikes(newLike.like_count);
        }
        if (insertError) {
          console.error("Error creating like entry:", insertError);
        }
      } else if (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [articleId]);

  const handleLike = async () => {
    const newLikes = likes + 1;
    setLikes(newLikes);

    const { error } = await supabase
      .from("likes")
      .update({ like_count: newLikes })
      .eq("article_id", articleId);

    if (error) {
      console.error("Error updating likes:", error);
      setLikes(likes); // Revert optimistic update on error
    }
  };

  return (
    <button className="like-button" onClick={handleLike}>
      👍 Like ({likes})
    </button>
  );
}
