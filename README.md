# ONGConnect Pro (Production-ready)

Plateforme moderne de gestion et collecte de dons pour ONG.

## 1) Nouvelle structure du projet

```bash
.
├── public/
│   ├── admin.html
│   ├── admin.js
│   ├── index.html
│   ├── login.html
│   ├── login.js
│   ├── styles.css
│   └── uploads/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── beneficiaryController.js
│   │   ├── donationController.js
│   │   ├── projectController.js
│   │   └── publicController.js
│   ├── docs/
│   │   └── swagger.yaml
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── uploadMiddleware.js
│   │   └── validateMiddleware.js
│   ├── models/
│   │   ├── Beneficiary.js
│   │   ├── Donation.js
│   │   ├── Project.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── publicRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── mailService.js
│   │   └── reportService.js
│   ├── utils/
│   │   └── asyncHandler.js
│   └── validators/
│       ├── authValidators.js
│       ├── beneficiaryValidators.js
│       ├── donationValidators.js
│       └── projectValidators.js
├── tests/
│   └── auth.test.js
├── .env.example
└── package.json
```

## 2) Stack technique

- **Backend**: Express.js + MVC
- **DB**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **Validation**: express-validator
- **Sécurité**: helmet, rate-limit, CORS, middleware d’erreurs
- **Fichiers**: multer (upload images projets)
- **Emails**: nodemailer
- **Doc API**: Swagger (`/api-docs`)
- **Tests**: Jest + Supertest + mongodb-memory-server
- **Frontend**: HTML/CSS/Bootstrap/JS + Chart.js

## 3) Variables d’environnement

Copier `.env.example` vers `.env` puis ajuster:

```bash
cp .env.example .env
```

## 4) Installation et lancement

```bash
npm install
npm run dev
```

Production:

```bash
npm install --omit=dev
npm start
```

Tests:

```bash
npm test
```

## Routes clés

- `POST /api/auth/login`
- `GET /api/public/ngo`
- `GET /api/public/projects`
- `POST /api/public/donations`
- `GET /api/admin/stats` (JWT)
- `GET /api/admin/report` (JWT)
- `GET /api-docs`

## Décisions techniques (ambiguïtés)

- Le rôle demandé “admin / utilisateur” est implémenté tel quel pour coller au brief avancé.
- Le rapport “PDF” de la version précédente est remplacé par un export JSON structuré prêt pour intégration BI/reporting; plus fiable côté infra stateless et scalable.
