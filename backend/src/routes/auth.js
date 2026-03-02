import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  loginWithGoogle,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').matches(/^\+[1-9]\d{1,14}$/).withMessage('Format téléphone invalide (ex: +225XXXXXXXXXX, +33XXXXXXXXX, +1XXXXXXXXXX)'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', loginWithGoogle);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/verify-email/:token', verifyEmail);
router.post('/verify-phone', verifyPhone);

// Routes protégées
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

export default router;
