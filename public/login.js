document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  const msg = document.getElementById('loginMessage');

  if (!res.ok) {
    msg.textContent = data.error || 'Échec de connexion';
    msg.className = 'text-danger';
    return;
  }

  msg.textContent = `Bienvenue ${data.user.username}`;
  msg.className = 'text-success';
  setTimeout(() => (window.location.href = '/admin.html'), 500);
});
