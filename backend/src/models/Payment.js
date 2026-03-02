import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Type de paiement
    paymentType: {
      type: String,
      enum: ['deposit', 'full', 'remaining', 'additional'],
      required: true,
    },
    
    // Montant
    amount: {
      type: Number,
      required: true,
    },
    
    // Méthode
    method: {
      type: String,
      enum: ['cash', 'orange-money', 'mtn-money', 'moov-money', 'wave', 'card', 'bank-transfer'],
      required: true,
    },
    
    // Statut
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    
    // Provider (pour paiements en ligne)
    provider: {
      type: String,
      enum: ['cinetpay', 'fedapay', 'stripe', 'manual'],
    },
    
    // Transaction details
    transactionId: String,
    providerTransactionId: String,
    providerResponse: mongoose.Schema.Types.Mixed,
    
    // Pour paiement cash
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptUrl: String,
    receiptPhoto: String,
    
    // Métadonnées
    currency: {
      type: String,
      default: 'XOF', // Franc CFA
    },
    
    // Remboursement
    refund: {
      amount: Number,
      reason: String,
      refundedAt: Date,
      refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    
    // Notes
    notes: String,
    
    // Dates importantes
    paidAt: Date,
    verifiedAt: Date,
    
    // IP et metadata
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index
paymentSchema.index({ reservation: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

export default mongoose.model('Payment', paymentSchema);
