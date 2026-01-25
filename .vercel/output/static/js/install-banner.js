document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('install-banner');
    const installBtn = document.getElementById('install-button');
    const closeBtn = document.getElementById('install-close');
    let deferredPrompt = null;
  
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      banner?.classList.remove('hidden');
    });
  
    installBtn?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      banner?.classList.add('hidden');
      // Optional: log choice.outcome ('accepted' or 'dismissed')
    });
  
    closeBtn?.addEventListener('click', () => {
      banner?.classList.add('hidden');
    });
  });
  