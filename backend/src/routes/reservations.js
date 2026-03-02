import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  confirmReservation,
  validateDocuments,
} from '../controllers/reservations.js';

const router = express.Router();

router.get('/', protect, getReservations);
router.get('/:id', protect, getReservation);
router.post('/', protect, createReservation);
router.put('/:id', protect, updateReservation);
router.delete('/:id', protect, cancelReservation);

// Routes Admin
router.put('/:id/confirm', protect, authorize('admin'), confirmReservation);
router.put('/:id/validate-documents', protect, authorize('admin'), validateDocuments);

export default router;
