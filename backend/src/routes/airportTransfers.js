import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTransferRequest,
  getTransfers,
  getTransfer,
  updateTransfer,
  getMyTransfers,
  updateMyTransfer,
  getMyChauffeurTransfers,
} from '../controllers/airportTransfers.js';

const router = express.Router();

// Middleware optionnel pour récupérer l'utilisateur s'il est connecté
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    // Si un token est présent, utiliser protect
    return protect(req, res, next);
  }
  // Sinon, continuer sans authentification
  next();
};

// Route publique - Créer une demande (avec auth optionnelle)
router.post('/', optionalAuth, createTransferRequest);

// Routes protégées - Client
router.get('/my-transfers', protect, getMyTransfers);
router.put('/:id/edit', protect, updateMyTransfer);

// Routes protégées - Chauffeur
router.get('/my-missions', protect, authorize('chauffeur'), getMyChauffeurTransfers);

// Routes Admin
router.get('/', protect, authorize('admin'), getTransfers);
router.get('/:id', protect, getTransfer);
router.put('/:id', protect, authorize('admin'), updateTransfer);

export default router;
