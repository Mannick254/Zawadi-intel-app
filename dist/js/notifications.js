(function () {
  // --- Your PUBLIC VAPID KEY ---
  const applicationServerKey = "BOA0NjzLhlXvX05nWd0Q7MrDE3A8zSvUGKH-aQ0_cejhmWI7BRCdUFALsckKWHCol11QVhcifANZwvOSNdnnmNI";

  // --- Utility: Convert base64 to Uint8Array ---
  function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // --- Subscribe user and send subscription to backend ---
  async function subscribeUser(swReg) {
    try {
      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(applicationServerKey),
      });

      console.log("User subscribed:", subscription);

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error(`Failed to save subscription: ${res.status}`);
      console.log("Subscription saved on backend.");
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Unable to subscribe for notifications. Please try again later.");
    }
  }

  // --- Initialize service worker and button ---
  function init() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.log("Service Worker and Push supported");

      navigator.serviceWorker.register("/service-worker.js")
        .then(swReg => {
          console.log("Service Worker registered:", swReg);

          const button = document.getElementById("enable-notifications");
          if (button) {
            button.addEventListener("click", async () => {
              try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                  console.log("Notification permission granted.");
                  subscribeUser(swReg);
                } else {
                  console.warn("Notification permission denied.");
                }
              } catch (err) {
                console.error("Permission request failed:", err);
              }
            });
          }
        })
        .catch(error => console.error("Service Worker registration failed:", error));
    } else {
      console.warn("Push messaging not supported.");
      const button = document.getElementById("enable-notifications");
      if (button) button.style.display = "none";
    }
  }

  init();
})();
