import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email invalide',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      match: [/^\+[1-9]\d{1,14}$/, 'Format téléphone international invalide (format E.164)'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'chauffeur', 'admin'],
      default: 'client',
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/avatar_default.png',
    },
    city: {
      type: String,
      enum: ['Abidjan', 'Yamoussoukro', 'San-Pédro', 'Bouaké', 'Korhogo', 'Autre'],
      required: false,
    },
    address: {
      street: String,
      commune: String,
      landmark: String,
    },
    profession: String,
    
    // Documents
    documents: {
      idCard: {
        front: String,
        back: String,
        number: String,
        expiryDate: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
      drivingLicense: {
        front: String,
        back: String,
        number: String,
        category: String,
        expiryDate: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Chauffeur specific
    chauffeurProfile: {
      experience: Number, // années
      languages: [String],
      specialties: [String],
      rating: {
        type: Number,
        default: 0,
      },
      totalRides: {
        type: Number,
        default: 0,
      },
      availability: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'offline',
      },
      currentVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    },

    // Programme fidélité
    loyalty: {
      points: {
        type: Number,
        default: 0,
      },
      level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze',
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
    },

    // Vérification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    phoneVerificationCode: String,
    phoneVerificationExpire: Date,
    
    // Reset password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // OAuth
    googleId: String,

    // Statut compte
    isActive: {
      type: Boolean,
      default: true,
    },
    
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Générer JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Calculer niveau fidélité
userSchema.methods.calculateLoyaltyLevel = function () {
  const points = this.loyalty.points;
  
  if (points >= 2000) {
    this.loyalty.level = 'platinum';
  } else if (points >= 1000) {
    this.loyalty.level = 'gold';
  } else if (points >= 500) {
    this.loyalty.level = 'silver';
  } else {
    this.loyalty.level = 'bronze';
  }
};

// Méthode pour obtenir le nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', userSchema);
