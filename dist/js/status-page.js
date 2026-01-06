document.addEventListener('DOMContentLoaded', () => {
  const statusGrid = document.getElementById('status-grid');
  const lastUpdated = document.getElementById('last-updated');

  if (!statusGrid) return;

  function renderServiceCard(name, service) {
    return `
      <div class="status-card ${service.status}">
        <h2>${name}</h2>
        <p>${service.message}</p>
        <p>Last checked: ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
  }

  function checkStatus() {
    // Show loading state
    statusGrid.innerHTML = `<p>🔄 Checking status...</p>`;

    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.services) {
          statusGrid.innerHTML = `
            ${renderServiceCard("API Service", data.services.api)}
            ${renderServiceCard("Database", data.services.db)}
            ${renderServiceCard("Push Notifications", data.services.notifications)}
          `;
          lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        } else {
          throw new Error("Invalid health data");
        }
      })
      .catch(error => {
        console.error("Error fetching server status:", error);
        statusGrid.innerHTML = `
          <div class="status-card offline">
            <h2>Server Status: Offline</h2>
            <p>Could not connect to the server. It may be down for maintenance.</p>
            <p>Error: ${error.message}</p>
            <p>Last checked: ${new Date().toLocaleTimeString()}</p>
          </div>
        `;
        lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      });
  }

  // Initial check
  checkStatus();

  // Auto-refresh every 60 seconds
  setInterval(checkStatus, 60000);
});
