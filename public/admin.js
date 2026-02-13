let chart;

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${localStorage.getItem('token') || ''}`, ...extra };
}

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: authHeaders(options.headers || {}) });
  if (res.status === 401) {
    localStorage.removeItem('token');
    location.href = '/login.html';
    return null;
  }
  return res;
}

async function loadDashboard() {
  const stats = await (await api('/api/admin/stats')).json();
  const projects = await (await api('/api/admin/projects')).json();
  const donations = await (await api('/api/admin/donations')).json();
  const beneficiaries = await (await api('/api/admin/beneficiaries')).json();

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
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('impactChart'), {
    type: 'line',
    data: {
      labels: Object.keys(byMonth),
      datasets: [{ label: 'Dons/mois', data: Object.values(byMonth), borderColor: '#2563eb' }]
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
});

document.getElementById('benefForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  payload.age = Number(payload.age || 0);
  await api('/api/admin/beneficiaries', {
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
