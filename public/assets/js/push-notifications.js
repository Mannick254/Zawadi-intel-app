
const VAPID_PUBLIC_KEY = 'BNo-e7_NlK4ex7y_E-s_300nJ2s_d6iOAe_gJ4_x_l_I-l8_x_R_e-f_k_e_l_k_a_j_y_k_e_l_'; 

function urlBase64ToUint8Array(base64String) {
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

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            console.log('User is already subscribed.');
            return;
        }

        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        console.log('User is subscribed:', subscription);

        await fetch('/api/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Subscription sent to server.');
    } catch (error) {
        console.error('Failed to subscribe the user: ', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const subscribeButton = document.getElementById('subscribe-button');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', subscribeToPush);
    }
});
