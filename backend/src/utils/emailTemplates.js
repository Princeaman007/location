// Template pour email de vérification
export const verificationEmailTemplate = (firstName, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #E67E22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 DCM groupe agence</h1>
          <p>Bienvenue dans la famille !</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Merci de vous être inscrit sur <strong>DCM groupe agence</strong>, votre plateforme de location de véhicules en Côte d'Ivoire !</p>
          <p>Pour finaliser votre inscription et accéder à tous nos services, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
          </div>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #E67E22;">${verificationUrl}</p>
          <p style="margin-top: 30px;">Si vous n'avez pas créé de compte sur DCM groupe agence, vous pouvez ignorer cet email.</p>
          <div style="background: #fff3cd; border-left: 4px solid #E67E22; padding: 15px; margin-top: 20px;">
            <strong>⚠️ Important :</strong> Ce lien est valable pendant 24 heures.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DCM groupe agence - Tous droits réservés</p>
          <p>📞 +225 XX XX XX XX | 📧 contact@ivoiredrive.ci</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template pour réinitialisation de mot de passe
export const resetPasswordEmailTemplate = (firstName, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E67E22 0%, #D35400 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #E67E22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>DCM groupe agence</strong>.</p>
          <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #E67E22;">${resetUrl}</p>
          <div style="background: #fff3cd; border-left: 4px solid #E67E22; padding: 15px; margin-top: 20px;">
            <strong>⚠️ Important :</strong> Ce lien est valable pendant 30 minutes seulement.
          </div>
          <p style="margin-top: 20px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DCM groupe agence - Tous droits réservés</p>
          <p>📞 +225 XX XX XX XX | 📧 contact@ivoiredrive.ci</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template pour confirmation de réservation
export const bookingConfirmationTemplate = (firstName, bookingDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #27AE60 0%, #229954 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Réservation confirmée !</h1>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre réservation a été confirmée avec succès !</p>
          <div class="booking-details">
            <h3>Détails de votre réservation :</h3>
            <div class="detail-row">
              <strong>Numéro de réservation :</strong>
              <span>${bookingDetails.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <strong>Véhicule :</strong>
              <span>${bookingDetails.vehicle}</span>
            </div>
            <div class="detail-row">
              <strong>Date de début :</strong>
              <span>${bookingDetails.startDate}</span>
            </div>
            <div class="detail-row">
              <strong>Date de fin :</strong>
              <span>${bookingDetails.endDate}</span>
            </div>
            <div class="detail-row">
              <strong>Montant total :</strong>
              <span style="color: #27AE60; font-weight: bold;">${bookingDetails.totalAmount} FCFA</span>
            </div>
          </div>
          <p>Vous recevrez un SMS de confirmation prochainement.</p>
          <p style="margin-top: 20px;">Pour toute question, n'hésitez pas à nous contacter.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DCM groupe agence - Tous droits réservés</p>
          <p>📞 +225 XX XX XX XX | 📧 contact@ivoiredrive.ci</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template pour attribution de chauffeur à une réservation
export const chauffeurAssignmentTemplate = (firstName, reservationDetails, chauffeurDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498DB; }
        .chauffeur-card { background: linear-gradient(135deg, #E8F4F8 0%, #D6EAF8 100%); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .chauffeur-avatar { width: 80px; height: 80px; background: #3498DB; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 15px; }
        .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; font-weight: 600; display: inline-block; width: 140px; }
        .detail-value { color: #333; }
        .contact-btn { display: inline-block; background: #27AE60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: 600; }
        .highlight { background: #FFF3CD; padding: 15px; border-radius: 5px; border-left: 4px solid #FFC107; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👤 Chauffeur Attribué</h1>
          <p style="font-size: 16px; margin-top: 10px;">Votre réservation est confirmée</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Excellente nouvelle ! Un chauffeur professionnel a été attribué à votre réservation.</p>
          
          <div class="info-box">
            <h3 style="color: #3498DB; margin-top: 0;">📋 Détails de votre réservation</h3>
            <div class="detail-row">
              <span class="detail-label">Code réservation :</span>
              <span class="detail-value" style="font-weight: bold; color: #3498DB;">${reservationDetails.code}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Véhicule :</span>
              <span class="detail-value">${reservationDetails.vehicle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date de début :</span>
              <span class="detail-value">${reservationDetails.startDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date de fin :</span>
              <span class="detail-value">${reservationDetails.endDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lieu de prise en charge :</span>
              <span class="detail-value">${reservationDetails.pickupLocation}</span>
            </div>
          </div>

          <div class="chauffeur-card">
            <div class="chauffeur-avatar">${chauffeurDetails.initials}</div>
            <h2 style="margin: 10px 0; color: #2C3E50;">${chauffeurDetails.fullName}</h2>
            <p style="color: #7F8C8D; margin: 5px 0;">Chauffeur Professionnel</p>
            
            <div style="margin-top: 20px; text-align: left; background: white; padding: 20px; border-radius: 8px;">
              <div class="detail-row">
                <span class="detail-label">📞 Téléphone :</span>
                <span class="detail-value" style="font-weight: bold;">${chauffeurDetails.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📧 Email :</span>
                <span class="detail-value">${chauffeurDetails.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⭐ Note :</span>
                <span class="detail-value" style="color: #F39C12; font-weight: bold;">${chauffeurDetails.rating}/5</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🚗 Expérience :</span>
                <span class="detail-value">${chauffeurDetails.experience} ans</span>
              </div>
              ${chauffeurDetails.languages ? `
              <div class="detail-row">
                <span class="detail-label">🗣️ Langues :</span>
                <span class="detail-value">${chauffeurDetails.languages}</span>
              </div>
              ` : ''}
            </div>

            <div style="margin-top: 20px;">
              <a href="tel:${chauffeurDetails.phone.replace(/\s/g, '')}" class="contact-btn">
                📞 Appeler le chauffeur
              </a>
              <a href="mailto:${chauffeurDetails.email}" class="contact-btn" style="background: #3498DB;">
                📧 Envoyer un email
              </a>
            </div>
          </div>

          <div class="highlight">
            <strong>📌 Informations importantes :</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Votre chauffeur vous contactera 24h avant le début de la réservation</li>
              <li>Assurez-vous d'être joignable sur votre téléphone</li>
              <li>En cas de changement, contactez-nous immédiatement</li>
              <li>Respectez les horaires convenus pour une meilleure expérience</li>
            </ul>
          </div>

          <p style="margin-top: 20px;">Nous vous souhaitons un excellent voyage avec DCM groupe agence !</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DCM groupe agence - Tous droits réservés</p>
          <p>📞 +225 XX XX XX XX | 📧 contact@ivoiredrive.ci</p>
          <p style="margin-top: 10px; font-size: 12px;">
            <a href="#" style="color: #3498DB; text-decoration: none;">Consulter mes réservations</a> | 
            <a href="#" style="color: #3498DB; text-decoration: none;">Besoin d'aide ?</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template pour attribution de chauffeur à un transfert aéroport
export const chauffeurTransferAssignmentTemplate = (firstName, transferDetails, chauffeurDetails) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9B59B6; }
        .chauffeur-card { background: linear-gradient(135deg, #F4ECF7 0%, #EBDEF0 100%); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .chauffeur-avatar { width: 80px; height: 80px; background: #9B59B6; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 15px; }
        .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #666; font-weight: 600; display: inline-block; width: 140px; }
        .detail-value { color: #333; }
        .contact-btn { display: inline-block; background: #27AE60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; font-weight: 600; }
        .flight-badge { background: #3498DB; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
        .highlight { background: #FFF3CD; padding: 15px; border-radius: 5px; border-left: 4px solid #FFC107; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Transfert Aéroport Confirmé</h1>
          <p style="font-size: 16px; margin-top: 10px;">Votre chauffeur vous attend</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Votre transfert aéroport est confirmé ! Un chauffeur professionnel a été désigné pour vous accueillir.</p>
          
          <div class="info-box">
            <h3 style="color: #9B59B6; margin-top: 0;">✈️ Détails de votre transfert</h3>
            <div style="text-align: center; margin: 15px 0;">
              <span class="flight-badge">
                ${transferDetails.type === 'arrivee' ? '✈️ → 🏨 ARRIVÉE' : '🏨 → ✈️ DÉPART'}
              </span>
            </div>
            ${transferDetails.flightNumber ? `
            <div class="detail-row">
              <span class="detail-label">Numéro de vol :</span>
              <span class="detail-value" style="font-weight: bold; color: #9B59B6;">${transferDetails.flightNumber}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Date :</span>
              <span class="detail-value">${transferDetails.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Heure :</span>
              <span class="detail-value" style="font-weight: bold;">${transferDetails.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">${transferDetails.type === 'arrivee' ? 'Aéroport' : 'Lieu de prise en charge'} :</span>
              <span class="detail-value">${transferDetails.from}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">${transferDetails.type === 'arrivee' ? 'Destination' : 'Aéroport'} :</span>
              <span class="detail-value">${transferDetails.to}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Passagers :</span>
              <span class="detail-value">${transferDetails.passengers} personne(s)</span>
            </div>
          </div>

          <div class="chauffeur-card">
            <div class="chauffeur-avatar">${chauffeurDetails.initials}</div>
            <h2 style="margin: 10px 0; color: #2C3E50;">${chauffeurDetails.fullName}</h2>
            <p style="color: #7F8C8D; margin: 5px 0;">Chauffeur Professionnel</p>
            
            <div style="margin-top: 20px; text-align: left; background: white; padding: 20px; border-radius: 8px;">
              <div class="detail-row">
                <span class="detail-label">📞 Téléphone :</span>
                <span class="detail-value" style="font-weight: bold;">${chauffeurDetails.phone}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📧 Email :</span>
                <span class="detail-value">${chauffeurDetails.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⭐ Note :</span>
                <span class="detail-value" style="color: #F39C12; font-weight: bold;">${chauffeurDetails.rating}/5</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🚗 Expérience :</span>
                <span class="detail-value">${chauffeurDetails.experience} ans</span>
              </div>
              ${chauffeurDetails.languages ? `
              <div class="detail-row">
                <span class="detail-label">🗣️ Langues :</span>
                <span class="detail-value">${chauffeurDetails.languages}</span>
              </div>
              ` : ''}
            </div>

            <div style="margin-top: 20px;">
              <a href="tel:${chauffeurDetails.phone.replace(/\s/g, '')}" class="contact-btn">
                📞 Appeler le chauffeur
              </a>
              <a href="mailto:${chauffeurDetails.email}" class="contact-btn" style="background: #9B59B6;">
                📧 Envoyer un email
              </a>
            </div>
          </div>

          <div class="highlight">
            <strong>📌 Instructions importantes :</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${transferDetails.type === 'arrivee' ? `
              <li>Votre chauffeur vous attendra à la sortie de l'aéroport avec une pancarte à votre nom</li>
              <li>En cas de retard de vol, le chauffeur sera informé automatiquement</li>
              ` : `
              <li>Le chauffeur arrivera ${transferDetails.pickupTime || '30 minutes'} avant l'heure prévue</li>
              <li>Assurez-vous d'être prêt à l'heure convenue</li>
              `}
              <li>Contactez le chauffeur dès votre arrivée/départ</li>
              <li>Gardez votre téléphone allumé et accessible</li>
              <li>Pour toute urgence, contactez notre service client</li>
            </ul>
          </div>

          <p style="margin-top: 20px;">Bon voyage avec DCM groupe agence ! ✈️</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DCM groupe agence - Tous droits réservés</p>
          <p>📞 +225 XX XX XX XX | 📧 contact@ivoiredrive.ci</p>
          <p style="margin-top: 10px; font-size: 12px;">
            <a href="#" style="color: #9B59B6; text-decoration: none;">Consulter mes transferts</a> | 
            <a href="#" style="color: #9B59B6; text-decoration: none;">Besoin d'aide ?</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
