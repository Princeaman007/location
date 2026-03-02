import Reservation from '../models/Reservation.js';
import AirportTransfer from '../models/AirportTransfer.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import sendEmail from '../utils/sendEmail.js';
import { chauffeurAssignmentTemplate, chauffeurTransferAssignmentTemplate } from '../utils/emailTemplates.js';

// @desc    Obtenir les statistiques du dashboard admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    // Date du mois en cours
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // Récupérer tous les véhicules
    const vehicles = await Vehicle.find();
    const totalVehicules = vehicles.length;

    // Récupérer toutes les réservations
    const reservations = await Reservation.find();
    const totalReservations = reservations.length;

    // Réservations du mois en cours
    const reservationsThisMonth = await Reservation.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Réservations en cours (confirmées ou en cours)
    const reservationsEnCours = await Reservation.countDocuments({
      status: { $in: ['confirmed', 'in-progress'] },
    });

    // Récupérer tous les utilisateurs
    const totalUtilisateurs = await User.countDocuments();

    // Récupérer tous les transferts d'aéroport
    const transferts = await AirportTransfer.find();
    const totalTransferts = transferts.length;

    // Transferts du mois en cours
    const transfertsThisMonth = await AirportTransfer.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Transferts en cours
    const transfertsEnCours = await AirportTransfer.countDocuments({
      statut: { $in: ['en_attente', 'contacte', 'confirme'] },
    });

    // Calculer les revenus du mois - Revenus des réservations payées
    const reservationsPaidThisMonth = await Reservation.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      'payment.status': 'paid',
    });

    const revenusReservationsMois = reservationsPaidThisMonth.reduce(
      (sum, reservation) => sum + (reservation.pricing?.total || 0), 
      0
    );

    // Calculer les revenus des paiements en ligne du mois
    const paiementsThisMonth = await Payment.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completed',
    });

    const revenusPaiementsMois = paiementsThisMonth.reduce(
      (sum, payment) => sum + payment.amount, 
      0
    );

    // Ajouter les revenus des transferts d'aéroport du mois (terminés)
    const transfertsCompletedThisMonth = transfertsThisMonth.filter(
      t => t.statut === 'termine'
    );
    const revenusTransfertsThisMonth = transfertsCompletedThisMonth.reduce(
      (sum, transfer) => sum + (transfer.tarif || 0), 
      0
    );

    const totalRevenusMois = revenusReservationsMois + revenusPaiementsMois + revenusTransfertsThisMonth;

    // Paiements en attente
    const paiementsEnAttente = await Payment.countDocuments({
      status: { $in: ['pending', 'processing'] },
    });

    // Avis en attente de modération
    const avisEnAttente = await Review.countDocuments({
      statut: 'en_attente',
    });

    // Calculer le taux d'occupation
    const vehiculesEnLocation = await Reservation.countDocuments({
      status: 'in-progress',
    });
    const tauxOccupation = totalVehicules > 0 
      ? Math.round((vehiculesEnLocation / totalVehicules) * 100) 
      : 0;

    // Retourner les stats
    res.status(200).json({
      success: true,
      data: {
        totalVehicules,
        totalReservations,
        totalUtilisateurs,
        totalTransferts,
        revenusMoisCourant: totalRevenusMois,
        reservationsEnCours,
        transfertsEnCours,
        tauxOccupation,
        paiementsEnAttente,
        avisEnAttente,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};

// @desc    Obtenir toutes les réservations pour l'admin
// @route   GET /api/admin/reservations
// @access  Private/Admin
export const getAllReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year images pricing category')
      .populate('chauffeur', 'firstName lastName phone')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reservations,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les transferts d'aéroport pour l'admin
// @route   GET /api/admin/airport-transfers
// @access  Private/Admin
export const getAllAirportTransfers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.statut = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AirportTransfer.countDocuments(filter);

    const transfers = await AirportTransfer.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicule', 'brand model year')
      .populate('chauffeur', 'firstName lastName phone')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: transfers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transfers,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transferts',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les utilisateurs pour l'admin
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;

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
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les paiements pour l'admin
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('reservation', 'code')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: payments,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les avis pour l'admin
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.statut = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('vehicle', 'brand model year')
      .populate('reservation', 'code')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reviews,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'une réservation
// @route   PUT /api/admin/reservations/:id/status
// @access  Private/Admin
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Mettre à jour le statut de la réservation
    reservation.status = status;

    // Si la réservation est marquée comme terminée, marquer le paiement comme payé
    if (status === 'completed' && reservation.payment.status !== 'paid') {
      reservation.payment.status = 'paid';
      reservation.payment.paidAmount = reservation.pricing.total;
      reservation.payment.paidAt = new Date();
    }

    await reservation.save();

    // Recharger avec les populations
    const updatedReservation = await Reservation.findById(reservation._id)
      .populate('user vehicle chauffeur');

    res.status(200).json({
      success: true,
      data: updatedReservation,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'un transfert
// @route   PUT /api/admin/airport-transfers/:id/status
// @access  Private/Admin
export const updateTransferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const transfer = await AirportTransfer.findByIdAndUpdate(
      req.params.id,
      { statut: status },
      { new: true, runValidators: true }
    ).populate('user vehicule chauffeur');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfert non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    });
  }
};

