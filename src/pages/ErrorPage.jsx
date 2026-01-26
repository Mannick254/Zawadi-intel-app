import React from "react";

export default function ErrorPage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>❌ Page not found</h1>
      <p>We couldn’t find what you were looking for.</p>
      <a href="/">Go back home</a>
    </div>
  );
}
