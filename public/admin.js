let chart;

async function api(path, options = {}) {
  const res = await fetch(path, options);
  if (res.status === 401) {
    window.location.href = '/login.html';
    return null;
  }
  return res;
}

async function loadDashboard() {
  const statsRes = await api('/api/admin/stats');
  if (!statsRes) return;
  const stats = await statsRes.json();

  document.getElementById('totalDons').textContent = `${stats.totalDons} USD`;
  document.getElementById('totalBenef').textContent = stats.beneficiaires;
  document.getElementById('totalProjects').textContent = stats.projetsActifs;

  const projects = await (await api('/api/admin/projects')).json();
  const benefs = await (await api('/api/admin/beneficiaires')).json();
  const dons = await (await api('/api/admin/donations')).json();

  renderProjects(projects);
  renderBeneficiaries(benefs, projects);
  renderDonations(dons);
  renderChart(stats, dons);
}

function renderChart(stats, dons) {
  const monthly = {};
  dons.forEach((d) => {
    const key = new Date(d.date).toISOString().slice(0, 7);
    monthly[key] = (monthly[key] || 0) + d.montant;
  });
  const labels = Object.keys(monthly).sort();
  const values = labels.map((k) => monthly[k]);

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('impactChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Dons mensuels (USD)', data: values, borderColor: '#0d6efd' }]
    }
  });
}

function renderProjects(projects) {
  const list = document.getElementById('projectsAdminList');
  const select = document.getElementById('benefProjectSelect');
  list.innerHTML = '';
  select.innerHTML = projects.map((p) => `<option value="${p.id}">${p.titre}</option>`).join('');

  projects.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    li.innerHTML = `<div><b>${p.titre}</b><br><small>${p.budget} USD</small></div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-secondary" data-edit="${p.id}">Modifier</button>
        <button class="btn btn-sm btn-outline-danger" data-delete="${p.id}">Supprimer</button>
      </div>`;
    list.appendChild(li);
  });

  list.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.onclick = () => {
      const p = projects.find((x) => x.id === Number(btn.dataset.edit));
      const f = document.getElementById('projectForm');
      f.id.value = p.id;
      f.titre.value = p.titre;
      f.description.value = p.description;
      f.budget.value = p.budget;
      f.date_debut.value = p.date_debut || '';
      f.date_fin.value = p.date_fin || '';
      f.actif.checked = Boolean(p.actif);
    };
  });

  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.onclick = async () => {
      await api(`/api/admin/projects/${btn.dataset.delete}`, { method: 'DELETE' });
      loadDashboard();
    };
  });
}

function renderBeneficiaries(items) {
  const list = document.getElementById('benefList');
  list.innerHTML = items
    .map(
      (b) =>
        `<li class="list-group-item d-flex justify-content-between"><span>${b.nom} (${b.age || '-'} ans) - ${b.localite || '-'}</span><small>${b.projet || 'N/A'}</small></li>`
    )
    .join('');
}

function renderDonations(items) {
  const tbody = document.getElementById('donTable');
  tbody.innerHTML = items
    .map(
      (d) => `<tr><td>${new Date(d.date).toLocaleDateString('fr-FR')}</td><td>${d.nom_donateur}</td><td>${d.projet || '-'}</td><td>${d.montant} USD</td></tr>`
    )
    .join('');
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const payload = {
    titre: form.titre.value,
    description: form.description.value,
    budget: Number(form.budget.value || 0),
    date_debut: form.date_debut.value,
    date_fin: form.date_fin.value,
    actif: form.actif.checked
  };

  if (form.id.value) {
    await api(`/api/admin/projects/${form.id.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await api('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  form.reset();
  loadDashboard();
});

document.getElementById('benefForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  payload.age = Number(payload.age || 0);
  payload.projet_id = Number(payload.projet_id);
  await api('/api/admin/beneficiaires', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  e.target.reset();
  loadDashboard();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
});

document.getElementById('downloadReport').addEventListener('click', () => {
  window.open('/api/admin/report.pdf', '_blank');
});

loadDashboard();
