import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubscribed(true);
    }
  };

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
          />
          <button type="submit">Subscribe</button>
        </form>
      )}
    </div>
  );
}
