// Entrypoint legacy: utilisez `node src/server.js`.
require('./src/server');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data.json');

const sessions = new Map();

function createDefaultData() {
  return {
    ong: {
      id: 1,
      nom: 'ONGConnect',
      description:
        'Nous accompagnons les communautés vulnérables à travers des projets durables en santé, éducation et autonomisation.',
      email: 'contact@ongconnect.org',
      telephone: '+243 900 000 000'
    },
    projets: [
      {
        id: 1,
        titre: 'Eau potable pour tous',
        description: 'Installation de 10 points d’eau potable dans les zones rurales.',
        budget: 25000,
        montant_collecte: 7200,
        date_debut: '2026-01-01',
        date_fin: '2026-10-30',
        actif: 1
      },
      {
        id: 2,
        titre: 'Cantines scolaires solidaires',
        description: 'Distribution quotidienne de repas équilibrés pour 500 enfants.',
        budget: 18000,
        montant_collecte: 11650,
        date_debut: '2026-02-01',
        date_fin: '2026-12-15',
        actif: 1
      }
    ],
    dons: [],
    beneficiaires: [],
    users: [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
      { id: 2, username: 'gestionnaire', password: 'manager123', role: 'gestionnaire' }
    ]
  };
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const base = createDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(base, null, 2));
    return base;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').filter(Boolean).map((p) => {
      const [k, ...v] = p.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

function getUser(req, data) {
  const sid = parseCookies(req).sid;
  if (!sid || !sessions.has(sid)) return null;
  const userId = sessions.get(sid);
  return data.users.find((u) => u.id === userId) || null;
}

function requireAuth(req, res, data) {
  const user = getUser(req, data);
  if (!user) {
    sendJson(res, 401, { error: 'Non autorisé' });
    return null;
  }
  return user;
}

function generatePdfLikeReport(data) {
  const total = data.dons.reduce((acc, d) => acc + d.montant, 0);
  const lines = [
    'Rapport ONGConnect',
    `Total des dons: ${total} USD`,
    `Nombre de projets: ${data.projets.length}`,
    `Nombre de bénéficiaires: ${data.beneficiaires.length}`,
    '',
    'Derniers dons:'
  ];
  data.dons.slice(-10).reverse().forEach((d) => {
    lines.push(`- ${d.nom_donateur}: ${d.montant} USD (${new Date(d.date).toLocaleDateString('fr-FR')})`);
  });

  const content = lines.join('\n').replace(/[()]/g, '');
  const pdf = `%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${content.length + 40}>>stream\nBT /F1 12 Tf 50 740 Td (${content}) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000350 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n420\n%%EOF`;
  return Buffer.from(pdf, 'utf-8');
}

