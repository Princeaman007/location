import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    
    // Références
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
    chauffeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Dates
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // en jours
      required: true,
    },

    // Type de service
    serviceType: {
      type: String,
      enum: ['sans-chauffeur', 'avec-chauffeur'],
      required: true,
    },
    
    // Si avec chauffeur
    chauffeurService: {
      formula: {
        type: String,
        enum: ['8h', '12h', '24h'],
      },
      accommodation: {
        type: String,
        enum: ['client', 'included'],
      },
      dailyRate: Number,
    },

    // Lieux
    pickup: {
      type: {
        type: String,
        enum: ['delivery', 'agency'],
        required: true,
      },
      location: {
        city: String,
        address: String,
        commune: String,
        landmark: String,
        agencyId: String,
      },
      time: Date,
    },
    
    return: {
      type: {
        type: String,
        enum: ['delivery', 'agency', 'same'],
        required: true,
      },
      location: {
        city: String,
        address: String,
        commune: String,
        landmark: String,
        agencyId: String,
      },
      time: Date,
    },

    // Options additionnelles
    additionalOptions: [{
      name: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1,
      },
    }],

    // Tarification
    pricing: {
      vehicleTotal: {
        type: Number,
        required: true,
      },
      chauffeurTotal: {
        type: Number,
        default: 0,
      },
      optionsTotal: {
        type: Number,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      loyaltyDiscount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },

    // Paiement
    payment: {
      method: {
        type: String,
        enum: ['delivery-full', 'delivery-deposit', 'online'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'deposit-paid', 'paid', 'refunded'],
        default: 'pending',
      },
      depositAmount: Number,
      depositPaidAt: Date,
      remainingAmount: Number,
      paidAmount: {
        type: Number,
        default: 0,
      },
      paidAt: Date,
      paymentProvider: String, // cinetpay, fedapay, stripe
      transactionId: String,
    },

    // Statut
    status: {
      type: String,
      enum: [
        'pending',        // En attente validation
        'confirmed',      // Confirmée
        'documents-pending', // Documents en attente
        'in-progress',    // En cours
        'completed',      // Terminée
        'cancelled',      // Annulée
      ],
      default: 'pending',
    },

    // Documents client vérifiés
    documentsVerified: {
      type: Boolean,
      default: false,
    },

    // Livraison
    delivery: {
      status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'delivered'],
        default: 'pending',
      },
      chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      assignedAt: Date,
      deliveredAt: Date,
      
      // État des lieux départ
      condition: {
        photos: [String],
        mileage: Number,
        fuelLevel: {
          type: String,
          enum: ['empty', '1/4', '1/2', '3/4', 'full'],
        },
        damages: [{
          description: String,
          photo: String,
        }],
        notes: String,
      },
      
      // Signature contrat
      contractSigned: {
        type: Boolean,
        default: false,
      },
      signatureUrl: String,
    },

    // Retour
    return: {
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'returned', 'late'],
        default: 'pending',
      },
      returnedAt: Date,
      
      // État des lieux retour
      condition: {
        photos: [String],
        mileage: Number,
        fuelLevel: String,
        damages: [{
          description: String,
          photo: String,
          cost: Number,
        }],
        notes: String,
      },
      
      // Frais supplémentaires
      lateFees: {
        type: Number,
        default: 0,
      },
      damageFees: {
        type: Number,
        default: 0,
      },
      fuelFees: {
        type: Number,
        default: 0,
      },
    },

    // Notes internes
    adminNotes: String,
    
    // Raison annulation
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,

    // Prolongation
    extensionRequested: {
      type: Boolean,
      default: false,
    },
    extensionDetails: {
      newEndDate: Date,
      additionalDays: Number,
      additionalCost: Number,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Générer code unique avant sauvegarde
reservationSchema.pre('save', async function (next) {
  if (!this.code) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Compter les réservations du jour
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });
    
    this.code = `RV${year}${month}${day}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Calculer la durée
reservationSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

// Index
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
reservationSchema.index({ status: 1 });

export default mongoose.model('Reservation', reservationSchema);
