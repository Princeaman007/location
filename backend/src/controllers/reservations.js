import Reservation from '../models/Reservation.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Obtenir toutes les réservations
// @route   GET /api/reservations
// @access  Private
export const getReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Construire le filtre selon le rôle
    const filter = {};
    
    if (req.user.role === 'client') {
      filter.user = req.user.id;
    } else if (req.user.role === 'chauffeur') {
      filter.chauffeur = req.user.id;
    }
    // Admin voit toutes les réservations

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Reservation.countDocuments(filter);

    const reservations = await Reservation.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year images pricing')
      .populate('chauffeur', 'firstName lastName phone email chauffeurProfile')
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
      error: error.message,
    });
  }
};

// @desc    Obtenir une réservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user')
      .populate('vehicle')
      .populate('chauffeur')
      .populate('delivery.chauffeur');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Vérifier les permissions
    if (
      req.user.role === 'client' &&
      reservation.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à cette réservation',
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation',
      error: error.message,
    });
  }
};

// @desc    Créer une réservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      serviceType,
      chauffeurService,
      pickup,
      return: returnInfo,
      additionalOptions,
    } = req.body;

    // Vérifier que le véhicule existe
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    // Vérifier disponibilité
    const conflictingReservations = await Reservation.find({
      vehicle: vehicleId,
      status: { $in: ['confirmed', 'in-progress'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (conflictingReservations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Le véhicule n\'est pas disponible pour ces dates',
      });
    }

    // Calculer les prix
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const vehicleTotal = vehicle.calculatePrice(duration);
    
    let chauffeurTotal = 0;
    if (serviceType === 'avec-chauffeur' && chauffeurService) {
      const rates = { '8h': 12000, '12h': 15000, '24h': 18000 };
      chauffeurTotal = rates[chauffeurService.formula] * duration;
    }

    const optionsTotal = additionalOptions?.reduce(
      (sum, opt) => sum + opt.price * opt.quantity,
      0
    ) || 0;

    const subtotal = vehicleTotal + chauffeurTotal + optionsTotal;

    // Appliquer réduction fidélité
    const user = await User.findById(req.user.id);
    let loyaltyDiscount = 0;
    if (user.loyalty && user.loyalty.points > 0) {
      loyaltyDiscount = Math.min(
        user.loyalty.points * 50, // 1 point = 50 FCFA
        subtotal * 0.15 // Max 15% de réduction
      );
    }

    const total = subtotal - loyaltyDiscount;

    // Créer la réservation
    const reservation = await Reservation.create({
      user: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      duration,
      serviceType,
      chauffeurService,
      pickup,
      return: returnInfo,
      additionalOptions,
      pricing: {
        vehicleTotal,
        chauffeurTotal,
        optionsTotal,
        subtotal,
        loyaltyDiscount,
        total,
      },
      payment: {
        method: req.body.paymentMethod || 'delivery-full',
        status: 'pending',
        remainingAmount: total,
      },
      status: 'pending',
    });

    // Mettre à jour le statut du véhicule
    vehicle.availability.status = 'loue';
    await vehicle.save();

    // Récupérer les informations complètes pour l'email
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('user', 'firstName lastName email phone')
      .populate('vehicle', 'brand model year images pricing');

    // Envoyer email de confirmation au client
    try {
      const startDateFormatted = new Date(startDate).toLocaleDateString('fr-FR');
      const endDateFormatted = new Date(endDate).toLocaleDateString('fr-FR');
      
      const clientEmailContent = `
        <h2>Confirmation de réservation - DCM groupe agence</h2>
        <p>Bonjour ${populatedReservation.user.firstName} ${populatedReservation.user.lastName},</p>
        <p>Nous avons bien reçu votre demande de réservation. Voici un récapitulatif :</p>
        
        <h3>📋 Détails de la réservation :</h3>
        <ul>
          <li><strong>Code de réservation :</strong> ${reservation.code}</li>
          <li><strong>Véhicule :</strong> ${populatedReservation.vehicle.brand} ${populatedReservation.vehicle.model} (${populatedReservation.vehicle.year})</li>
          <li><strong>Type de service :</strong> ${serviceType === 'self-drive' ? 'Sans chauffeur' : 'Avec chauffeur'}</li>
          <li><strong>Date de début :</strong> ${startDateFormatted}</li>
          <li><strong>Date de fin :</strong> ${endDateFormatted}</li>
          <li><strong>Durée :</strong> ${duration} jour(s)</li>
        </ul>
        
        <h3>💰 Tarification :</h3>
        <ul>
          <li>Location véhicule : ${vehicleTotal.toLocaleString()} FCFA</li>
          ${chauffeurTotal > 0 ? `<li>Service chauffeur : ${chauffeurTotal.toLocaleString()} FCFA</li>` : ''}
          ${optionsTotal > 0 ? `<li>Options supplémentaires : ${optionsTotal.toLocaleString()} FCFA</li>` : ''}
          ${loyaltyDiscount > 0 ? `<li>Réduction fidélité : -${loyaltyDiscount.toLocaleString()} FCFA</li>` : ''}
          <li><strong>Total à payer : ${total.toLocaleString()} FCFA</strong></li>
        </ul>
        
        ${pickup?.location ? `<h3>📍 Lieu de prise en charge :</h3><p>${pickup.location}</p>` : ''}
        
        <p><strong>Notre équipe vous contactera sous peu pour confirmer votre réservation et organiser la livraison.</strong></p>
        
        <p>Merci de votre confiance,<br>L'équipe DCM groupe agence</p>
      `;

      await sendEmail({
        email: populatedReservation.user.email,
        subject: `Confirmation de réservation - ${reservation.code}`,
        html: clientEmailContent,
      });

      // Envoyer email de notification à l'admin
      const adminEmailContent = `
        <h2>🚗 Nouvelle réservation reçue</h2>
        
        <h3>Informations client :</h3>
        <ul>
          <li><strong>Nom :</strong> ${populatedReservation.user.firstName} ${populatedReservation.user.lastName}</li>
          <li><strong>Email :</strong> ${populatedReservation.user.email}</li>
          <li><strong>Téléphone :</strong> ${populatedReservation.user.phone}</li>
        </ul>
        
        <h3>Détails de la réservation :</h3>
        <ul>
          <li><strong>Code :</strong> ${reservation.code}</li>
          <li><strong>Véhicule :</strong> ${populatedReservation.vehicle.brand} ${populatedReservation.vehicle.model} (${populatedReservation.vehicle.year})</li>
          <li><strong>Service :</strong> ${serviceType === 'self-drive' ? 'Sans chauffeur' : 'Avec chauffeur'}</li>
          <li><strong>Début :</strong> ${startDateFormatted}</li>
          <li><strong>Fin :</strong> ${endDateFormatted}</li>
          <li><strong>Durée :</strong> ${duration} jour(s)</li>
          <li><strong>Montant total :</strong> ${total.toLocaleString()} FCFA</li>
        </ul>
        
        ${pickup?.location ? `<p><strong>Lieu de prise en charge :</strong> ${pickup.location}</p>` : ''}
        
        <p><strong>Action requise :</strong> Contacter le client pour confirmer la réservation.</p>
      `;

      await sendEmail({
        email: process.env.FROM_EMAIL,
        subject: `Nouvelle réservation - ${reservation.code}`,
        html: adminEmailContent,
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas bloquer la création de réservation si l'email échoue
    }

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la réservation',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour une réservation
// @route   PUT /api/reservations/:id
// @access  Private
export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Vérifier les permissions
    if (
      req.user.role === 'client' &&
      reservation.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette réservation',
      });
    }

    // Ne pas permettre la modification si déjà en cours ou terminée
    if (['in-progress', 'completed'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une réservation en cours ou terminée',
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      data: updatedReservation,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la réservation',
      error: error.message,
    });
  }
};

