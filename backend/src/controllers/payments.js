import Payment from '../models/Payment.js';
import Reservation from '../models/Reservation.js';
import axios from 'axios';

// @desc    Initier un paiement
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  try {
    const { reservationId, amount, method, paymentType } = req.body;

    // Vérifier la réservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Vérifier que c'est bien la réservation de l'utilisateur
    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé',
      });
    }

    // Créer le paiement
    const payment = await Payment.create({
      reservation: reservationId,
      user: req.user.id,
      paymentType,
      amount,
      method,
      status: 'pending',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Si paiement en ligne, initier avec le provider
    if (['orange-money', 'mtn-money', 'moov-money', 'wave', 'card'].includes(method)) {
      const paymentUrl = await initiateOnlinePayment(payment, method, amount);
      
      return res.status(200).json({
        success: true,
        message: 'Paiement initié avec succès',
        data: {
          payment,
          paymentUrl,
        },
      });
    }

    // Paiement cash
    res.status(200).json({
      success: true,
      message: 'Paiement enregistré. À payer à la livraison.',
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement',
      error: error.message,
    });
  }
};

// @desc    Vérifier un paiement
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, provider } = req.body;

    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé',
      });
    }

    // Vérifier auprès du provider
    let isVerified = false;
    
    if (provider === 'cinetpay') {
      isVerified = await verifyCinetPayPayment(transactionId);
    } else if (provider === 'fedapay') {
      isVerified = await verifyFedaPayPayment(transactionId);
    }

    if (isVerified) {
      payment.status = 'completed';
      payment.paidAt = Date.now();
      payment.verifiedAt = Date.now();
      await payment.save();

      // Mettre à jour la réservation
      const reservation = await Reservation.findById(payment.reservation);
      reservation.payment.status = payment.paymentType === 'full' ? 'paid' : 'deposit-paid';
      reservation.payment.paidAmount += payment.amount;
      reservation.payment.remainingAmount -= payment.amount;
      
      if (payment.paymentType === 'deposit') {
        reservation.payment.depositAmount = payment.amount;
        reservation.payment.depositPaidAt = Date.now();
      } else {
        reservation.payment.paidAt = Date.now();
      }
      
      await reservation.save();

      return res.status(200).json({
        success: true,
        message: 'Paiement vérifié et confirmé',
        data: payment,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Paiement non vérifié',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du paiement',
      error: error.message,
    });
  }
};

// @desc    Obtenir l'historique des paiements
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (req.user.role === 'client') {
      filter.user = req.user.id;
    }
    // Admin voit tous les paiements

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate('reservation', 'code startDate endDate vehicle')
      .populate('user', 'firstName lastName email')
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message,
    });
  }
};

// @desc    Confirmer paiement cash (Chauffeur/Admin)
// @route   POST /api/payments/:id/confirm-cash
// @access  Private/Chauffeur/Admin
export const confirmCashPayment = async (req, res) => {
  try {
    const { receiptPhoto, notes } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé',
      });
    }

    if (payment.method !== 'cash') {
      return res.status(400).json({
        success: false,
        message: 'Ce paiement n\'est pas en espèces',
      });
    }

    payment.status = 'completed';
    payment.paidAt = Date.now();
    payment.collectedBy = req.user.id;
    payment.receiptPhoto = receiptPhoto;
    payment.notes = notes;
    await payment.save();

    // Mettre à jour la réservation
    const reservation = await Reservation.findById(payment.reservation);
    reservation.payment.status = payment.paymentType === 'full' ? 'paid' : 'deposit-paid';
    reservation.payment.paidAmount += payment.amount;
    reservation.payment.remainingAmount -= payment.amount;
    
    if (reservation.payment.remainingAmount <= 0) {
      reservation.payment.paidAt = Date.now();
    }
    
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Paiement cash confirmé',
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement',
      error: error.message,
    });
  }
};

// @desc    Rembourser un paiement (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les paiements complétés peuvent être remboursés',
      });
    }

    payment.status = 'refunded';
    payment.refund = {
      amount: amount || payment.amount,
      reason,
      refundedAt: Date.now(),
      refundedBy: req.user.id,
    };
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Remboursement effectué',
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du remboursement',
      error: error.message,
    });
  }
};

// Fonctions helper pour les providers de paiement
async function initiateOnlinePayment(payment, method, amount) {
  // Logique d'intégration avec CinetPay, FedaPay ou Stripe
  // À implémenter selon la documentation de chaque provider
  
  if (method === 'card') {
    // Stripe
    return `https://checkout.stripe.com/pay/${payment._id}`;
  } else {
    // CinetPay pour Mobile Money
    const cinetpayUrl = process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com';
    
    try {
      const response = await axios.post(`${cinetpayUrl}/v2/payment`, {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: payment._id.toString(),
        amount: amount,
        currency: 'XOF',
        description: `Paiement réservation ${payment.reservation}`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        notify_url: `${process.env.API_URL}/payments/webhook/cinetpay`,
        channels: method === 'orange-money' ? 'ORANGE_MONEY_CI' : 
                  method === 'mtn-money' ? 'MTN_MONEY_CI' :
                  method === 'moov-money' ? 'MOOV_MONEY_CI' : 'ALL',
      });

      payment.transactionId = payment._id.toString();
      payment.provider = 'cinetpay';
      payment.providerTransactionId = response.data.data.payment_token;
      await payment.save();

      return response.data.data.payment_url;
    } catch (error) {
      console.error('Erreur CinetPay:', error);
      throw new Error('Erreur lors de l\'initiation du paiement');
    }
  }
}

async function verifyCinetPayPayment(transactionId) {
  try {
    const response = await axios.post(
      `${process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com'}/v2/payment/check`,
      {
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: transactionId,
      }
    );

    return response.data.code === '00' && response.data.data.status === 'ACCEPTED';
  } catch (error) {
    console.error('Erreur vérification CinetPay:', error);
    return false;
  }
}

async function verifyFedaPayPayment(transactionId) {
  // Logique de vérification FedaPay
  // À implémenter
  return false;
}