// @desc    Valider les documents d'un utilisateur
// @route   PUT /api/admin/users/:id/validate-documents
// @access  Private/Admin
export const validateUserDocuments = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { documentsVerifies: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation',
      error: error.message,
    });
  }
};

// @desc    Approuver un avis
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin  
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { statut: 'approuve' },
      { new: true }
    ).populate('user vehicle');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
      error: error.message,
    });
  }
};

// @desc    Rejeter un avis
// @route   PUT /api/admin/reviews/:id/reject
// @access  Private/Admin
export const rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { statut: 'rejete' },
      { new: true }
    ).populate('user vehicle');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet',
      error: error.message,
    });
  }
};

// @desc    Obtenir la liste des chauffeurs disponibles
// @route   GET /api/admin/chauffeurs
// @access  Private/Admin
export const getAllChauffeurs = async (req, res) => {
  try {
    const { disponible } = req.query;
    
    const filter = { role: 'chauffeur' };
    if (disponible) {
      filter['chauffeurProfile.availability'] = disponible;
    }

    const chauffeurs = await User.find(filter)
      .select('firstName lastName email phone chauffeurProfile documents isActive createdAt')
      .sort('lastName');

    res.status(200).json({
      success: true,
      count: chauffeurs.length,
      data: chauffeurs,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des chauffeurs',
      error: error.message,
    });
  }
};

