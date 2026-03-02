import Vehicle from '../models/Vehicle.js';
import Reservation from '../models/Reservation.js';
import { uploadMultipleToCloudinary, deleteMultipleFromCloudinary } from '../utils/cloudinaryUpload.js';
import { getStartingPrice, calculateRentalPrice, validateReservationPeriod } from '../utils/pricingUtils.js';

// @desc    Obtenir tous les véhicules
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req, res) => {
  try {
    const {
      category,
      categorie, // Support français
      priceMin,
      prixMin, // Support français
      priceMax,
      prixMax, // Support français
      transmission,
      seats,
      nombrePlaces, // Support français
      city,
      ville, // Support français
      chauffeurAvailable,
      withDriver, // Support français
      startDate,
      endDate,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    // Construire le filtre
    const filter = { isActive: true };

    // Accepter les paramètres en français et en anglais
    if (category || categorie) filter.category = category || categorie;
    if (transmission) filter['specifications.transmission'] = transmission;
    if (seats || nombrePlaces) filter['specifications.seats'] = parseInt(seats || nombrePlaces);
    if (city || ville) filter['availability.cities'] = city || ville;
    if (chauffeurAvailable || withDriver) {
      filter.chauffeurAvailable = (chauffeurAvailable === 'true') || (withDriver === 'true');
    }
    
    const minPrice = priceMin || prixMin;
    const maxPrice = priceMax || prixMax;
    if (minPrice || maxPrice) {
      filter['pricing.daily'] = {};
      if (minPrice) filter['pricing.daily'].$gte = parseInt(minPrice);
      if (maxPrice) filter['pricing.daily'].$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Si des dates sont spécifiées, filtrer les véhicules non disponibles
    let vehicleIds = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Trouver les réservations qui se chevauchent avec les dates demandées
      const conflictingReservations = await Reservation.find({
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
          { startDate: { $gte: start, $lte: end } },
          { endDate: { $gte: start, $lte: end } }
        ],
        status: { $in: ['pending', 'confirmed'] }
      }).distinct('vehicle');
      
      // Exclure les véhicules avec des réservations conflictuelles
      if (conflictingReservations.length > 0) {
        filter._id = { $nin: conflictingReservations };
      }
    }

    const total = await Vehicle.countDocuments(filter);

    const vehicles = await Vehicle.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Ajouter le prix "À partir de" pour chaque véhicule
    const vehiclesWithStartingPrice = vehicles.map(vehicle => {
      const vehicleObj = vehicle.toObject();
      vehicleObj.startingPrice = getStartingPrice(vehicle.pricing.daily);
      return vehicleObj;
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: vehiclesWithStartingPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules',
      error: error.message,
    });
  }
};

// @desc    Obtenir un véhicule par ID ou slug
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher par ID ou slug
    const vehicle = await Vehicle.findOne({
      $or: [{ _id: id }, { slug: id }],
      isActive: true,
    }).populate('reviews');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du véhicule',
      error: error.message,
    });
  }
};

// @desc    Créer un véhicule
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
  try {
    console.log('=== DÉBUT CRÉATION VÉHICULE ===');
    console.log('req.body.data:', req.body.data);
    console.log('req.files:', req.files);
    
    const vehicleData = JSON.parse(req.body.data || '{}');
    console.log('📦 Données parsées:', JSON.stringify(vehicleData, null, 2));
    
    // Validations supplémentaires
    if (!vehicleData.brand || !vehicleData.model) {
      console.log('❌ Validation échouée: marque ou modèle manquant');
      return res.status(400).json({
        success: false,
        message: 'La marque et le modèle sont requis',
        error: 'Missing brand or model',
      });
    }

    if (!vehicleData.pricing || !vehicleData.pricing.daily) {
      console.log('❌ Validation échouée: prix journalier manquant');
      return res.status(400).json({
        success: false,
        message: 'Le prix journalier est requis',
        error: 'Missing daily price',
      });
    }

    // Calculer prix hebdomadaire et mensuel si non fournis
    if (!vehicleData.pricing.weekly) {
      // -10% pour une semaine
      vehicleData.pricing.weekly = Math.round(vehicleData.pricing.daily * 7 * 0.9);
    }
    if (!vehicleData.pricing.monthly) {
      // -30% pour un mois
      vehicleData.pricing.monthly = Math.round(vehicleData.pricing.daily * 30 * 0.7);
    }
    
    console.log('💰 Pricing calculé:', vehicleData.pricing);
    
    // Uploader les images sur Cloudinary si présentes
    if (req.files && req.files.length > 0) {
      console.log(`📸 Upload de ${req.files.length} images sur Cloudinary...`);
      const uploadedImages = await uploadMultipleToCloudinary(req.files, 'vehicles');
      console.log('✅ Images uploadées:', uploadedImages);
      
      // Marquer la première image comme primaire si aucune n'est spécifiée
      vehicleData.images = uploadedImages.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: index === 0,
      }));
    } else {
      console.log('ℹ️ Aucune image à uploader');
    }

    console.log('💾 Création du véhicule dans MongoDB...');
    const vehicle = await Vehicle.create(vehicleData);
    console.log('✅ Véhicule créé avec succès:', vehicle._id);

    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      data: vehicle,
    });
  } catch (error) {
    console.error('=== ERREUR CRÉATION VÉHICULE ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du véhicule',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined,
    });
  }
};

