# Configuration Cloudinary pour l'Upload d'Images

## Problème Identifié

Les variables d'environnement Cloudinary ne sont pas configurées dans le fichier `.env` du backend. Actuellement, elles sont définies avec des valeurs par défaut :

```env
CLOUDINARY_CLOUD_NAME=dowxwszix
CLOUDINARY_API_KEY=461587913869111
CLOUDINARY_API_SECRET=**********
```

## Solution : Configurer Cloudinary

### Étape 1 : Créer un compte Cloudinary (gratuit)

1. Allez sur [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Créez un compte gratuit (inclut 25GB de stockage et 25GB de bande passante par mois)
3. Vérifiez votre email

### Étape 2 : Récupérer vos identifiants

Après connexion sur [https://cloudinary.com/console](https://cloudinary.com/console), vous verrez :

```
Cloud Name: xxxxxxxxxx
API Key: xxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 3 : Mettre à jour le fichier .env

Ouvrez le fichier `backend/.env` et remplacez les valeurs Cloudinary :

```env
# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=votre_cloud_name_ici
CLOUDINARY_API_KEY=votre_api_key_ici
CLOUDINARY_API_SECRET=votre_api_secret_ici
```

⚠️ **IMPORTANT** : Ne partagez JAMAIS ces identifiants publiquement (GitHub, etc.)

### Étape 4 : Redémarrer le backend

```bash
# Arrêtez le serveur backend (Ctrl+C)
# Puis redémarrez-le
cd backend
npm run dev
```

## Vérification que Multer est installé

✅ Multer est **déjà installé** :
```bash
cd backend
npm list multer
# Résultat : multer@1.4.5-lts.2
```

## Structure de l'Upload

### Frontend
- Les images sont sélectionnées via `<input type="file" multiple>`
- Elles sont stockées dans le state `images` (array de File objects)
- Les previews sont affichées
- Au submit, les images sont envoyées via FormData

### Backend
- Route : `POST /api/vehicles`
- Middleware : `uploadVehicleImages` (max 10 images, 5MB chacune)
- Les images sont uploadées sur Cloudinary (pas de dossier local `uploads` nécessaire)
- Les URLs Cloudinary sont stockées dans MongoDB

## Alternative : Stockage Local (sans Cloudinary)

Si vous ne souhaitez pas utiliser Cloudinary, vous pouvez modifier le middleware pour stocker les images localement :

### 1. Créer le dossier uploads

```bash
cd backend
mkdir uploads
mkdir uploads/vehicles
```

### 2. Modifier le middleware upload.js

```javascript
// Remplacer memoryStorage par diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vehicles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
```

### 3. Servir les fichiers statiques

Dans `server.js`, ajoutez :

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### 4. Modifier le contrôleur vehicles.js

Au lieu d'uploader sur Cloudinary, sauvegardez directement les chemins des fichiers :

```javascript
// Dans createVehicle
if (req.files && req.files.length > 0) {
  vehicleData.images = req.files.map(file => ({
    url: `/uploads/vehicles/${file.filename}`,
    publicId: file.filename,
    isPrimary: false,
  }));
  vehicleData.images[0].isPrimary = true;
}
```

## Debugging avec les Logs

J'ai ajouté des logs détaillés dans `VehicleFormModal.tsx`. Ouvrez la console du navigateur (F12) et vous verrez :

- ✅ Nombre d'images sélectionnées
- ✅ Validation des étapes
- ✅ Contenu du FormData
- ✅ Réponse de l'API
- ❌ Erreurs détaillées si présentes

## Tester l'Upload

1. Démarrez backend et frontend
2. Connectez-vous en tant qu'admin
3. Allez dans le dashboard admin
4. Cliquez sur "Ajouter un véhicule"
5. Remplissez les 3 premières étapes
6. À l'étape 4, cliquez sur la zone d'upload
7. Sélectionnez 1-10 images
8. Ouvrez la console (F12) pour voir les logs
9. Cliquez sur "Créer"

## Vérification du Backend

Si le problème persiste, vérifiez les logs du backend dans le terminal où `npm run dev` s'exécute.

## Support

Si vous continuez à avoir des problèmes, vérifiez :
- Les logs frontend (console navigateur)
- Les logs backend (terminal)
- Que Cloudinary est bien configuré OU que le stockage local fonctionne
- Que vous êtes connecté avec un compte admin
