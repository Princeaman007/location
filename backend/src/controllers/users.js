import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    
    if (role) filter.role = role;
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message,
    });
  }
};

// @desc    Obtenir un utilisateur
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier les permissions (seulement son propre profil ou admin)
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    // Vérifier les permissions
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      city: req.body.city,
      profession: req.body.profession,
      address: req.body.address,
      avatar: req.body.avatar,
    };

    // Seul admin peut changer le rôle
    if (req.user.role === 'admin' && req.body.role) {
      fieldsToUpdate.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    });
  }
};

// @desc    Supprimer son compte utilisateur
// @route   DELETE /api/users/me
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Compte désactivé avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour les documents
// @route   PUT /api/users/me/documents
// @access  Private
export const updateDocuments = async (req, res) => {
  try {
    const { documents } = req.body;
    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Mise à jour des documents
    if (documents) {
      user.documents = { ...user.documents, ...documents };
      user.documentsValides = false; // Réinitialiser la validation
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Documents mis à jour avec succès',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des documents',
      error: error.message,
    });
  }
};

// @desc    Activer/Désactiver un utilisateur (Admin)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Compte ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message,
    });
  }
};

// @desc    Valider les documents (Admin)
// @route   PUT /api/users/:id/validate-documents
// @access  Private/Admin
export const validateDocuments = async (req, res) => {
  try {
    const { documentType, verified } = req.body; // 'idCard' ou 'drivingLicense'

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    if (documentType === 'idCard') {
      user.documents.idCard.verified = verified;
    } else if (documentType === 'drivingLicense') {
      user.documents.drivingLicense.verified = verified;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Type de document invalide',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Document ${verified ? 'validé' : 'rejeté'} avec succès`,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les chauffeurs (Public)
// @route   GET /api/users/chauffeurs
// @access  Public
export const getChauffeurs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const chauffeurs = await User.find({
      role: 'chauffeur',
      isActive: true,
      documentsValides: true,
    })
      .select('prenom nom telephone experienceAnnees langues noteMovenne nombreAvis avatar')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments({
      role: 'chauffeur',
      isActive: true,
      documentsValides: true,
    });

    res.status(200).json({
      success: true,
      count: chauffeurs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: chauffeurs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chauffeurs',
      error: error.message,
    });
  }
};

// @desc    Obtenir les statistiques d'un chauffeur (Public)
// @route   GET /api/users/chauffeurs/:id/stats
// @access  Public
export const getChauffeurStats = async (req, res) => {
  try {
    const chauffeur = await User.findOne({
      _id: req.params.id,
      role: 'chauffeur',
    });

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    const stats = await Reservation.aggregate([
      {
        $match: {
          chauffeur: chauffeur._id,
          statut: 'terminee',
        },
      },
      {
        $group: {
          _id: null,
          totalMissions: { $sum: 1 },
          totalKm: { $sum: '$kilometrage' },
        },
      },
    ]);

    const reviews = await Review.find({
      chauffeur: chauffeur._id,
    }).select('note');

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        chauffeur: {
          nom: chauffeur.nom,
          prenom: chauffeur.prenom,
          experienceAnnees: chauffeur.experienceAnnees,
          langues: chauffeur.langues,
        },
        stats: {
          totalMissions: stats[0]?.totalMissions || 0,
          totalKm: stats[0]?.totalKm || 0,
          noteMovenne: avgRating,
          nombreAvis: reviews.length,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Obtenir les chauffeurs disponibles (Admin)
// @route   GET /api/users/chauffeurs/available
// @access  Private/Admin
export const getAvailableChauffeurs = async (req, res) => {
  try {
    const chauffeurs = await User.find({
      role: 'chauffeur',
      isActive: true,
      'chauffeurProfile.availability': 'available',
    }).select('firstName lastName phone chauffeurProfile avatar');

    res.status(200).json({
      success: true,
      count: chauffeurs.length,
      data: chauffeurs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chauffeurs',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le profil chauffeur
// @route   PUT /api/users/:id/chauffeur-profile
// @access  Private/Chauffeur
export const updateChauffeurProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier que c'est bien un chauffeur
    if (user.role !== 'chauffeur') {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas un chauffeur',
      });
    }

    // Vérifier les permissions
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    const {
      experience,
      languages,
      specialties,
      availability,
    } = req.body;

    if (experience) user.chauffeurProfile.experience = experience;
    if (languages) user.chauffeurProfile.languages = languages;
    if (specialties) user.chauffeurProfile.specialties = specialties;
    if (availability) user.chauffeurProfile.availability = availability;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil chauffeur mis à jour',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    });
  }
};

// @desc    Obtenir les statistiques utilisateur
// @route   GET /api/users/:id/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Statistiques selon le rôle
    let stats = {};

    if (user.role === 'client') {
      const reservations = await Reservation.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
            totalSpent: { $sum: '$pricing.total' },
          },
        },
      ]);

      const reviews = await Review.countDocuments({ user: user._id });

      stats = {
        reservations: reservations[0] || {},
        reviewsGiven: reviews,
        loyaltyPoints: user.loyalty.points,
        loyaltyLevel: user.loyalty.level,
      };
    } else if (user.role === 'chauffeur') {
      const rides = await Reservation.aggregate([
        { $match: { chauffeur: user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalEarnings: { $sum: '$pricing.chauffeurTotal' },
          },
        },
      ]);

      stats = {
        rides: rides[0] || {},
        rating: user.chauffeurProfile.rating,
        totalRides: user.chauffeurProfile.totalRides,
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Obtenir les documents en attente de validation (Admin)
// @route   GET /api/users/documents/pending
// @access  Private/Admin
export const getPendingDocuments = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { 'documents.idCard.verified': false, 'documents.idCard.front': { $exists: true } },
        { 'documents.drivingLicense.verified': false, 'documents.drivingLicense.front': { $exists: true } },
      ],
    }).select('firstName lastName email phone documents');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error.message,
    });
  }
};
