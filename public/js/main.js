// public/js/main.js

/**
 * Calls the /api/health endpoint and returns the parsed JSON object.
 */
async function fetchServerHealth() {
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
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
  } catch (error) {
    console.error("Error fetching server health:", error);
    return { ok: false, message: error.message };
  }
}

/**
 * Checks the server status and displays a message to the user.
 */
async function checkServerAndDisplayStatus() {
  const data = await fetchServerHealth();
  const statusElement = document.getElementById('server-status');

  if (!statusElement) return;

  if (data.ok) {
    statusElement.textContent = `✅ Server is online — ${data.message || "Healthy"}`;
    statusElement.style.color = 'green';
  } else {
    statusElement.textContent = `❌ Server is offline — ${data.message || "Unknown issue"}`;
    statusElement.style.color = 'red';
  }

  // Optional: show timestamp
  const timestamp = document.createElement('span');
  timestamp.className = 'status-timestamp';
  timestamp.textContent = ` (Last checked: ${new Date().toLocaleTimeString()})`;
  statusElement.appendChild(timestamp);
}

// Check the server status every 30 seconds
setInterval(checkServerAndDisplayStatus, 30000);

// Initial check
checkServerAndDisplayStatus();
