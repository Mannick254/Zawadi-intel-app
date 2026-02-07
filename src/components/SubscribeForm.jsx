import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (user && email.includes("@")) {
      // Here you would typically send the email to your backend to be added to a mailing list.
      // For this example, we'll just simulate a successful subscription.
      setSubscribed(true);
    }
  };

  if (!user) {
    return (
      <div className="subscribe-form">
        <h4>Subscribe for updates</h4>
        <p>Please <a href="/login">log in</a> to subscribe.</p>
      </div>
    );
  }

  return (
    <div className="subscribe-form">
      <h4>Subscribe for updates</h4>
      {subscribed ? (
        <p>Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      )}
    </div>
  );
}
