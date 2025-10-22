document.addEventListener("DOMContentLoaded", () => {
  // 🔁 Auto-shuffle conflict zones (optional)
  shuffleSection("global-news");

  // 🕹️ Spotlight toggle (if you add a button later)
  const toggleButton = document.getElementById("toggleSpotlight");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      togglePulse("trending-movie");
    });
  }
});

// 🔀 Shuffle utility
function shuffleSection(sectionId) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  const items = Array.from(container.querySelectorAll(".conflict-zone, .trending-movie"));
  items.sort(() => Math.random() - 0.5);

  container.innerHTML = "";
  items.forEach(item => container.appendChild(item));
}

// 🔦 Toggle visibility of spotlight section
function togglePulse(sectionClass) {
  const spotlight = document.querySelector(`.${sectionClass}`);
  if (spotlight) {
    spotlight.style.display = spotlight.style.display === "none" ? "block" : "none";
  }
}