// @desc    Mettre à jour un véhicule
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    const updateData = req.body.data ? JSON.parse(req.body.data) : req.body;

    // Uploader les nouvelles images si présentes
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleToCloudinary(req.files, 'vehicles');
      
      const newImages = uploadedImages.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: false,
      }));

      // Ajouter les nouvelles images aux existantes
      updateData.images = [...(vehicle.images || []), ...newImages];
    }

    // Mettre à jour le véhicule
    Object.assign(vehicle, updateData);
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du véhicule',
      error: error.message,
    });
  }
};

// @desc    Supprimer un véhicule
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    // Soft delete
    vehicle.isActive = false;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Véhicule supprimé avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du véhicule',
      error: error.message,
    });
  }
};

// @desc    Supprimer une image d'un véhicule
// @route   DELETE /api/vehicles/:id/images/:imageId
// @access  Private/Admin
export const deleteVehicleImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    // Trouver l'image
    const image = vehicle.images.id(imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image non trouvée',
      });
    }

    // Supprimer de Cloudinary
    if (image.publicId) {
      await deleteMultipleFromCloudinary([image.publicId]);
    }

    // Retirer l'image du document
    vehicle.images.pull(imageId);
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Image supprimée avec succès',
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image',
      error: error.message,
    });
  }
};

// @desc    Définir l'image principale
// @route   PUT /api/vehicles/:id/images/:imageId/primary
// @access  Private/Admin
export const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    // Retirer isPrimary de toutes les images
    vehicle.images.forEach(img => {
      img.isPrimary = false;
    });

    // Définir l'image comme primaire
    const image = vehicle.images.id(imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image non trouvée',
      });
    }

    image.isPrimary = true;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Image principale définie avec succès',
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition de l\'image principale',
      error: error.message,
    });
  }
};

// @desc    Vérifier disponibilité véhicule
// @route   GET /api/vehicles/:id/availability
// @access  Public
export const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    // Vérifier les réservations existantes
    const conflictingReservations = await Reservation.find({
      vehicle: id,
      status: { $in: ['confirmed', 'in-progress'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    const isAvailable = conflictingReservations.length === 0;

    res.status(200).json({
      success: true,
      data: {
        isAvailable,
        conflictingDates: conflictingReservations.map(r => ({
          startDate: r.startDate,
          endDate: r.endDate,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité',
      error: error.message,
    });
  }
};

// @desc    Obtenir les véhicules populaires
// @route   GET /api/vehicles/featured/popular
// @access  Public
export const getPopularVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      isActive: true,
      isFeatured: true,
    })
      .sort('-stats.totalRentals')
      .limit(8);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules populaires',
      error: error.message,
    });
  }
};

// @desc    Calculer le prix d'une location
// @route   POST /api/vehicles/calculate-price
// @access  Public
export const calculatePrice = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, withChauffeur, options } = req.body;

    // Validation des dates
    const validation = validateReservationPeriod(startDate, endDate);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Récupérer le véhicule
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé',
      });
    }

    if (!vehicle.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce véhicule n\'est pas disponible',
      });
    }

    // Calculer le prix
    const pricing = calculateRentalPrice({
      dailyRate: vehicle.pricing.daily,
      numberOfDays: validation.numberOfDays,
      withChauffeur,
      chauffeurDailyRate: vehicle.pricing.chauffeurSupplement || 15000,
      options: options || [],
    });

    res.status(200).json({
      success: true,
      data: {
        ...pricing,
        vehicle: {
          id: vehicle._id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
        },
        period: {
          startDate,
          endDate,
          numberOfDays: validation.numberOfDays,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du prix',
      error: error.message,
    });
  }
};
