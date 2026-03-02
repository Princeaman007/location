# 🚗 IvoireDrive - Plateforme de Location de Véhicules

Plateforme web de location de véhicules avec ou sans chauffeur et service de transfert aéroport-hôtel en Côte d'Ivoire.

## 📋 Fonctionnalités Principales

- 🚗 Location de véhicules (avec ou sans chauffeur)
- ✈️ Service de transfert aéroport-hôtel
- 💳 Paiement à la livraison / en ligne (Mobile Money, Cartes)
- 👥 Multi-rôles: Client, Chauffeur, Administrateur
- 📱 Responsive (Mobile, Tablet, Desktop)
- ⭐ Système d'avis et notation
- 🎁 Programme de fidélité
- 📊 Dashboard analytiques

## 🛠️ Stack Technique

### Backend
- **Node.js** + **Express.js**
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **Cloudinary** pour le stockage d'images

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **React Query** pour la gestion du state
- **Zustand** pour le state management
- **React Hook Form** pour les formulaires

### Paiement
- **CinetPay** (Mobile Money CI)
- **FedaPay** (Mobile Money + Cartes)
- **Stripe** (Cartes internationales)

## 🎨 Charte Graphique

### Couleurs
- **Primaire**: `#FF8C42` (Orange Ivoirien)
- **Secondaire**: `#00A86B` (Vert Tropical)
- **Tertiaire**: `#FFFFF0` (Blanc Ivoire)
- **Texte**: `#2C3E50` (Bleu nuit)
- **Success**: `#27AE60`
- **Error**: `#E74C3C`
- **Warning**: `#F39C12`
- **Info**: `#3498DB`

### Typographie
- **Titres**: Montserrat (Bold, SemiBold)
- **Corps**: Inter (Regular, Medium)

## 📁 Structure du Projet

```
location/
├── backend/                 # API REST Node.js
│   ├── src/
│   │   ├── config/         # Configuration (DB, JWT, etc.)
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes API
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Middlewares (auth, validation)
│   │   ├── services/       # Services (paiement, email, SMS)
│   │   ├── utils/          # Utilitaires
│   │   └── server.js       # Point d'entrée
│   ├── uploads/            # Fichiers uploadés
│   └── package.json
│
├── frontend/               # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── layouts/        # Layouts (Public, Client, Admin)
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Services API
│   │   ├── store/          # State management (Zustand)
│   │   ├── types/          # Types TypeScript
│   │   ├── utils/          # Utilitaires
│   │   ├── styles/         # Styles globaux
│   │   ├── assets/         # Images, icons
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js >= 18.x
- MongoDB >= 6.x
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Variables d'Environnement

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ivoiredrive
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@ivoiredrive.ci

# SMS (Twilio ou AfricasTalking)
SMS_API_KEY=your_sms_api_key
SMS_SENDER=IvoireDrive

# Payment
CINETPAY_API_KEY=your_cinetpay_key
CINETPAY_SITE_ID=your_site_id
FEDAPAY_API_KEY=your_fedapay_key
STRIPE_SECRET_KEY=your_stripe_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 📱 Rôles Utilisateurs

### 1. **Public** (Non authentifié)
- Parcourir le catalogue
- Voir détails véhicules
- Service transfert aéroport

### 2. **Client** (Authentifié)
- Réserver véhicules
- Gérer réservations
- Programme fidélité
- Historique et factures

### 3. **Chauffeur**
- Dashboard missions
- Livraisons véhicules
- Carnet de bord
- Gestion paiements

### 4. **Administrateur**
- Gestion complète flotte
- Gestion réservations
- Gestion chauffeurs
- Statistiques et rapports
- Validation documents

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/google` - Connexion Google
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/forgot-password` - Récupération mot de passe

### Vehicles
- `GET /api/vehicles` - Liste véhicules
- `GET /api/vehicles/:id` - Détails véhicule
- `POST /api/vehicles` - Créer véhicule (Admin)
- `PUT /api/vehicles/:id` - Modifier véhicule (Admin)
- `DELETE /api/vehicles/:id` - Supprimer véhicule (Admin)

### Reservations
- `GET /api/reservations` - Mes réservations
- `GET /api/reservations/:id` - Détails réservation
- `POST /api/reservations` - Créer réservation
- `PUT /api/reservations/:id` - Modifier réservation
- `DELETE /api/reservations/:id` - Annuler réservation

### Payments
- `POST /api/payments/initiate` - Initier paiement
- `POST /api/payments/verify` - Vérifier paiement
- `GET /api/payments/history` - Historique paiements

### Reviews
- `GET /api/reviews/:vehicleId` - Avis véhicule
- `POST /api/reviews` - Laisser avis
- `PUT /api/reviews/:id` - Modifier avis
- `DELETE /api/reviews/:id` - Supprimer avis

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Déploiement

### Backend (Railway / Render / Heroku)
```bash
npm run build
npm start
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Upload dist/ folder
```

## 📄 Licence

© 2026 IvoireDrive. Tous droits réservés.

## 👥 Support

- Email: support@ivoiredrive.ci
- WhatsApp: +225 XX XX XX XX XX
- Site web: https://www.ivoiredrive.ci
