// scripts/main.js

// Toggle dropdown menus (e.g. Home ▾)
document.querySelectorAll('.home-btn').forEach(button => {
  button.addEventListener('click', () => {
    const dropdown = button.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });
});

// Basic search bar functionality (logs query)
const searchForm = document.querySelector('.search-bar');
if (searchForm) {
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = this.querySelector('input').value.trim();
    if (query) {
      console.log(`Searching for: ${query}`);
      // Future: Redirect to search results or filter archive
    }
  });
}

// Optional: Mobile nav toggle (if added later)
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.querySelector('.main-links').classList.toggle('open');
  });
}
