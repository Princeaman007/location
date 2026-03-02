import api from './api';
import { LoginCredentials, RegisterData, User } from '@/types/auth';

export const authService = {
  // Inscription
  register: async (data: RegisterData) => {
    // Mapper les champs et nettoyer le téléphone
    let cleanPhone = data.telephone.replace(/[\s.()-]/g, '');
    
    // Si le numéro ne commence pas par +, ajouter +225 par défaut (Côte d'Ivoire)
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+225' + cleanPhone.replace(/^0/, '');
    }
    
    const payload: any = {
      firstName: data.prenom,
      lastName: data.nom,
      email: data.email,
      phone: cleanPhone,
      password: data.password,
    };
    
    // Ajouter les champs optionnels seulement s'ils sont remplis
    if (data.ville && data.ville.trim()) {
      payload.city = data.ville;
    }
    if (data.profession && data.profession.trim()) {
      payload.profession = data.profession;
    }
    
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  // Connexion
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    // Le token sera stocké par le store authStore
    return response.data;
  },

  // Connexion Google
  loginWithGoogle: async (googleData: any) => {
    const response = await api.post('/auth/google', googleData);
    // Le token sera stocké par le store authStore
    return response.data;
  },

  // Déconnexion
  logout: () => {
    // Le nettoyage sera fait par le store authStore
  },

  // Obtenir profil
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Mettre à jour profil
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/auth/update-profile', data);
    // L'utilisateur sera mis à jour par le composant appelant
    return response.data;
  },

  // Changer mot de passe
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Mot de passe oublié
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Réinitialiser mot de passe
  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Vérifier email
  verifyEmail: async (token: string) => {
    const response = await api.post(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Vérifier téléphone
  verifyPhone: async (code: string) => {
    const response = await api.post('/auth/verify-phone', { code });
    return response.data;
  },
};
