import mongoose from 'mongoose';

const airportTransferSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['arrivee', 'depart'],
      required: [true, 'Le type de transfert est requis'],
    },
    date: {
      type: Date,
      required: [true, 'La date est requise'],
    },
    heure: {
      type: String,
      required: [true, "L'heure est requise"],
    },
    numeroVol: {
      type: String,
    },
    depart: {
      type: String,
    },
    arrivee: {
      type: String,
    },
    passagers: {
      type: Number,
      required: [true, 'Le nombre de passagers est requis'],
      min: 1,
      max: 20,
    },
    contact: {
      nom: {
        type: String,
        required: [true, 'Le nom est requis'],
      },
      prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
      },
      telephone: {
        type: String,
        required: [true, 'Le téléphone est requis'],
      },
      email: {
        type: String,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statut: {
      type: String,
      enum: ['en_attente', 'contacte', 'confirme', 'termine', 'annule'],
      default: 'en_attente',
    },
    tarif: {
      type: Number,
    },
    notes: {
      type: String,
    },
    chauffeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche
airportTransferSchema.index({ date: 1, statut: 1 });
airportTransferSchema.index({ user: 1 });
airportTransferSchema.index({ 'contact.telephone': 1 });

// Virtual properties pour compatibilité frontend
airportTransferSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Ajouter des alias pour compatibilité frontend
    ret.typeTransfert = ret.type;
    ret.dateTransfert = ret.date;
    ret.heureTransfert = ret.heure;
    ret.nombrePassagers = ret.passagers;
    ret.aeroportDepart = ret.depart;
    ret.aeroportArrivee = ret.arrivee;
    ret.lieuPriseEnCharge = ret.depart;
    ret.destination = ret.arrivee;
    return ret;
  }
});

export default mongoose.model('AirportTransfer', airportTransferSchema);
