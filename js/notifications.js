
(function() {
  const applicationServerKey = "BOA0NjzLhlXvX05nWd0Q7MrDE3A8zSvUGKH-aQ0_cejhmWI7BRCdUFALsckKWHCol11QVhcifANZwvOSNdnnmNI";

  function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function subscribeUser(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(applicationServerKey)
    })
    .then(function(subscription) {
      console.log("User is subscribed.");

      // Send subscription to your backend
      fetch("/save-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to save subscription on server");
        }
        console.log("Subscription sent to backend.");
      })
      .catch(err => console.error("Backend error:", err));
    })
    .catch(function(err) {
      console.error("Failed to subscribe the user:", err);
    });
  }

  function init() {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.log("Service Worker and Push are supported");

      navigator.serviceWorker.register("/service-worker.js")
      .then(function(swReg) {
        console.log("Service Worker is registered", swReg);

        const button = document.getElementById("enable-notifications");
        if (button) {
          button.addEventListener("click", function() {
            Notification.requestPermission().then(function(permission) {
              if (permission === "granted") {
                console.log("Notification permission granted.");
                subscribeUser(swReg);
              }
            });
          });
        }
      })
      .catch(function(error) {
        console.error("Service Worker Error", error);
      });
    } else {
      console.warn("Push messaging is not supported");
      const button = document.getElementById("enable-notifications");
      if (button) {
        button.style.display = "none";
      }
    }
  }

  init();
})();
