// === Offline Indicator Icon ===
function updateOfflineIcon() {
	let icon = document.getElementById('offlineIndicator');
	if (!icon) {
		icon = document.createElement('span');
		icon.id = 'offlineIndicator';
		icon.title = 'Offline';
		icon.style.display = 'none';
		icon.style.position = 'absolute';
		icon.style.right = '18px';
		icon.style.top = '18px';
		icon.style.width = '18px';
		icon.style.height = '18px';
		icon.style.borderRadius = '50%';
		icon.style.background = '#f44336';
		icon.style.boxShadow = '0 0 8px #f44336';
		icon.style.zIndex = '10003';
		document.body.appendChild(icon);
	}
	if (!navigator.onLine) {
		icon.style.display = 'block';
	} else {
		icon.style.display = 'none';
	}
}
window.addEventListener('offline', updateOfflineIcon);
window.addEventListener('online', updateOfflineIcon);
window.addEventListener('DOMContentLoaded', updateOfflineIcon);
// === Offline Notification ===
function showOfflineNotification() {
	let notif = document.getElementById('offlineNotification');
	if (!notif) {
		notif = document.createElement('div');
		notif.id = 'offlineNotification';
		notif.textContent = 'You are offline. Some features may be unavailable.';
		notif.style.position = 'fixed';
		notif.style.top = '0';
		notif.style.left = '0';
		notif.style.width = '100vw';
		notif.style.background = '#f44336';
		notif.style.color = '#fff';
		notif.style.textAlign = 'center';
		notif.style.padding = '14px 0';
		notif.style.zIndex = '10002';
		notif.style.fontSize = '1.1em';
		notif.style.fontWeight = 'bold';
		notif.style.display = 'none';
		document.body.appendChild(notif);
	}
	notif.style.display = 'block';
}
function hideOfflineNotification() {
	const notif = document.getElementById('offlineNotification');
	if (notif) notif.style.display = 'none';
}
window.addEventListener('offline', showOfflineNotification);
window.addEventListener('online', hideOfflineNotification);
// Show on load if already offline
if (!navigator.onLine) showOfflineNotification();
// Main JS entry point for Zawadi Intel app.

// Service Worker Registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('js/service-worker.js')
			.then(reg => console.log('Service Worker registered:', reg.scope))
			.catch(err => console.error('Service Worker registration failed:', err));
	});
}

// Dark Mode Toggle
function toggleDarkMode() {
	document.body.classList.toggle('dark-mode');
	localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}
window.addEventListener('DOMContentLoaded', function() {
	if (localStorage.getItem('darkMode') === 'true') {
		document.body.classList.add('dark-mode');
	}
});

// Global Escape Key to Close Modals
document.addEventListener('keydown', function(e) {
	if (e.key === 'Escape') {
		document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
	}
});
