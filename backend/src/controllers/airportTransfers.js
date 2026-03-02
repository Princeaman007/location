import AirportTransfer from '../models/AirportTransfer.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Créer une demande de transfert aéroport
// @route   POST /api/airport-transfers
// @access  Public
export const createTransferRequest = async (req, res) => {
  try {
    const {
      type,
      date,
      heure,
      numeroVol,
      depart,
      arrivee,
      passagers,
      nom,
      prenom,
      telephone,
      email,
    } = req.body;

    // Créer la demande
    const transfer = await AirportTransfer.create({
      type,
      date,
      heure,
      numeroVol,
      depart,
      arrivee,
      passagers,
      contact: {
        nom,
        prenom,
        telephone,
        email,
      },
      user: req.user?.id, // Si l'utilisateur est connecté
    });

    // Envoyer email de confirmation au client
    try {
      const emailContent = `
        <h2>Demande de transfert aéroport reçue</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Nous avons bien reçu votre demande de transfert ${type === 'arrivee' ? "depuis l'aéroport" : "vers l'aéroport"}.</p>
        
        <h3>Détails de votre demande :</h3>
        <ul>
          <li><strong>Type :</strong> ${type === 'arrivee' ? 'Arrivée (Aéroport → Ville)' : 'Départ (Ville → Aéroport)'}</li>
          <li><strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR')}</li>
          <li><strong>Heure :</strong> ${heure}</li>
          ${numeroVol ? `<li><strong>Numéro de vol :</strong> ${numeroVol}</li>` : ''}
          ${arrivee ? `<li><strong>Destination :</strong> ${arrivee}</li>` : ''}
          ${depart ? `<li><strong>Départ :</strong> ${depart}</li>` : ''}
          <li><strong>Nombre de passagers :</strong> ${passagers}</li>
        </ul>
        
        <p><strong>Notre équipe vous contactera dans les 15 minutes au ${telephone} pour confirmer votre réservation et vous communiquer le tarif.</strong></p>
        
        <p>Merci de votre confiance,<br>L'équipe DCM groupe agence</p>
      `;

      if (email) {
        await sendEmail({
          email,
          subject: 'Demande de transfert aéroport - DCM groupe agence',
          html: emailContent,
        });
      }

      // Envoyer email de notification à l'admin
      await sendEmail({
        email: process.env.FROM_EMAIL,
        subject: `Nouvelle demande transfert aéroport - ${type}`,
        html: `
          <h2>Nouvelle demande de transfert aéroport</h2>
          <h3>Informations client :</h3>
          <ul>
            <li><strong>Nom :</strong> ${prenom} ${nom}</li>
            <li><strong>Téléphone :</strong> ${telephone}</li>
            ${email ? `<li><strong>Email :</strong> ${email}</li>` : ''}
          </ul>
          
          <h3>Détails du transfert :</h3>
          <ul>
            <li><strong>Type :</strong> ${type === 'arrivee' ? 'Arrivée' : 'Départ'}</li>
            <li><strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR')}</li>
            <li><strong>Heure :</strong> ${heure}</li>
            ${numeroVol ? `<li><strong>Vol :</strong> ${numeroVol}</li>` : ''}
            ${arrivee ? `<li><strong>Destination :</strong> ${arrivee}</li>` : ''}
            ${depart ? `<li><strong>Départ :</strong> ${depart}</li>` : ''}
            <li><strong>Passagers :</strong> ${passagers}</li>
          </ul>
          
          <p><strong>Action requise :</strong> Contacter le client dans les 15 minutes.</p>
        `,
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Votre demande de transfert a été envoyée avec succès. Nous vous contacterons sous peu.',
      data: transfer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la demande',
      error: error.message,
    });
  }
};

// @desc    Obtenir toutes les demandes de transfert (Admin)
// @route   GET /api/airport-transfers
// @access  Private/Admin
export const getTransfers = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (statut) filter.statut = statut;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AirportTransfer.countDocuments(filter);

    const transfers = await AirportTransfer.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone email chauffeurProfile')
      .populate('vehicule', 'marque modele immatriculation')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      count: transfers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transfers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message,
    });
  }
};

// @desc    Obtenir une demande de transfert
// @route   GET /api/airport-transfers/:id
// @access  Private
export const getTransfer = async (req, res) => {
  try {
    const transfer = await AirportTransfer.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone')
      .populate('vehicule', 'marque modele immatriculation');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée',
      });
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la demande',
      error: error.message,
    });
  }
};

// @desc    Mettre à jour le statut d'une demande (Admin)
// @route   PUT /api/airport-transfers/:id
// @access  Private/Admin
export const updateTransfer = async (req, res) => {
  try {
    const { statut, tarif, notes, chauffeur, vehicule } = req.body;

    const transfer = await AirportTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée',
      });
    }

    if (statut) transfer.statut = statut;
    if (tarif) transfer.tarif = tarif;
    if (notes) transfer.notes = notes;
    if (chauffeur) transfer.chauffeur = chauffeur;
    if (vehicule) transfer.vehicule = vehicule;

    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Demande mise à jour',
      data: transfer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    });
  }
};

