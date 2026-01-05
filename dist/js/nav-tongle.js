// Mobile navigation toggle
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("nav-toggle");
    const navLinks = document.querySelector(".main-links");
  
    if (!toggleBtn || !navLinks) return;
  
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
  
      // Update accessibility state
      const expanded = navLinks.classList.contains("show") ? "true" : "false";
      toggleBtn.setAttribute("aria-expanded", expanded);
    });
  });
  