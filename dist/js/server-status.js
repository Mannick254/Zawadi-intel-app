// public/js/server-status.js

/**
 * Checks the server status by fetching a health check endpoint.
 * @returns {Promise<boolean>} - True if the server is online, false otherwise.
 */
async function checkServerStatus() {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}
