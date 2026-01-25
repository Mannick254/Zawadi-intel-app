// auto-refresh.js
// Forces a hard reload of the page every 60 seconds

(function() {
    const REFRESH_INTERVAL = 60000; // 60,000 ms = 60 seconds
  
    setInterval(() => {
      // true forces reload from the server, bypassing cache
      window.location.reload(true);
    }, REFRESH_INTERVAL);
  })();
  