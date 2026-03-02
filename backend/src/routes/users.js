import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateDocuments,
  validateDocuments,
  getChauffeurs,
  getAvailableChauffeurs,
  getChauffeurStats,
  getUserStats,
} from '../controllers/users.js';

const router = express.Router();

// Routes Admin
router.get('/', protect, authorize('admin'), getUsers);
router.get('/chauffeurs/available', protect, authorize('admin'), getAvailableChauffeurs);
router.post('/:id/validate-documents', protect, authorize('admin'), validateDocuments);

// Routes protégées (me routes must come before :id routes)
router.get('/me/stats', protect, getUserStats);
router.get('/me', protect, (req, res, next) => {
  req.params.id = req.user.id;
  next();
}, getUser);
router.put('/me', protect, (req, res, next) => {
  req.params.id = req.user.id;
  next();
}, updateUser);
router.delete('/me', protect, (req, res, next) => {
  req.params.id = req.user.id;
  next();
}, deleteUser);
router.put('/me/documents', protect, updateDocuments);

// Routes publiques
router.get('/chauffeurs', getChauffeurs);
router.get('/chauffeurs/:id/stats', getChauffeurStats);

export default router;
