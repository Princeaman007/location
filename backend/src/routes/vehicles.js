import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadVehicleImages, handleMulterError } from '../middleware/upload.js';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkAvailability,
  getPopularVehicles,
  deleteVehicleImage,
  setPrimaryImage,
  calculatePrice,
} from '../controllers/vehicles.js';

const router = express.Router();

// Routes publiques
router.get('/', getVehicles);
router.get('/featured/popular', getPopularVehicles);
router.post('/calculate-price', calculatePrice);
router.get('/:id', getVehicle);
router.get('/:id/availability', checkAvailability);

// Routes protégées (Admin uniquement)
router.post('/', protect, authorize('admin'), uploadVehicleImages, handleMulterError, createVehicle);
router.put('/:id', protect, authorize('admin'), uploadVehicleImages, handleMulterError, updateVehicle);
router.delete('/:id', protect, authorize('admin'), deleteVehicle);

// Routes de gestion des images
router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteVehicleImage);
router.put('/:id/images/:imageId/primary', protect, authorize('admin'), setPrimaryImage);

export default router;
