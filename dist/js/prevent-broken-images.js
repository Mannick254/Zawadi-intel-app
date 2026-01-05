document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img");

  images.forEach(img => {
    img.addEventListener("error", () => {
      // Option 1: Hide the broken image
      // img.style.display = "none";

      // Option 2: Replace with a fallback placeholder
      img.src = "/icons/placeholder.png"; // ensure this file exists
      img.alt = "Image not available";
      img.classList.add("fallback-image");
    });
  });
});
