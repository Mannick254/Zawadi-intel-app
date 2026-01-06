// public/js/main.js

/**
 * Calls the /api/health endpoint and returns true if the server is healthy.
 */
async function checkServerStatus() {
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

    return data.ok === true;
  } catch (error) {
    console.error("Error checking server status:", error);
    return false;
  }
}

/**
 * Checks the server status and displays a message to the user.
 */
async function checkServerAndDisplayStatus() {
  const serverStatus = await checkServerStatus();
  const statusElement = document.getElementById('server-status');

  if (statusElement) {
    if (serverStatus) {
      statusElement.textContent = 'Server is online';
      statusElement.style.color = 'green';
    } else {
      statusElement.textContent = 'Server is offline';
      statusElement.style.color = 'red';
    }
  }
}

// Check the server status every 30 seconds
setInterval(checkServerAndDisplayStatus, 30000);

// Initial check
checkServerAndDisplayStatus();
