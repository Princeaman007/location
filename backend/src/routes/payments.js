import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  confirmCashPayment,
  refundPayment,
} from '../controllers/payments.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

// Routes Chauffeur/Admin
router.post('/:id/confirm-cash', protect, authorize('chauffeur', 'admin'), confirmCashPayment);

// Routes Admin
router.post('/:id/refund', protect, authorize('admin'), refundPayment);

export default router;
