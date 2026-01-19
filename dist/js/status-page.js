document.addEventListener('DOMContentLoaded', () => {
  const statusGrid = document.getElementById('status-grid');
  const lastUpdated = document.getElementById('last-updated');

  if (!statusGrid) return;

  // Render a single service card
  function renderServiceCard(name, service) {
    const statusClass = service.status || 'unknown';
    const message = service.message || 'No data available';
    return `
      <div class="status-card ${statusClass}">
        <h2>${name}</h2>
        <p>${message}</p>
        <p>Last checked: ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
  }

  async function checkStatus() {
    // Show loading state
    statusGrid.innerHTML = `<p>🔄 Checking status...</p>`;

    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.ok && data.services) {
        statusGrid.innerHTML = `
          ${renderServiceCard("API Service", data.services.api)}
          ${renderServiceCard("Database", data.services.db)}
          ${renderServiceCard("Push Notifications", data.services.notifications)}
        `;
        lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      } else {
        throw new Error("Invalid health data format");
      }
    } catch (error) {
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
    }
  }

  // Initial check
  checkStatus();

  // Auto-refresh every 60 seconds
  setInterval(checkStatus, 60000);
});