// @desc    Annuler une réservation
// @route   DELETE /api/reservations/:id
// @access  Private
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Vérifier les permissions
    if (
      req.user.role === 'client' &&
      reservation.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à annuler cette réservation',
      });
    }

    // Ne pas permettre l'annulation si déjà en cours
    if (reservation.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'annuler une réservation en cours',
      });
    }

    reservation.status = 'cancelled';
    reservation.cancelledBy = req.user.id;
    reservation.cancelledAt = Date.now();
    reservation.cancellationReason = req.body.reason;
    await reservation.save();

    // Remettre le véhicule disponible
    await Vehicle.findByIdAndUpdate(reservation.vehicle, {
      'availability.status': 'disponible',
    });

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation',
      error: error.message,
    });
  }
};

// @desc    Confirmer une réservation (Admin)
// @route   PUT /api/reservations/:id/confirm
// @access  Private/Admin
export const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    if (!reservation.documentsVerified) {
      return res.status(400).json({
        success: false,
        message: 'Les documents doivent être vérifiés avant confirmation',
      });
    }

    reservation.status = 'confirmed';
    await reservation.save();

    // Ajouter points de fidélité
    const user = await User.findById(reservation.user);
    const points = reservation.duration * 10;
    user.loyalty.points += points;
    user.calculateLoyaltyLevel();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Réservation confirmée avec succès',
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation',
      error: error.message,
    });
  }
};

// @desc    Valider les documents (Admin)
// @route   PUT /api/reservations/:id/validate-documents
// @access  Private/Admin
export const validateDocuments = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { documentsVerified: true },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Documents validés avec succès',
      data: reservation,
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
