document.addEventListener("DOMContentLoaded", function() {
  const images = document.querySelectorAll('img');

  images.forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
  });
});
