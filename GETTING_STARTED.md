# 🚀 Guide de Démarrage - IvoireDrive

## Prérequis

Assurez-vous d'avoir installé:
- **Node.js** v18+ ([Télécharger](https://nodejs.org/))
- **MongoDB** v6+ ([Télécharger](https://www.mongodb.com/try/download/community))
- **npm** ou **yarn**

## Installation

### 1. Backend

```powershell
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos configurations
# notepad .env

# Démarrer MongoDB (si pas déjà démarré)
# Sous Windows, MongoDB se lance généralement automatiquement

# Démarrer le serveur en mode développement
npm run dev
```

Le serveur sera disponible sur `http://localhost:5000`

### 2. Frontend

```powershell
# Ouvrir un nouveau terminal
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer l'application
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Configuration MongoDB

### Option 1: MongoDB Local

Si MongoDB est installé localement, il devrait démarrer automatiquement.

Pour vérifier:
```powershell
# Vérifier le service MongoDB
Get-Service MongoDB
```

### Option 2: MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Obtenez l'URL de connexion
4. Mettez à jour `MONGODB_URI` dans `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ivoiredrive
   ```

## Fonctionnalités Disponibles

### ✅ Backend Complété

- ✅ Configuration serveur Express
- ✅ Connexion MongoDB
- ✅ Modèles de données (User, Vehicle, Reservation, Payment, Review)
- ✅ Système d'authentification JWT
- ✅ Routes API de base
- ✅ Middleware de sécurité
- ✅ Gestion des erreurs

### ✅ Frontend Complété

- ✅ Configuration React + TypeScript
- ✅ Tailwind CSS avec charte graphique IvoireDrive
- ✅ Page d'accueil avec Hero
- ✅ Header responsive
- ✅ Footer complet
- ✅ Types TypeScript
- ✅ Services API
- ✅ Store Zustand pour l'authentification
- ✅ Utilitaires (formatage, validation)

## Prochaines Étapes

### À Implémenter

1. **Pages additionnelles**
   - Catalogue véhicules avec filtres
   - Fiche détaillée véhicule
   - Processus de réservation
   - Login / Register
   - Dashboard Client
   - Dashboard Chauffeur
   - Dashboard Admin

2. **Fonctionnalités Backend**
   - Controllers complets pour chaque route
   - Upload d'images avec Cloudinary
   - Système de paiement (CinetPay, FedaPay)
   - Envoi d'emails (SendGrid)
   - Envoi de SMS (Twilio)

3. **Optimisations**
   - Pagination des résultats
   - Cache des données
   - Tests unitaires
   - Documentation API (Swagger)

## Structure du Projet

```
location/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuration (DB, Cloudinary)
│   │   ├── models/        # Modèles Mongoose ✅
│   │   ├── routes/        # Routes API ✅
│   │   ├── controllers/   # Logique métier (à compléter)
│   │   ├── middleware/    # Auth, validation ✅
│   │   └── server.js      # Serveur Express ✅
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Composants réutilisables ✅
    │   ├── pages/         # Pages ✅
    │   ├── services/      # Services API ✅
    │   ├── store/         # State management ✅
    │   ├── types/         # Types TypeScript ✅
    │   ├── utils/         # Utilitaires ✅
    │   └── App.tsx        # Application principale ✅
    └── package.json
```

## Scripts Disponibles

### Backend
```powershell
npm run dev     # Démarrage en mode développement (avec nodemon)
npm start       # Démarrage en mode production
npm test        # Lancer les tests
npm run seed    # Peupler la base de données (à créer)
```

### Frontend
```powershell
npm run dev     # Démarrage serveur de développement
npm run build   # Build pour production
npm run preview # Prévisualiser le build
npm run lint    # Vérifier le code
```

## Problèmes Courants

### MongoDB ne démarre pas
```powershell
# Redémarrer le service
net stop MongoDB
net start MongoDB
```

### Port 5000 déjà utilisé
Changez le port dans `backend/.env`:
```
PORT=5001
```

### Erreur CORS
Vérifiez que `FRONTEND_URL` dans `backend/.env` correspond bien à votre URL frontend:
```
FRONTEND_URL=http://localhost:5173
```

## Documentation

- [Documentation MongoDB](https://docs.mongodb.com/)
- [Documentation Express](https://expressjs.com/)
- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation TypeScript](https://www.typescriptlang.org/)

## Support

Pour toute question ou problème:
- 📧 Email: support@ivoiredrive.ci
- 💬 WhatsApp: +225 XX XX XX XX XX

## Licence

© 2026 IvoireDrive - Tous droits réservés
