import multer from 'multer';
import path from 'path';

// Configuration du stockage en mémoire pour Multer
const storage = multer.memoryStorage();

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Types de fichiers acceptés
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers images (JPEG, JPG, PNG, GIF, WEBP) sont acceptés'));
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB par fichier
  },
  fileFilter: fileFilter,
});

// Middleware pour gérer plusieurs images de véhicules
export const uploadVehicleImages = upload.array('images', 10); // Max 10 images

// Middleware pour gérer une seule image
export const uploadSingleImage = upload.single('image');

// Middleware pour gérer les documents
export const uploadDocument = upload.single('document');

// Middleware de gestion d'erreurs pour Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximale: 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Maximum: 10 images',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur upload: ${err.message}`,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};

export default upload;
