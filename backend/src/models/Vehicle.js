import mongoose from 'mongoose';
import slugify from 'slugify';

const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'La marque est requise'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Le modèle est requis'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "L'année est requise"],
      min: 2010,
      max: new Date().getFullYear() + 1,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'La catégorie est requise'],
      enum: ['economique', 'berline', 'suv', '4x4', 'minibus', 'luxe'],
    },
    registration: {
      type: String,
      required: [true, "L'immatriculation est requise"],
      unique: true,
      uppercase: true,
    },
    
    // Caractéristiques
    specifications: {
      transmission: {
        type: String,
        enum: ['manuelle', 'automatique'],
        required: true,
      },
      fuel: {
        type: String,
        enum: ['essence', 'diesel', 'hybride', 'electrique'],
        required: true,
      },
      seats: {
        type: Number,
        required: true,
        min: 2,
        max: 15,
      },
      doors: {
        type: Number,
        required: true,
        min: 2,
        max: 5,
      },
      color: String,
      mileage: {
        type: Number,
        default: 0,
      },
      features: {
        airConditioning: {
          type: Boolean,
          default: false,
        },
        gps: {
          type: Boolean,
          default: false,
        },
        bluetooth: {
          type: Boolean,
          default: false,
        },
        camera: {
          type: Boolean,
          default: false,
        },
        sunroof: {
          type: Boolean,
          default: false,
        },
        leatherSeats: {
          type: Boolean,
          default: false,
        },
        cruiseControl: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Images
    images: [{
      url: String,
      publicId: String,
      isPrimary: {
        type: Boolean,
        default: false,
      },
    }],

    // Tarification
    pricing: {
      daily: {
        type: Number,
        required: [true, 'Le prix journalier est requis'],
      },
      weekly: Number,
      monthly: Number,
      chauffeurSupplement: {
        type: Number,
        default: 15000,
      },
    },

    // Disponibilité
    availability: {
      status: {
        type: String,
        enum: ['disponible', 'loue', 'maintenance', 'hors-service'],
        default: 'disponible',
      },
      cities: [{
        type: String,
        enum: ['Abidjan', 'Yamoussoukro', 'San-Pédro', 'Bouaké', 'Korhogo'],
      }],
    },

    // Chauffeur disponible
    chauffeurAvailable: {
      type: Boolean,
      default: true,
    },

    // Documents
    documents: {
      registration: {
        url: String,
        expiryDate: Date,
      },
      insurance: {
        url: String,
        expiryDate: Date,
        type: String,
      },
      technicalInspection: {
        url: String,
        expiryDate: Date,
      },
    },

    // Maintenance
    maintenance: {
      lastService: Date,
      nextService: Number, // kilométrage
      history: [{
        date: Date,
        type: String,
        description: String,
        cost: Number,
        mileage: Number,
      }],
    },

    // Statistiques
    stats: {
      totalRentals: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // Options supplémentaires disponibles
    additionalOptions: [{
      name: String,
      price: Number,
      available: {
        type: Boolean,
        default: true,
      },
    }],

    // SEO
    description: {
      type: String,
      maxlength: 500,
    },
    
    // Statut
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Créer slug avant sauvegarde
vehicleSchema.pre('save', async function (next) {
  if (this.isModified('brand') || this.isModified('model') || this.isModified('year') || !this.slug) {
    const baseSlug = slugify(`${this.brand}-${this.model}-${this.year}`, {
      lower: true,
      strict: true,
    });
    
    // Vérifier si le slug existe déjà
    let slug = baseSlug;
    let counter = 1;
    
    // Si on est en train de mettre à jour un document existant, exclure son propre _id
    const query = this._id 
      ? { slug: slug, _id: { $ne: this._id } }
      : { slug: slug };
    
    while (await mongoose.model('Vehicle').findOne(query)) {
      counter++;
      slug = `${baseSlug}-${counter}`;
      query.slug = slug;
    }
    
    this.slug = slug;
  }
  next();
});

// Virtual pour l'image principale
vehicleSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : this.images[0]?.url || null;
});

// Virtual pour les avis
vehicleSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'vehicle',
  justOne: false,
});

// Méthode pour calculer le prix selon la durée
vehicleSchema.methods.calculatePrice = function (days) {
  let price;
  
  if (days >= 30) {
    // Prix mensuel
    price = this.pricing.monthly || this.pricing.daily * 30 * 0.8;
  } else if (days >= 7) {
    // Prix hebdomadaire
    price = this.pricing.weekly || this.pricing.daily * 7 * 0.9;
  } else {
    // Prix journalier
    price = this.pricing.daily * days;
  }
  
  return price;
};

// Index pour recherche
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ 'pricing.daily': 1 });
vehicleSchema.index({ 'availability.status': 1 });

export default mongoose.model('Vehicle', vehicleSchema);
