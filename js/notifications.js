
(function() {
  const applicationServerKey = "YOUR_PUBLIC_KEY"; // Replace with your VAPID public key

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

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
      console.log('User is subscribed.');

      // Send subscription to the backend
      fetch('https://localhost:3000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
    });
  }

  function init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('/service-worker.js')
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        let swRegistration = swReg;
        const button = document.getElementById('enable-notifications');
        if (button) {
            button.addEventListener('click', function() {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        console.log('Notification permission granted.');
                        subscribeUser(swRegistration);
                    }
                });
            });
        }
      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    } else {
      console.warn('Push messaging is not supported');
      const button = document.getElementById('enable-notifications');
      if (button) {
        button.style.display = 'none';
      }
    }
  }

  init();
})();
