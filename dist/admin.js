document.addEventListener('DOMContentLoaded', () => {
    const adminWarn = document.getElementById('admin-warn');
    const adminActions = document.getElementById('admin-actions');
    const adminLogin = document.getElementById('admin-login');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminLoginMsg = document.getElementById('admin-login-msg');

    const totalServer = document.getElementById('total-server');
    const totalLocal = document.getElementById('total-local');
    const recentList = document.getElementById('recent-list');

    const refreshBtn = document.getElementById('refresh-stats');
    const clearLocalBtn = document.getElementById('clear-local');
    const exportRecentBtn = document.getElementById('export-recent');

    async function checkAdmin() {
        const user = await getCurrentUser();
        if (user && user.isAdmin) {
            adminWarn.textContent = '';
            adminActions.style.display = 'block';
            adminLogin.style.display = 'none';
            updateStats();
        } else {
            adminWarn.textContent = 'You must be an admin to view this page.';
            adminActions.style.display = 'none';
            adminLogin.style.display = 'block';
        }
    }

    async function updateStats() {
        try {
            const resp = await fetch('/api/stats');
            const data = await resp.json();

            if (data) {
                totalServer.textContent = data.totalLogins || 'N/A';
                totalLocal.textContent = localStorage.getItem('zawadi_global_count_v1') || '0';

                recentList.innerHTML = '';
                if (data.recentLogins && data.recentLogins.length) {
                    data.recentLogins.forEach(login => {
                        const li = document.createElement('li');
                        li.textContent = `${login.username} at ${new Date(login.ts).toLocaleString()}`;
                        recentList.appendChild(li);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }

    adminLoginBtn.addEventListener('click', async () => {
        const username = adminUsernameInput.value;
        const password = adminPasswordInput.value;
        const result = await loginUser(username, password);

        if (result.ok) {
            checkAdmin();
        } else {
            adminLoginMsg.textContent = result.message || 'Login failed';
        }
    });

    refreshBtn.addEventListener('click', updateStats);

    clearLocalBtn.addEventListener('click', () => {
        localStorage.removeItem('zawadi_global_count_v1');
        totalLocal.textContent = '0';
    });

    exportRecentBtn.addEventListener('click', () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Username,Timestamp\n';

        const rows = Array.from(recentList.querySelectorAll('li')).map(li => {
            const [username, ts] = li.textContent.split(' at ');
            return [username, ts];
        });

        rows.forEach(rowArray => {
            const row = rowArray.join(',');
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'recent_logins.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    checkAdmin();
});
