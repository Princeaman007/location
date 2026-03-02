import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getVehicleReviews,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
  approveReview,
  markHelpful,
  getPendingReviews,
} from '../controllers/reviews.js';

const router = express.Router();

// Routes publiques
router.get('/:vehicleId', getVehicleReviews);

// Routes protégées
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

// Routes Admin
router.get('/admin/pending', protect, authorize('admin'), getPendingReviews);
router.post('/:id/respond', protect, authorize('admin'), respondToReview);
router.put('/:id/approve', protect, authorize('admin'), approveReview);

export default router;
