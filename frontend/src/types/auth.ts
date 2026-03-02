export interface User {
  _id?: string;
  id?: string;
  nom: string;
  prenom: string;
  firstName?: string;
  lastName?: string;
  email: string;
  telephone: string;
  phone?: string;
  role: 'client' | 'chauffeur' | 'admin';
  avatar?: string;
  ville?: string;
  city?: string;
  profession?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  pointsFidelite?: number;
  experienceAnnees?: number;
  langues?: string[];
  noteMovenne?: number;
  nombreAvis?: number;
  disponible?: boolean;
  numeroPermis?: string;
  documentsValides?: boolean;
  loyalty?: {
    points: number;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalSpent: number;
  };
  chauffeurProfile?: {
    availability: string;
    rating: number;
    experience: number;
    languages?: string[];
    specialties?: string[];
    totalRides?: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  firstName?: string;
  lastName?: string;
  email: string;
  telephone: string;
  phone?: string;
  password: string;
  role?: 'client' | 'chauffeur';
  ville?: string;
  city?: string;
  profession?: string;
}
