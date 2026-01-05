
// public/js/main.js

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
