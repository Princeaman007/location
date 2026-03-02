/**
 * Fonctions utilitaires pour le calcul des prix dégressifs
 * Utilisé pour les calculs côté backend (validation, statistiques, etc.)
 */

/**
 * Détermine le pourcentage de réduction selon le nombre de jours
 * @param {number} days - Nombre de jours de location
 * @returns {number} - Pourcentage de réduction (0-30)
 */
export const getDiscountTier = (days) => {
  if (days >= 30) return 30;
  if (days >= 21) return 20;
  if (days >= 14) return 15;
  if (days >= 7) return 10;
  if (days >= 3) return 5;
  return 0;
};

/**
 * Calcule le prix total de location avec réductions
 * @param {number} vehicleDailyRate - Prix journalier du véhicule
 * @param {number} numberOfDays - Nombre de jours de location
 * @param {boolean} withDriver - Inclure un chauffeur
 * @param {Array} options - Options supplémentaires [{name, dailyPrice}]
 * @param {number} driverDailyRate - Prix journalier du chauffeur (défaut: 15000)
 * @returns {Object} - Détails du calcul
 */
export const calculateRentalPrice = (
  vehicleDailyRate,
  numberOfDays,
  withDriver = false,
  options = [],
  driverDailyRate = 15000
) => {
  // Déterminer le pourcentage de réduction
  const discount = getDiscountTier(numberOfDays);
  const discountMultiplier = (100 - discount) / 100;

  // Calcul du prix du véhicule après réduction
  const tierRate = vehicleDailyRate * discountMultiplier;
  const vehicleSubtotal = tierRate * numberOfDays;

  // Calcul du coût du chauffeur avec même réduction
  const driverCost = withDriver
    ? driverDailyRate * discountMultiplier * numberOfDays
    : 0;

  // Calcul des options (pas de réduction sur les options)
  const optionsCost = options.reduce(
    (total, option) => total + option.dailyPrice * numberOfDays,
    0
  );

  // Total général
  const total = vehicleSubtotal + driverCost + optionsCost;

  // Calcul des économies
  const fullPriceVehicle = vehicleDailyRate * numberOfDays;
  const fullPriceDriver = withDriver ? driverDailyRate * numberOfDays : 0;
  const fullPriceTotal = fullPriceVehicle + fullPriceDriver + optionsCost;
  const savings = fullPriceTotal - total;

  return {
    tierRate,
    discount,
    vehicleSubtotal,
    driverCost,
    optionsCost,
    total,
    savings,
    numberOfDays,
  };
};

/**
 * Calcule le prix "À partir de" avec réduction maximale (30%)
 * @param {number} vehicleDailyRate - Prix journalier du véhicule
 * @returns {number} - Prix avec réduction maximale
 */
export const getStartingPrice = (vehicleDailyRate) => {
  return Math.round(vehicleDailyRate * 0.7); // -30%
};

/**
 * Valide une période de réservation
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {Object} - {isValid, message, days}
 */
export const validateReservationPeriod = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Vérifier que les dates sont valides
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      message: 'Dates invalides',
      days: 0,
    };
  }

  // Vérifier que la date de début est dans le futur
  if (start < now) {
    return {
      isValid: false,
      message: 'La date de début doit être dans le futur',
      days: 0,
    };
  }

  // Vérifier que la date de fin est après la date de début
  if (end <= start) {
    return {
      isValid: false,
      message: 'La date de fin doit être après la date de début',
      days: 0,
    };
  }

  // Calculer le nombre de jours
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isValid: true,
    message: 'Période valide',
    days,
  };
};
