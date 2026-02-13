let chart;

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${localStorage.getItem('token') || ''}`, ...extra };
}

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: authHeaders(options.headers || {}) });
  if (res.status === 401) {
    localStorage.removeItem('token');
    location.href = '/login.html';
async function api(path, options = {}) {
  const res = await fetch(path, options);
  if (res.status === 401) {
    window.location.href = '/login.html';
    return null;
  }
  return res;
}

async function loadDashboard() {
  const stats = await (await api('/api/admin/stats')).json();
  const projects = await (await api('/api/admin/projects')).json();
  const donations = await (await api('/api/admin/donations')).json();
  const beneficiaries = await (await api('/api/admin/beneficiaries')).json();
  const statsRes = await api('/api/admin/stats');
  if (!statsRes) return;
  const stats = await statsRes.json();

  document.getElementById('totalDons').textContent = `${stats.totalDons} USD`;
  document.getElementById('totalBenef').textContent = stats.beneficiaires;
  document.getElementById('totalProjects').textContent = stats.projetsActifs;

  renderProjects(projects);
  renderBeneficiaries(beneficiaries);
  renderDonations(donations);
  renderChart(donations);
}

function renderChart(dons) {
  const byMonth = {};
  dons.forEach((d) => {
    const key = new Date(d.createdAt).toISOString().slice(0, 7);
    byMonth[key] = (byMonth[key] || 0) + d.montant;
  });
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
      labels: Object.keys(byMonth),
      datasets: [{ label: 'Dons/mois', data: Object.values(byMonth), borderColor: '#2563eb' }]
      labels,
      datasets: [{ label: 'Dons mensuels (USD)', data: values, borderColor: '#0d6efd' }]
    }
  });
}

function renderProjects(projects) {
  document.getElementById('benefProjectSelect').innerHTML = projects.map((p) => `<option value="${p._id}">${p.titre}</option>`).join('');
  document.getElementById('projectsAdminList').innerHTML = projects
    .map((p) => `<li class="list-group-item d-flex justify-content-between align-items-center">
      <div class="d-flex gap-2 align-items-center">${p.imageUrl ? `<img class="project-thumb" src="${p.imageUrl}"/>` : ''}<span><b>${p.titre}</b><br><small>${p.budget} USD</small></span></div>
      <div><button class="btn btn-sm btn-outline-secondary" onclick='editProject(${JSON.stringify(p)})'>Éditer</button> <button class="btn btn-sm btn-outline-danger" onclick='deleteProject("${p._id}")'>Supprimer</button></div>
    </li>`)
    .join('');
}

function renderBeneficiaries(items) {
  document.getElementById('benefList').innerHTML = items
    .map((b) => `<li class="list-group-item d-flex justify-content-between"><span>${b.nom} (${b.age || '-'})</span><small>${b.projet?.titre || '-'}</small></li>`)
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
  document.getElementById('donTable').innerHTML = items
    .map((d) => `<tr><td>${new Date(d.createdAt).toLocaleDateString('fr-FR')}</td><td>${d.nomDonateur}</td><td>${d.projet?.titre || '-'}</td><td>${d.montant} USD</td></tr>`)
    .join('');
}

window.editProject = (p) => {
  const f = document.getElementById('projectForm');
  f.id.value = p._id;
  f.titre.value = p.titre;
  f.description.value = p.description || '';
  f.budget.value = p.budget || 0;
  f.dateDebut.value = p.dateDebut ? p.dateDebut.slice(0, 10) : '';
  f.dateFin.value = p.dateFin ? p.dateFin.slice(0, 10) : '';
  f.actif.checked = !!p.actif;
};

window.deleteProject = async (id) => {
  await api(`/api/admin/projects/${id}`, { method: 'DELETE' });
  await loadDashboard();
};

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData();
  fd.append('titre', form.titre.value);
  fd.append('description', form.description.value);
  fd.append('budget', Number(form.budget.value || 0));
  fd.append('dateDebut', form.dateDebut.value);
  fd.append('dateFin', form.dateFin.value);
  fd.append('actif', form.actif.checked);
  if (form.image.files[0]) fd.append('image', form.image.files[0]);

  const id = form.id.value;
  await api(id ? `/api/admin/projects/${id}` : '/api/admin/projects', { method: id ? 'PUT' : 'POST', body: fd });
  form.reset();
  await loadDashboard();
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
  await api('/api/admin/beneficiaries', {
  payload.projet_id = Number(payload.projet_id);
  await api('/api/admin/beneficiaires', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  e.target.reset();
  await loadDashboard();
});

document.getElementById('downloadReport').addEventListener('click', () => window.open('/api/admin/report', '_blank'));
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  location.href = '/login.html';
});

if (!localStorage.getItem('token')) location.href = '/login.html';
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
