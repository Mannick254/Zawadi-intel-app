document.addEventListener("DOMContentLoaded", () => {
  const pushForm = document.getElementById("push-form");
  const pushFeedback = document.getElementById("push-feedback");
  const sendPushBtn = document.getElementById("send-push-btn");

  if (pushForm) {
    pushForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const title = document.getElementById("push-title").value;
      const message = document.getElementById("push-message").value;
      const url = document.getElementById("push-url").value;

      if (!title || !message) {
        pushFeedback.textContent = "Title and message are required.";
        return;
      }

      sendPushBtn.disabled = true;
      pushFeedback.textContent = "Sending notification...";

      try {
        const response = await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authorization token if required by the server
            // "Authorization": `Bearer ${localStorage.getItem("admin-token")}`
          },
          body: JSON.stringify({ title, body: message, url }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          pushFeedback.textContent = `Successfully sent notification to ${result.count} subscribers.`;
          pushForm.reset();
        } else {
          pushFeedback.textContent = `Error: ${result.message || "Failed to send notification."}`;
        }
      } catch (error) {
        console.error("Push notification error:", error);
        pushFeedback.textContent = "An unexpected error occurred.";
      } finally {
        sendPushBtn.disabled = false;
      }
    });
  }
});
