
document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (user) {
    document.getElementById('username').textContent = user.username;
    document.getElementById('email').textContent = user.email;
    document.getElementById('profile-info').textContent = user.profile.bio;
  } else {
    window.location.href = '/login.html';
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutUser();
      window.location.href = '/login.html';
    });
  }
});
