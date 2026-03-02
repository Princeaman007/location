# Configuration de l'authentification IvoireDrive

## ✅ Fonctionnalités implémentées

### Backend
1. **Inscription avec vérification email** ✅
   - Génération automatique du token de vérification
   - Envoi d'email avec template professionnel
   - Route: `POST /api/auth/register`

2. **Connexion** ✅
   - Validation email/password
   - Génération JWT token
   - Route: `POST /api/auth/login`

3. **Mot de passe oublié** ✅
   - Génération token de réinitialisation (30 min)
   - Envoi d'email avec lien sécurisé
   - Route: `POST /api/auth/forgot-password`

4. **Réinitialisation mot de passe** ✅
   - Validation du token
   - Mise à jour du mot de passe
   - Route: `PUT /api/auth/reset-password/:resetToken`

5. **Vérification email** ✅
   - Validation du token
   - Activation du compte
   - Route: `POST /api/auth/verify-email/:token`

### Frontend
1. **Page Login** ✅
   - Formulaire de connexion
   - Lien "Mot de passe oublié"
   - Route: `/login`

2. **Page Register** ✅
   - Formulaire multi-étapes (3 étapes)
   - Message de confirmation après inscription
   - Information sur l'email de vérification
   - Route: `/register`

3. **Page Mot de passe oublié** ✅
   - Formulaire email
   - Message de confirmation d'envoi
   - Route: `/forgot-password`

4. **Page Réinitialisation** ✅
   - Formulaire nouveau mot de passe
   - Validation en temps réel
   - Indicateur de force du mot de passe
   - Route: `/reset-password/:resetToken`

5. **Page Vérification email** ✅
   - Vérification automatique au chargement
   - Message de succès/erreur
   - Route: `/verify-email/:token`

## 📧 Configuration de l'email

### Option 1: Gmail (Simple pour le développement)

1. Activer "Applications moins sécurisées" OU créer un "Mot de passe d'application"
   - Aller sur https://myaccount.google.com/security
   - Activer la validation en deux étapes
   - Créer un mot de passe d'application

2. Mettre à jour `.env`:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=votre.email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application
FROM_EMAIL=noreply@ivoiredrive.ci
FROM_NAME=IvoireDrive
```

### Option 2: SendGrid (Recommandé pour production)

1. Créer un compte sur https://sendgrid.com
2. Créer une API Key
3. Mettre à jour `.env`:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=votre_api_key_sendgrid
FROM_EMAIL=noreply@ivoiredrive.ci
FROM_NAME=IvoireDrive
```

### Option 3: Mailtrap (Pour les tests)

1. Créer un compte sur https://mailtrap.io
2. Récupérer les credentials
3. Mettre à jour `.env`:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=votre_username_mailtrap
SMTP_PASSWORD=votre_password_mailtrap
FROM_EMAIL=noreply@ivoiredrive.ci
FROM_NAME=IvoireDrive
```

## 🚀 Installation des dépendances

```bash
cd backend
npm install nodemailer
```

## 🧪 Test de l'authentification

### 1. Tester l'inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "+22507123456",
    "password": "Password123"
  }'
```

### 2. Tester le mot de passe oublié
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com"
  }'
```

### 3. Vérifier l'email (copier le token depuis l'email)
```bash
curl -X POST http://localhost:5000/api/auth/verify-email/TOKEN_ICI
```

### 4. Réinitialiser le mot de passe (copier le token depuis l'email)
```bash
curl -X PUT http://localhost:5000/api/auth/reset-password/TOKEN_ICI \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewPassword123"
  }'
```

## 📝 Templates d'email

Les templates HTML sont situés dans `backend/src/utils/emailTemplates.js`:
- `verificationEmailTemplate`: Email de bienvenue + vérification
- `resetPasswordEmailTemplate`: Réinitialisation du mot de passe
- `bookingConfirmationTemplate`: Confirmation de réservation (prêt pour usage futur)

## ⚠️ Points importants

1. **Token de vérification email**: Pas d'expiration (considérer d'en ajouter une)
2. **Token de réinitialisation**: Expire après 30 minutes
3. **Email de confirmation**: Envoyé automatiquement après l'inscription
4. **Redirection automatique**: 
   - Après vérification email → `/login` (3 secondes)
   - Après réinitialisation → `/login` (3 secondes)
   - Après inscription → Dashboard (5 secondes)

## 🔐 Sécurité

✅ Hashage des mots de passe avec bcrypt
✅ Tokens cryptés avec SHA-256
✅ JWT pour l'authentification
✅ Validation des entrées avec express-validator
✅ Rate limiting sur les routes sensibles
✅ Protection XSS et injection SQL

## 📱 Prochaines étapes

- [ ] Configurer l'email de production
- [ ] Ajouter la vérification par SMS (Twilio déjà configuré)
- [ ] Ajouter Google OAuth (route déjà créée)
- [ ] Personnaliser les templates d'email avec le logo
- [ ] Ajouter des emails de notification (réservation, etc.)
