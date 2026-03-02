import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: `${__dirname}/../../.env` });

const resetPassword = async (email, newPassword) => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }

    console.log('✅ Utilisateur trouvé:', user.email);

    // Mettre à jour le mot de passe (sera hashé automatiquement par le pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('✅ Mot de passe mis à jour avec succès');
    console.log('📧 Email:', email);
    console.log('🔑 Nouveau mot de passe:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Utilisation: node resetPassword.js <email> <nouveau_mot_de_passe>
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node resetPassword.js <email> <nouveau_mot_de_passe>');
  console.log('Exemple: node resetPassword.js amanprince005@gmail.com Password123!');
  process.exit(1);
}

resetPassword(email, newPassword);
