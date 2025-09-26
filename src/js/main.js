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
