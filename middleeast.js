document.addEventListener("DOMContentLoaded", () => {
  // 🔁 Shuffle conflict stories for dynamic layout
  shuffleStories("middle-east");

  // 🕹️ Toggle visibility for each region (optional buttons)
  const toggles = document.querySelectorAll("[data-toggle]");
  toggles.forEach(button => {
    button.addEventListener("click", () => {
      const targetClass = button.getAttribute("data-toggle");
      toggleRegion(targetClass);
    });
  });
});

// 🔀 Shuffle utility for story sections
function shuffleStories(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const stories = Array.from(container.querySelectorAll(".conflict-zone"));
  stories.sort(() => Math.random() - 0.5);

  container.innerHTML = "";
  stories.forEach(story => container.appendChild(story));
}

// 🔦 Toggle visibility of a region's stories using CSS class
function toggleRegion(className) {
  const sections = document.querySelectorAll(`.${className}`);
  sections.forEach(section => {
    section.classList.toggle("hidden");
  });
}
