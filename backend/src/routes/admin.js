import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminStats,
  getAllReservations,
  getAllAirportTransfers,
  getAllUsers,
  getAllPayments,
  getAllReviews,
  updateReservationStatus,
  updateTransferStatus,
  validateUserDocuments,
  approveReview,
  rejectReview,
  getAllChauffeurs,
  createChauffeur,
  getChauffeurById,
  updateChauffeur,
  deleteChauffeur,
  assignChauffeurToReservation,
  removeChauffeurFromReservation,
  assignChauffeurToTransfer,
  removeChauffeurFromTransfer,
} from '../controllers/admin.js';

const router = express.Router();

// Toutes les routes nécessitent d'être admin
router.use(protect, authorize('admin'));

// Stats globales
router.get('/stats', getAdminStats);

// Réservations
router.get('/reservations', getAllReservations);
router.put('/reservations/:id/status', updateReservationStatus);
router.put('/reservations/:id/assign-chauffeur', assignChauffeurToReservation);
router.delete('/reservations/:id/remove-chauffeur', removeChauffeurFromReservation);

// Transferts aéroport
router.get('/airport-transfers', getAllAirportTransfers);
router.put('/airport-transfers/:id/status', updateTransferStatus);
router.put('/airport-transfers/:id/assign-chauffeur', assignChauffeurToTransfer);
router.delete('/airport-transfers/:id/remove-chauffeur', removeChauffeurFromTransfer);

// Utilisateurs
router.get('/users', getAllUsers);
router.put('/users/:id/validate-documents', validateUserDocuments);

// Chauffeurs CRUD
router.get('/chauffeurs', getAllChauffeurs);
router.post('/chauffeurs', createChauffeur);
router.get('/chauffeurs/:id', getChauffeurById);
router.put('/chauffeurs/:id', updateChauffeur);
router.delete('/chauffeurs/:id', deleteChauffeur);

// Paiements
router.get('/payments', getAllPayments);

// Avis
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/approve', approveReview);
router.put('/reviews/:id/reject', rejectReview);

export default router;
