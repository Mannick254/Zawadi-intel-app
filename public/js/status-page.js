document.addEventListener('DOMContentLoaded', () => {
  const statusContainer = document.getElementById('status-container');

  if (!statusContainer) return;

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
        statusContainer.innerHTML = `
          <div class="status-card online">
            <h2>Server Status: Online</h2>
            <p>${data.message}</p>
            <p>Last checked: ${new Date().toLocaleTimeString()}</p>
          </div>
        `;
      } else {
        throw new Error("Server reported an issue.");
      }
    })
    .catch(error => {
      console.error("Error fetching server status:", error);
      statusContainer.innerHTML = `
        <div class="status-card offline">
          <h2>Server Status: Offline</h2>
          <p>Could not connect to the server. It may be down for maintenance.</p>
          <p>Error: ${error.message}</p>
          <p>Last checked: ${new Date().toLocaleTimeString()}</p>
        </div>
      `;
    });
});
