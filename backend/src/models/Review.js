import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    
    // Notation
    rating: {
      type: Number,
      required: [true, 'La note est requise'],
      min: 1,
      max: 5,
    },
    
    // Avis détaillé
    comment: {
      type: String,
      required: [true, 'Le commentaire est requis'],
      minlength: 10,
      maxlength: 1000,
    },
    
    // Photos optionnelles
    photos: [String],
    
    // Évaluation détaillée
    detailedRating: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      comfort: {
        type: Number,
        min: 1,
        max: 5,
      },
      performance: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    
    // Si avec chauffeur
    chauffeurRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
    },
    
    // Réponse admin
    adminResponse: {
      comment: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
    
    // Statut
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    
    // Utile
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Un seul avis par réservation
reviewSchema.index({ reservation: 1 }, { unique: true });
reviewSchema.index({ vehicle: 1, isApproved: 1 });

// Calculer la note moyenne du véhicule après ajout/modification
reviewSchema.statics.calcAverageRatings = async function (vehicleId) {
  const stats = await this.aggregate([
    {
      $match: { vehicle: vehicleId, isApproved: true },
    },
    {
      $group: {
        _id: '$vehicle',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Vehicle').findByIdAndUpdate(vehicleId, {
      'stats.averageRating': stats[0]?.averageRating || 0,
      'stats.totalReviews': stats[0]?.totalReviews || 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Mettre à jour les stats après sauvegarde
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.vehicle);
});

// Mettre à jour les stats avant suppression
reviewSchema.pre('remove', function () {
  this.constructor.calcAverageRatings(this.vehicle);
});

export default mongoose.model('Review', reviewSchema);
