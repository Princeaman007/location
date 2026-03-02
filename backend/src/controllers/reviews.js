import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

// @desc    Obtenir les avis d'un véhicule
// @route   GET /api/reviews/:vehicleId
// @access  Public
export const getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { rating, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filter = { 
      vehicle: vehicleId,
      isApproved: true,
    };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName avatar')
      .populate('reservation', 'code startDate endDate')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Calculer les statistiques
    const stats = await Review.aggregate([
      { $match: { vehicle: vehicleId, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || {},
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message,
    });
  }
};

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const {
      reservationId,
      vehicleId,
      rating,
      comment,
      photos,
      detailedRating,
      chauffeurRating,
    } = req.body;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    // Vérifier que la réservation est terminée
    if (reservation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Vous pouvez seulement laisser un avis après avoir terminé la location',
      });
    }

    // Vérifier qu'un avis n'existe pas déjà
    const existingReview = await Review.findOne({ reservation: reservationId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour cette réservation',
      });
    }

    // Créer l'avis
    const review = await Review.create({
      user: req.user.id,
      vehicle: vehicleId,
      reservation: reservationId,
      rating,
      comment,
      photos,
      detailedRating,
      chauffeurRating,
    });

    // Ajouter des points de fidélité
    const user = await User.findById(req.user.id);
    user.loyalty.points += 20; // 20 points pour un avis
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès. +20 points de fidélité!',
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour un avis
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Vérifier que c'est l'auteur de l'avis
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet avis',
      });
    }

    const { rating, comment, photos, detailedRating } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.photos = photos || review.photos;
    review.detailedRating = detailedRating || review.detailedRating;
    
    // Remettre en attente d'approbation après modification
    review.isApproved = false;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Avis mis à jour avec succès',
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'avis',
      error: error.message,
    });
  }
};

// @desc    Supprimer un avis
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    // Vérifier que c'est l'auteur ou admin
    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet avis',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Avis supprimé avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis',
      error: error.message,
    });
  }
};

// @desc    Répondre à un avis (Admin)
// @route   POST /api/reviews/:id/respond
// @access  Private/Admin
export const respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;
    
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    review.adminResponse = {
      comment,
      respondedBy: req.user.id,
      respondedAt: Date.now(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Réponse ajoutée avec succès',
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réponse',
      error: error.message,
    });
  }
};

// @desc    Approuver/Rejeter un avis (Admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
export const approveReview = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: `Avis ${isApproved ? 'approuvé' : 'rejeté'} avec succès`,
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modération',
      error: error.message,
    });
  }
};

// @desc    Marquer un avis comme utile
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Merci pour votre retour',
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur',
      error: error.message,
    });
  }
};

// @desc    Obtenir tous les avis en attente (Admin)
// @route   GET /api/reviews/pending
// @access  Private/Admin
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'firstName lastName')
      .populate('vehicle', 'brand model')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message,
    });
  }
};
