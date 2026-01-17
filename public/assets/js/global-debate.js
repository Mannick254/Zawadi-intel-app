// Example using NewsAPI (replace YOUR_API_KEY)
async function loadNews() {
  try {
    const res = await fetch("https:/newsapi.org/v2/top-headlines?language=en&pageSize=30&apiKey=YOUR_API_KEY");
    const data = await res.json();
    const ticker = document.getElementById("newsTicker");

    if (data.articles) {
      data.articles.forEach(article => {
        const li = document.createElement("li");
        li.textContent = `🌍 ${article.source.name}: ${article.title}`;
        ticker.appendChild(li);
      });
    } else {
      // Fallback if API fails
      const li = document.createElement("li");
      li.textContent = "🌍 News unavailable at the moment.";
      ticker.appendChild(li);
    }
  } catch (error) {
    console.error("Error loading news:", error);
    const ticker = document.getElementById("newsTicker");
    const li = document.createElement("li");
    li.textContent = "🌍 News unavailable at the moment.";
    ticker.appendChild(li);
  }
}

// Run on page load
loadNews();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.log("Service Worker registration failed:", err));
}

document.getElementById("enable-notifications").addEventListener("click", () => {
  if ("Notification" in window && "serviceWorker" in navigator) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission denied.");
      }
    });
  }
});