// @desc    Obtenir mes demandes de transfert (Client)
// @route   GET /api/airport-transfers/my-transfers
// @access  Private
export const getMyTransfers = async (req, res) => {
  try {
    const transfers = await AirportTransfer.find({ user: req.user.id })
      .populate('chauffeur', 'firstName lastName phone email chauffeurProfile')
      .populate('vehicule', 'marque modele immatriculation images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message,
    });
  }
};

// @desc    Modifier ma demande de transfert (Client)
// @route   PUT /api/airport-transfers/:id/edit
// @access  Private
export const updateMyTransfer = async (req, res) => {
  try {
    const transfer = await AirportTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée',
      });
    }

    // Vérifier que la demande appartient à l'utilisateur
    if (transfer.user && transfer.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette demande',
      });
    }

    // Vérifier que la demande peut encore être modifiée
    if (transfer.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande ne peut plus être modifiée car elle a déjà été traitée',
      });
    }

    // Vérifier que la date n'est pas passée
    const transferDate = new Date(transfer.date);
    const now = new Date();
    if (transferDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cette demande ne peut plus être modifiée car la date est passée',
      });
    }

    const {
      type,
      date,
      heure,
      numeroVol,
      depart,
      arrivee,
      passagers,
      nom,
      prenom,
      telephone,
      email,
    } = req.body;

    // Mettre à jour les champs
    if (type) transfer.type = type;
    if (date) transfer.date = date;
    if (heure) transfer.heure = heure;
    if (numeroVol !== undefined) transfer.numeroVol = numeroVol;
    if (depart !== undefined) transfer.depart = depart;
    if (arrivee !== undefined) transfer.arrivee = arrivee;
    if (passagers) transfer.passagers = passagers;
    
    if (nom) transfer.contact.nom = nom;
    if (prenom) transfer.contact.prenom = prenom;
    if (telephone) transfer.contact.telephone = telephone;
    if (email !== undefined) transfer.contact.email = email;

    await transfer.save();

    // Envoyer email de notification de modification
    try {
      if (transfer.contact.email) {
        await sendEmail({
          email: transfer.contact.email,
          subject: 'Modification de votre demande de transfert - DCM groupe agence',
          html: `
            <h2>Demande de transfert modifiée</h2>
            <p>Bonjour ${transfer.contact.prenom} ${transfer.contact.nom},</p>
            <p>Votre demande de transfert ${transfer.type === 'arrivee' ? "depuis l'aéroport" : "vers l'aéroport"} a été modifiée avec succès.</p>
            
            <h3>Nouveaux détails :</h3>
            <ul>
              <li><strong>Type :</strong> ${transfer.type === 'arrivee' ? 'Arrivée (Aéroport → Ville)' : 'Départ (Ville → Aéroport)'}</li>
              <li><strong>Date :</strong> ${new Date(transfer.date).toLocaleDateString('fr-FR')}</li>
              <li><strong>Heure :</strong> ${transfer.heure}</li>
              ${transfer.numeroVol ? `<li><strong>Numéro de vol :</strong> ${transfer.numeroVol}</li>` : ''}
              ${transfer.arrivee ? `<li><strong>Destination :</strong> ${transfer.arrivee}</li>` : ''}
              ${transfer.depart ? `<li><strong>Départ :</strong> ${transfer.depart}</li>` : ''}
              <li><strong>Nombre de passagers :</strong> ${transfer.passagers}</li>
            </ul>
            
            <p>Notre équipe prendra en compte ces modifications pour votre service.</p>
            <p>Merci de votre confiance,<br>L'équipe DCM groupe agence</p>
          `,
        });
      }

      // Notifier l'admin de la modification
      await sendEmail({
        email: process.env.FROM_EMAIL,
        subject: `Modification demande transfert aéroport - ${transfer._id}`,
        html: `
          <h2>Demande de transfert modifiée</h2>
          <p>Le client ${transfer.contact.prenom} ${transfer.contact.nom} a modifié sa demande de transfert.</p>
          <p><strong>ID demande :</strong> ${transfer._id}</p>
          <p><strong>Téléphone :</strong> ${transfer.contact.telephone}</p>
          <p>Veuillez vérifier les nouveaux détails dans le système.</p>
        `,
      });
    } catch (emailError) {
      console.error('Erreur envoi email modification:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Votre demande a été modifiée avec succès',
      data: transfer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification',
      error: error.message,
    });
  }
};

// @desc    Obtenir les transferts assignés au chauffeur
// @route   GET /api/airport-transfers/my-missions
// @access  Private/Chauffeur
export const getMyChauffeurTransfers = async (req, res) => {
  try {
    // Récupérer tous les transferts où le chauffeur est assigné
    const transfers = await AirportTransfer.find({ chauffeur: req.user.id })
      .populate('user', 'firstName lastName email phone')
      .populate('vehicule', 'brand model registration images')
      .sort('-date');

    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: error.message,
    });
  }
};
