async function loadHome() {
  const ngo = await fetch('/api/public/ngo').then((r) => r.json());
  const projects = await fetch('/api/public/projects').then((r) => r.json());

  document.getElementById('ngoDescription').textContent = ngo.description;

  const list = document.getElementById('projectsList');
  const select = document.getElementById('projectSelect');
  list.innerHTML = '';
  select.innerHTML = '';

  projects.forEach((p) => {
    const progress = Math.min(100, Math.round((p.montant_collecte / (p.budget || 1)) * 100));
    list.innerHTML += `
      <div class="col-md-6 col-lg-4 mb-3">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5>${p.titre}</h5>
            <p>${p.description || ''}</p>
            <div class="progress mb-2"><div class="progress-bar" style="width:${progress}%"></div></div>
            <small>${p.montant_collecte} / ${p.budget} USD</small>
          </div>
        </div>
      </div>`;
    select.innerHTML += `<option value="${p.id}">${p.titre}</option>`;
  });
}

document.getElementById('donationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  payload.anonyme = document.getElementById('anonymousCheck').checked;
  payload.montant = Number(payload.montant);
  payload.projet_id = Number(payload.projet_id);

  const response = await fetch('/api/public/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  const msg = document.getElementById('donationMessage');
  if (!response.ok) {
    msg.textContent = data.error || 'Erreur lors du don';
    msg.className = 'text-danger mt-2';
    return;
  }
  msg.textContent = `Merci ! Reçu généré: ${data.receipt}`;
  msg.className = 'text-success mt-2';
  e.target.reset();
  loadHome();
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

document.getElementById('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

loadHome();
