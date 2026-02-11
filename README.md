# ONGConnect

Plateforme web de gestion et de collecte de dons pour ONG.

## Fonctionnalités livrées

- Espace administrateur (projets, bénéficiaires, statistiques, historique des dons).
- Page publique (présentation ONG, projets actifs, formulaire de don, galerie, bouton don).
- Authentification avec rôles **Admin** et **Gestionnaire**.
- Génération d'un rapport PDF (`/api/admin/report.pdf`).
- Reçu automatique après don (référence affichée immédiatement).
- Mode sombre côté interface publique.

## Stack technique

- **Frontend**: HTML, CSS, Bootstrap, JavaScript.
- **Backend**: Node.js natif (`http`) sans dépendances externes.
- **Stockage**: fichier local `data.json` (JSON).

## Installation

```bash
node server.js
```

Application disponible sur `http://localhost:3000`.

## Comptes de test

- Admin: `admin / admin123`
- Gestionnaire: `gestionnaire / manager123`

## Modèle de données

Collections initialisées automatiquement dans `data.json`:

- `ong`
- `projets`
- `dons`
- `beneficiaires`
- `users`