// @desc    Créer un nouveau chauffeur
// @route   POST /api/admin/chauffeurs
// @access  Private/Admin
export const createChauffeur = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      city,
      experience,
      languages,
      specialties 
    } = req.body;

    // Vérifier si l'email ou le téléphone existe déjà
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur existe déjà avec cet email ou téléphone',
      });
    }

    // Créer le chauffeur
    const chauffeur = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      role: 'chauffeur',
      isEmailVerified: true, // Validé automatiquement par l'admin
      isPhoneVerified: true,
      chauffeurProfile: {
        experience: experience || 0,
        languages: languages || ['Français'],
        specialties: specialties || [],
        availability: 'available',
        rating: 0,
        totalRides: 0,
      }
    });

    // Retourner sans le mot de passe
    const chauffeurData = await User.findById(chauffeur._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Chauffeur créé avec succès',
      data: chauffeurData,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Obtenir un chauffeur par ID
// @route   GET /api/admin/chauffeurs/:id
// @access  Private/Admin
export const getChauffeurById = async (req, res) => {
  try {
    const chauffeur = await User.findOne({ 
      _id: req.params.id, 
      role: 'chauffeur' 
    }).select('-password');

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: chauffeur,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour un chauffeur
// @route   PUT /api/admin/chauffeurs/:id
// @access  Private/Admin
export const updateChauffeur = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone,
      city,
      experience,
      languages,
      specialties,
      availability,
      isActive
    } = req.body;

    const chauffeur = await User.findOne({ 
      _id: req.params.id, 
      role: 'chauffeur' 
    });

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    // Vérifier si email/phone existe déjà chez un autre utilisateur
    if (email && email !== chauffeur.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé',
        });
      }
    }

    if (phone && phone !== chauffeur.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: req.params.id } });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Ce téléphone est déjà utilisé',
        });
      }
    }

    // Mettre à jour les champs
    if (firstName) chauffeur.firstName = firstName;
    if (lastName) chauffeur.lastName = lastName;
    if (email) chauffeur.email = email;
    if (phone) chauffeur.phone = phone;
    if (city) chauffeur.city = city;
    if (isActive !== undefined) chauffeur.isActive = isActive;

    // Mettre à jour le profil chauffeur
    if (experience !== undefined) chauffeur.chauffeurProfile.experience = experience;
    if (languages) chauffeur.chauffeurProfile.languages = languages;
    if (specialties) chauffeur.chauffeurProfile.specialties = specialties;
    if (availability) chauffeur.chauffeurProfile.availability = availability;

    await chauffeur.save();

    const updatedChauffeur = await User.findById(req.params.id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Chauffeur mis à jour avec succès',
      data: updatedChauffeur,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Supprimer un chauffeur
// @route   DELETE /api/admin/chauffeurs/:id
// @access  Private/Admin
export const deleteChauffeur = async (req, res) => {
  try {
    const chauffeur = await User.findOne({ 
      _id: req.params.id, 
      role: 'chauffeur' 
    });

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    // Vérifier s'il a des réservations en cours
    const activeReservations = await Reservation.countDocuments({
      chauffeur: req.params.id,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un chauffeur avec des réservations en cours',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chauffeur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Attribuer un chauffeur à une réservation
// @route   PUT /api/admin/reservations/:id/assign-chauffeur
// @access  Private/Admin
export const assignChauffeurToReservation = async (req, res) => {
  try {
    const { chauffeurId } = req.body;

    // Vérifier que le chauffeur existe et est bien un chauffeur
    const chauffeur = await User.findOne({ 
      _id: chauffeurId, 
      role: 'chauffeur' 
    });

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    // Mettre à jour la réservation
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        chauffeur: chauffeurId,
        status: 'confirmed' // Confirmer automatiquement la réservation
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone')
    .populate('vehicle', 'brand model year images')
    .populate('chauffeur', 'firstName lastName phone email chauffeurProfile');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Optionnel : Mettre à jour la disponibilité du chauffeur
    await User.findByIdAndUpdate(chauffeurId, {
      'chauffeurProfile.availability': 'busy'
    });

    // Envoyer un email au client avec les informations du chauffeur
    try {
      const reservationDetails = {
        code: reservation._id.toString().slice(-8).toUpperCase(),
        vehicle: `${reservation.vehicle.brand} ${reservation.vehicle.model} (${reservation.vehicle.year})`,
        startDate: new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        endDate: new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        pickupLocation: reservation.pickupLocation || 'À définir'
      };

      const chauffeurDetails = {
        fullName: `${reservation.chauffeur.firstName} ${reservation.chauffeur.lastName}`,
        initials: `${reservation.chauffeur.firstName.charAt(0)}${reservation.chauffeur.lastName.charAt(0)}`.toUpperCase(),
        phone: reservation.chauffeur.phone,
        email: reservation.chauffeur.email,
        rating: reservation.chauffeur.chauffeurProfile?.rating || 5,
        experience: reservation.chauffeur.chauffeurProfile?.experience || 'Non spécifié',
        languages: reservation.chauffeur.chauffeurProfile?.languages?.join(', ') || null
      };

      const html = chauffeurAssignmentTemplate(
        reservation.user.firstName,
        reservationDetails,
        chauffeurDetails
      );

      await sendEmail({
        email: reservation.user.email,
        subject: 'Chauffeur attribué à votre réservation - DCM groupe agence',
        html
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'email échoue
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur attribué avec succès',
      data: reservation,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Retirer un chauffeur d'une réservation
// @route   DELETE /api/admin/reservations/:id/remove-chauffeur
// @access  Private/Admin
export const removeChauffeurFromReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    const oldChauffeurId = reservation.chauffeur;

    // Retirer le chauffeur
    reservation.chauffeur = null;
    await reservation.save();

    await reservation.populate('user vehicle');

    // Optionnel : Libérer le chauffeur
    if (oldChauffeurId) {
      await User.findByIdAndUpdate(oldChauffeurId, {
        'chauffeurProfile.availability': 'available'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur retiré avec succès',
      data: reservation,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Attribuer un chauffeur à un transfert aéroport
// @route   PUT /api/admin/airport-transfers/:id/assign-chauffeur
// @access  Private/Admin
export const assignChauffeurToTransfer = async (req, res) => {
  try {
    const { chauffeurId } = req.body;

    // Vérifier que le chauffeur existe et est bien un chauffeur
    const chauffeur = await User.findOne({ 
      _id: chauffeurId, 
      role: 'chauffeur' 
    });

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur non trouvé',
      });
    }

    // Mettre à jour le transfert
    const transfer = await AirportTransfer.findByIdAndUpdate(
      req.params.id,
      { 
        chauffeur: chauffeurId,
        statut: 'confirme' // Confirmer automatiquement le transfert
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone')
    .populate('chauffeur', 'firstName lastName phone email chauffeurProfile')
    .populate('vehicule', 'brand model year');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfert non trouvé',
      });
    }

    // Optionnel : Mettre à jour la disponibilité du chauffeur
    await User.findByIdAndUpdate(chauffeurId, {
      'chauffeurProfile.availability': 'busy'
    });

    // Envoyer un email au client avec les informations du chauffeur
    try {
      const transferDetails = {
        type: transfer.typeTransfert,
        flightNumber: transfer.numeroVol || null,
        date: new Date(transfer.dateTransfert).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        }),
        time: new Date(transfer.dateTransfert).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        from: transfer.typeTransfert === 'arrivee' ? transfer.aeroportDepart : transfer.lieuPriseEnCharge,
        to: transfer.typeTransfert === 'arrivee' ? transfer.destination : transfer.aeroportArrivee,
        passengers: transfer.nombrePassagers,
        pickupTime: '30 minutes'
      };

      const chauffeurDetails = {
        fullName: `${transfer.chauffeur.firstName} ${transfer.chauffeur.lastName}`,
        initials: `${transfer.chauffeur.firstName.charAt(0)}${transfer.chauffeur.lastName.charAt(0)}`.toUpperCase(),
        phone: transfer.chauffeur.phone,
        email: transfer.chauffeur.email,
        rating: transfer.chauffeur.chauffeurProfile?.rating || 5,
        experience: transfer.chauffeur.chauffeurProfile?.experience || 'Non spécifié',
        languages: transfer.chauffeur.chauffeurProfile?.languages?.join(', ') || null
      };

      const html = chauffeurTransferAssignmentTemplate(
        transfer.user.firstName,
        transferDetails,
        chauffeurDetails
      );

      await sendEmail({
        email: transfer.user.email,
        subject: 'Chauffeur attribué à votre transfert aéroport - DCM groupe agence',
        html
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'email échoue
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur attribué au transfert avec succès',
      data: transfer,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'attribution du chauffeur',
      error: error.message,
    });
  }
};

// @desc    Retirer un chauffeur d'un transfert aéroport
// @route   DELETE /api/admin/airport-transfers/:id/remove-chauffeur
// @access  Private/Admin
export const removeChauffeurFromTransfer = async (req, res) => {
  try {
    const transfer = await AirportTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfert non trouvé',
      });
    }

    const oldChauffeurId = transfer.chauffeur;

    // Retirer le chauffeur
    transfer.chauffeur = null;
    await transfer.save();

    await transfer.populate('user vehicule');

    // Optionnel : Libérer le chauffeur
    if (oldChauffeurId) {
      await User.findByIdAndUpdate(oldChauffeurId, {
        'chauffeurProfile.availability': 'available'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur retiré du transfert avec succès',
      data: transfer,
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait du chauffeur',
      error: error.message,
    });
  }
};
