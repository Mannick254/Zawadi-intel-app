if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registered:', reg))
    .catch(err => console.log('Service Worker registration failed:', err));
}

document.getElementById('enable-notifications').addEventListener('click', () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    });
  }
});

let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installButton = document.getElementById('install-now');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.style.display = 'block';
  installButton.style.display = 'block';
});

installButton.addEventListener('click', (e) => {
  installBanner.style.display = 'none';
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    deferredPrompt = null;
  });
});

function padZero(num) {
  return num < 10 ? "0" + num : num;
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const clockEl = document.getElementById("clock");
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }
}

function updateCalendar() {
  const calendarEl = document.getElementById("calendar-widget");
  if (!calendarEl) return;

  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  const weekday = dayNames[now.getDay()];
  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  calendarEl.textContent = `${weekday}, ${day} ${month} ${year}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  updateCalendar();
  setInterval(updateClock, 1000); // refresh clock every second
});