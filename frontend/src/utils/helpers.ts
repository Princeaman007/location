/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('XOF', 'FCFA');
};

/**
 * Formate une date
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Formate une date et heure
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Calcule le nombre de jours entre deux dates
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Valide un numéro de téléphone ivoirien
 */
export const validateIvorianPhone = (phone: string): boolean => {
  const regex = /^\+225[0-9]{10}$/;
  return regex.test(phone);
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhone = (phone: string): string => {
  if (phone.startsWith('+225')) {
    return phone.replace(/(\+225)(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
  }
  return phone;
};

/**
 * Génère les initiales d'un nom
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Tronque un texte
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Obtient la couleur du badge selon le statut
 */
export const getStatusColor = (
  status: string
): 'primary' | 'success' | 'warning' | 'danger' => {
  const statusMap: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    disponible: 'success',
    confirmed: 'success',
    'in-progress': 'primary',
    pending: 'warning',
    cancelled: 'danger',
    maintenance: 'warning',
  };

  return statusMap[status] || 'primary';
};

/**
 * Traduit le statut en français
 */
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    disponible: 'Disponible',
    loue: 'Loué',
    maintenance: 'Maintenance',
    'hors-service': 'Hors service',
    pending: 'En attente',
    confirmed: 'Confirmée',
    'in-progress': 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
  };

  return translations[status] || status;
};

/**
 * Calcule le niveau de fidélité selon les points
 */
export const getLoyaltyLevel = (
  points: number
): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (points >= 2000) return 'platinum';
  if (points >= 1000) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
};

/**
 * Obtient les infos du niveau de fidélité
 */
export const getLoyaltyInfo = (level: string) => {
  const info = {
    bronze: {
      name: 'Bronze',
      icon: '🥉',
      discount: 5,
      color: '#CD7F32',
    },
    silver: {
      name: 'Argent',
      icon: '🥈',
      discount: 8,
      color: '#C0C0C0',
    },
    gold: {
      name: 'Or',
      icon: '🥇',
      discount: 12,
      color: '#FFD700',
    },
    platinum: {
      name: 'Platine',
      icon: '💎',
      discount: 15,
      color: '#E5E4E2',
    },
  };

  return info[level as keyof typeof info] || info.bronze;
};

/**
 * Classe utilitaire pour combiner des classes CSS
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