function serveStatic(req, res) {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8'
  };

  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const data = loadData();
  const { url, method } = req;

  try {
    if (url === '/api/public/ngo' && method === 'GET') return sendJson(res, 200, data.ong);
    if (url === '/api/public/projects' && method === 'GET') return sendJson(res, 200, data.projets.filter((p) => p.actif === 1));

    if (url === '/api/public/donations' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.montant || Number(body.montant) <= 0) return sendJson(res, 400, { error: 'Montant invalide' });
      const projet = data.projets.find((p) => p.id === Number(body.projet_id));
      if (!projet) return sendJson(res, 404, { error: 'Projet introuvable' });

      const don = {
        id: data.dons.length ? Math.max(...data.dons.map((d) => d.id)) + 1 : 1,
        nom_donateur: body.anonyme ? 'Anonyme' : body.nom_donateur || 'Donateur',
        email: body.email || null,
        montant: Number(body.montant),
        date: new Date().toISOString(),
        projet_id: Number(body.projet_id),
        anonyme: !!body.anonyme
      };
      data.dons.push(don);
      projet.montant_collecte += don.montant;
      saveData(data);
      return sendJson(res, 201, { message: 'Don enregistré', receipt: `DON-${don.id}` });
    }

    if (url === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const user = data.users.find((u) => u.username === body.username && u.password === body.password);
      if (!user) return sendJson(res, 401, { error: 'Identifiants invalides' });
      const sid = crypto.randomUUID();
      sessions.set(sid, user.id);
      res.writeHead(200, { 'Set-Cookie': `sid=${sid}; HttpOnly; Path=/`, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Connexion réussie', user: { username: user.username, role: user.role } }));
    }

    if (url === '/api/auth/logout' && method === 'POST') {
      const sid = parseCookies(req).sid;
      if (sid) sessions.delete(sid);
      res.writeHead(200, { 'Set-Cookie': 'sid=; Max-Age=0; Path=/' , 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Déconnecté' }));
    }

    if (url === '/api/admin/stats' && method === 'GET') {
      if (!requireAuth(req, res, data)) return;
      const totalDons = data.dons.reduce((acc, d) => acc + d.montant, 0);
      const beneficiaires = data.beneficiaires.length;
      const projetsActifs = data.projets.filter((p) => p.actif === 1).length;
      return sendJson(res, 200, { totalDons, beneficiaires, projetsActifs });
    }

    if (url === '/api/admin/projects' && method === 'GET') {
      if (!requireAuth(req, res, data)) return;
      return sendJson(res, 200, data.projets);
    }

    if (url === '/api/admin/projects' && method === 'POST') {
      const user = requireAuth(req, res, data);
      if (!user) return;
      const body = await parseBody(req);
      const projet = { ...body, id: data.projets.length ? Math.max(...data.projets.map((p) => p.id)) + 1 : 1, montant_collecte: 0, actif: body.actif ? 1 : 0 };
      data.projets.push(projet);
      saveData(data);
      return sendJson(res, 201, { id: projet.id });
    }

    if (url.startsWith('/api/admin/projects/') && method === 'PUT') {
      if (!requireAuth(req, res, data)) return;
      const id = Number(url.split('/').pop());
      const body = await parseBody(req);
      const projet = data.projets.find((p) => p.id === id);
      if (!projet) return sendJson(res, 404, { error: 'Projet introuvable' });
      Object.assign(projet, body, { actif: body.actif ? 1 : 0 });
      saveData(data);
      return sendJson(res, 200, { message: 'Projet mis à jour' });
    }

    if (url.startsWith('/api/admin/projects/') && method === 'DELETE') {
      const user = requireAuth(req, res, data);
      if (!user) return;
      if (user.role !== 'admin') return sendJson(res, 403, { error: 'Admin uniquement' });
      const id = Number(url.split('/').pop());
      data.projets = data.projets.filter((p) => p.id !== id);
      saveData(data);
      return sendJson(res, 200, { message: 'Projet supprimé' });
    }

    if (url === '/api/admin/beneficiaires' && method === 'GET') {
      if (!requireAuth(req, res, data)) return;
      const items = data.beneficiaires.map((b) => ({ ...b, projet: data.projets.find((p) => p.id === b.projet_id)?.titre || null }));
      return sendJson(res, 200, items);
    }

    if (url === '/api/admin/beneficiaires' && method === 'POST') {
      if (!requireAuth(req, res, data)) return;
      const body = await parseBody(req);
      const item = { ...body, id: data.beneficiaires.length ? Math.max(...data.beneficiaires.map((b) => b.id)) + 1 : 1, age: Number(body.age || 0), projet_id: Number(body.projet_id) };
      data.beneficiaires.push(item);
      saveData(data);
      return sendJson(res, 201, { id: item.id });
    }

    if (url === '/api/admin/donations' && method === 'GET') {
      if (!requireAuth(req, res, data)) return;
      const items = data.dons.map((d) => ({ ...d, projet: data.projets.find((p) => p.id === d.projet_id)?.titre || '-' }));
      return sendJson(res, 200, items.sort((a, b) => (a.date < b.date ? 1 : -1)));
    }

    if (url === '/api/admin/report.pdf' && method === 'GET') {
      if (!requireAuth(req, res, data)) return;
      const file = generatePdfLikeReport(data);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rapport-ongconnect.pdf"'
      });
      return res.end(file);
    }

    if (url.startsWith('/api/')) return sendJson(res, 404, { error: 'Route introuvable' });
    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: 'Erreur serveur', detail: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`ONGConnect démarré sur http://localhost:${PORT}`);
});
