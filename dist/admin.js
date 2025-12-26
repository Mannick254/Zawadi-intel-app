document.addEventListener('DOMContentLoaded', () => {
    const adminWarn = document.getElementById('admin-warn');
    const adminActions = document.getElementById('admin-actions');
    const adminLogin = document.getElementById('admin-login');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginMsg = document.getElementById('admin-login-msg');
  
    const totalServer = document.getElementById('total-server');
    const totalLocal = document.getElementById('total-local');
    const recentList = document.getElementById('recent-list');
  
    const refreshBtn = document.getElementById('refresh-stats');
    const clearLocalBtn = document.getElementById('clear-local');
    const exportRecentBtn = document.getElementById('export-recent');
  
    async function checkAdmin() {
      const user = await getCurrentUser(); // must be defined elsewhere
      if (user && user.isAdmin) {
        adminWarn.textContent = '';
        adminActions.classList.remove('hidden');
        adminLogin.classList.add('hidden');
        updateStats();
      } else {
        adminWarn.textContent = 'You must be an admin to view this page.';
        adminActions.classList.add('hidden');
        adminLogin.classList.remove('hidden');
      }
    }
  
    async function updateStats() {
      try {
        const resp = await fetch('/api/stats');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
  
        totalServer.textContent = data.totalLogins || 'N/A';
        totalLocal.textContent = localStorage.getItem('zawadi_global_count_v1') || '0';
  
        recentList.innerHTML = '';
        if (Array.isArray(data.recentLogins)) {
          data.recentLogins.forEach(login => {
            const li = document.createElement('li');
            li.textContent = `${login.username} at ${new Date(login.ts).toLocaleString()}`;
            recentList.appendChild(li);
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        totalServer.textContent = 'Error';
      }
    }
  
    // ✅ Handle login via form submission
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;
  
      try {
        const result = await loginUser(username, password); // must be defined elsewhere
        if (result.ok) {
          checkAdmin();
        } else {
          adminLoginMsg.textContent = result.message || 'Login failed';
        }
      } catch (err) {
        adminLoginMsg.textContent = 'Server error during login';
        console.error(err);
      }
    });
  
    refreshBtn.addEventListener('click', updateStats);
  
    clearLocalBtn.addEventListener('click', () => {
      localStorage.removeItem('zawadi_global_count_v1');
      totalLocal.textContent = '0';
    });
  
    exportRecentBtn.addEventListener('click', () => {
      let csvContent = 'data:text/csv;charset=utf-8,Username,Timestamp\n';
      const rows = Array.from(recentList.querySelectorAll('li')).map(li => {
        const [username, ts] = li.textContent.split(' at ');
        return [username, ts];
      });
      rows.forEach(rowArray => {
        csvContent += rowArray.join(',') + '\n';
      });
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.href = encodedUri;
      link.download = 'recent_logins.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  
    checkAdmin();
  });
  