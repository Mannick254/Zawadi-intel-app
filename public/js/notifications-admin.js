document.addEventListener("DOMContentLoaded", () => {
  const pushForm = document.getElementById("push-form");
  const pushFeedback = document.getElementById("push-feedback");
  const sendPushBtn = document.getElementById("send-push-btn");

  if (!pushForm) return;

  pushForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("push-title")?.value.trim();
    const message = document.getElementById("push-message")?.value.trim();
    const url = document.getElementById("push-url")?.value.trim();

    if (!title || !message) {
      pushFeedback.textContent = "⚠️ Title and message are required.";
      pushFeedback.style.color = "red";
      return;
    }

    sendPushBtn.disabled = true;
    pushFeedback.textContent = "⏳ Sending notification...";
    pushFeedback.style.color = "black";

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include authorization token if required by the server
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: JSON.stringify({ title, body: message, url }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (response.ok && result.success) {
        pushFeedback.textContent = `✅ Notification sent to ${result.count || 0} subscribers.`;
        pushFeedback.style.color = "green";
        pushForm.reset();
      } else {
        pushFeedback.textContent = `❌ Error: ${result.message || "Failed to send notification."}`;
        pushFeedback.style.color = "red";
      }
    } catch (error) {
      console.error("Push notification error:", error);
      pushFeedback.textContent = "❌ An unexpected error occurred.";
      pushFeedback.style.color = "red";
    } finally {
      sendPushBtn.disabled = false;
    }
  });
});
