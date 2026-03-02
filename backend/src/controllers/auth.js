import User from '../models/User.js';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { verificationEmailTemplate, resetPasswordEmailTemplate } from '../utils/emailTemplates.js';

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, phone, password, city, profession } = req.body;

    // Vérifier si l'utilisateur existe
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte existe déjà avec cet email ou téléphone',
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      profession,
    });

    // Générer token de vérification email
    const emailToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
    await user.save();

    // Envoyer email de vérification
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Vérification de votre compte DCM groupe agence',
        html: verificationEmailTemplate(user.firstName, verificationUrl),
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }

    // Générer code SMS de vérification
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = phoneCode;
    user.phoneVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Envoyer SMS de vérification
    // await sendSMS(user.phone, `Votre code de vérification IvoireDrive: ${phoneCode}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message,
    });
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    console.log('🔍 Tentative de connexion:', { email });

    // Vérifier l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    console.log('✅ Utilisateur trouvé:', { id: user._id, email: user.email });

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    console.log('🔑 Vérification mot de passe:', { isMatch });
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez le support.',
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message,
    });
  }
};

// @desc    Connexion avec Google
// @route   POST /api/auth/google
// @access  Public
export const loginWithGoogle = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    // Vérifier si l'utilisateur existe
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Mettre à jour avec Google ID si nécessaire
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Créer un nouveau compte
      user = await User.create({
        googleId,
        email,
        firstName,
        lastName,
        avatar,
        phone: '+2250000000000', // Temporaire, à mettre à jour
        password: crypto.randomBytes(20).toString('hex'), // Mot de passe aléatoire
        isEmailVerified: true,
      });
    }

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion Google',
      error: error.message,
    });
  }
};

// @desc    Obtenir profil utilisateur
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
    });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};

    // Ne mettre à jour que les champs fournis et non vides
    if (req.body.firstName) fieldsToUpdate.firstName = req.body.firstName;
    if (req.body.lastName) fieldsToUpdate.lastName = req.body.lastName;
    if (req.body.phone) fieldsToUpdate.phone = req.body.phone;
    if (req.body.city) fieldsToUpdate.city = req.body.city;
    if (req.body.profession !== undefined) fieldsToUpdate.profession = req.body.profession;
    if (req.body.address) fieldsToUpdate.address = req.body.address;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message,
    });
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe actuel
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
    });
  }
};

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte avec cet email',
      });
    }

    // Générer token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Envoyer email avec lien de réinitialisation
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation de votre mot de passe DCM groupe agence',
        html: resetPasswordEmailTemplate(user.firstName, resetUrl),
      });

      return res.status(200).json({
        success: true,
        message: 'Email de réinitialisation envoyé',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Erreur envoi email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
    });
  }
};

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }

    // Définir nouveau mot de passe
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
    });
  }
};

// @desc    Vérifier email
// @route   POST /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ emailVerificationToken });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
    });
  }
};

// @desc    Vérifier téléphone
// @route   POST /api/auth/verify-phone
// @access  Private
export const verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (
      user.phoneVerificationCode !== code ||
      user.phoneVerificationExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Code invalide ou expiré',
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Téléphone vérifié avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
    });
  }
};

// Fonction helper pour envoyer le token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    },
  });
};
