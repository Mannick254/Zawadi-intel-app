document.addEventListener('DOMContentLoaded', () => {
  const statusGrid = document.getElementById('status-grid');
  const incidentList = document.getElementById('incident-list');
  const lastUpdated = document.getElementById('last-updated');

  function renderServiceCard(name, service) {
    const statusClass = service.status || 'offline';
    return `
      <div class="status-card ${statusClass}">
        <h2>${name}</h2>
        <p>${service.message || 'No status message available'}</p>
        <p>Last checked: ${new Date().toLocaleTimeString()}</p>
      </div>
    `;
  }

  function renderIncident(incident) {
    return `<li>${incident.date} — ${incident.description}</li>`;
  }

  async function checkStatus() {
    statusGrid.innerHTML = `<p>🔄 Checking status...</p>`;
    incidentList.innerHTML = '';

    try {
      const res = await fetch('/api/health');
      const data = await res.json();

      if (data.ok) {
        // Services
        statusGrid.innerHTML = Object.entries(data.services)
          .map(([name, service]) => renderServiceCard(name, service))
          .join('');

        // Incidents
        if (data.incidents && data.incidents.length > 0) {
          incidentList.innerHTML = data.incidents
            .map(renderIncident)
            .join('');
        } else {
          incidentList.innerHTML = `<li>No recent incidents</li>`;
        }

        lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
      } else {
        throw new Error("Invalid health data");
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
      incidentList.innerHTML = `<li>Unable to fetch incident history</li>`;
      lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
  }

  // Initial check
  checkStatus();

  // Auto-refresh every 60 seconds
  setInterval(checkStatus, 60000);
});
