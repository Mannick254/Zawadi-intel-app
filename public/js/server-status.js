document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('server-status');
  if (!statusEl) return;

  fetch('/api/health')
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Read as text first to guard against HTML error pages
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }
      return data;
    })
    .then(data => {
      if (data.ok) {
        statusEl.textContent = `Server Status: Online — ${data.message}`;
        statusEl.style.color = 'green';
      } else {
        statusEl.textContent = 'Server Status: Offline';
        statusEl.style.color = 'red';
      }
    })
    .catch(error => {
      console.error('Error fetching server status:', error);
      statusEl.textContent = `Server Status: Offline — ${error.message}`;
      statusEl.style.color = 'red';
    });
});
