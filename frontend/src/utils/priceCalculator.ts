/**
 * Système de tarification dégressive pour la location de véhicules
 * Grille tarifaire basée sur la durée de location
 */

export interface PriceOption {
  name: string;
  dailyPrice: number;
}

export interface PriceBreakdown {
  vehicle: {
    dailyRate: number;
    days: number;
    subtotal: number;
  };
  driver: {
    dailyRate: number;
    days: number;
    subtotal: number;
  } | null;
  options: {
    name: string;
    dailyRate: number;
    days: number;
    subtotal: number;
  }[];
}

export interface RentalPriceCalculation {
  tierRate: number;           // Prix/jour après réduction
  discount: number;           // % de réduction (0, 5, 10, 15, 20, 30)
  vehicleSubtotal: number;    // Sous-total véhicule
  driverCost: number;         // Coût chauffeur
  optionsCost: number;        // Coût options
  total: number;              // Total général
  savings: number;            // Économies réalisées en FCFA
  savingsPercentage: number;  // % économisé
  breakdown: PriceBreakdown;  // Détails pour affichage
  nextTierDays?: number;      // Jours pour atteindre la prochaine réduction
  nextTierDiscount?: number;  // % de la prochaine réduction
}

/**
 * Détermine le pourcentage de réduction selon le nombre de jours
 */
export const getDiscountTier = (days: number): number => {
  if (days >= 30) return 30;
  if (days >= 21) return 20;
  if (days >= 14) return 15;
  if (days >= 7) return 10;
  if (days >= 3) return 5;
  return 0;
};

/**
 * Trouve le prochain palier de réduction
 */
export const getNextTier = (days: number): { days: number; discount: number } | null => {
  if (days < 3) return { days: 3, discount: 5 };
  if (days < 7) return { days: 7, discount: 10 };
  if (days < 14) return { days: 14, discount: 15 };
  if (days < 21) return { days: 21, discount: 20 };
  if (days < 30) return { days: 30, discount: 30 };
  return null;
};

/**
 * Calcule le prix de location avec réductions dégressives
 * @param vehicleDailyRate - Prix journalier du véhicule
 * @param numberOfDays - Nombre de jours de location
 * @param withDriver - Inclure un chauffeur (défaut: false)
 * @param options - Options supplémentaires (GPS, siège bébé, etc.)
 * @param driverDailyRate - Prix journalier du chauffeur (défaut: 15000 FCFA)
 */
export const calculateRentalPrice = (
  vehicleDailyRate: number,
  numberOfDays: number,
  withDriver: boolean = false,
  options: PriceOption[] = [],
  driverDailyRate: number = 15000
): RentalPriceCalculation => {
  // Validation des entrées
  if (vehicleDailyRate <= 0 || numberOfDays <= 0) {
    throw new Error('Le prix journalier et le nombre de jours doivent être positifs');
  }

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
  const savingsPercentage = fullPriceTotal > 0 ? (savings / fullPriceTotal) * 100 : 0;

  // Prochain palier
  const nextTier = getNextTier(numberOfDays);

  // Détails pour affichage
  const breakdown: PriceBreakdown = {
    vehicle: {
      dailyRate: tierRate,
      days: numberOfDays,
      subtotal: vehicleSubtotal,
    },
    driver: withDriver
      ? {
          dailyRate: driverDailyRate * discountMultiplier,
          days: numberOfDays,
          subtotal: driverCost,
        }
      : null,
    options: options.map((option) => ({
      name: option.name,
      dailyRate: option.dailyPrice,
      days: numberOfDays,
      subtotal: option.dailyPrice * numberOfDays,
    })),
  };

  return {
    tierRate,
    discount,
    vehicleSubtotal,
    driverCost,
    optionsCost,
    total,
    savings,
    savingsPercentage,
    breakdown,
    nextTierDays: nextTier?.days,
    nextTierDiscount: nextTier?.discount,
  };
};

/**
 * Calcule le prix "À partir de" pour affichage dans le catalogue
 * Utilise la réduction maximale (30% pour 30+ jours)
 */
export const getStartingPrice = (vehicleDailyRate: number): number => {
  return Math.round(vehicleDailyRate * 0.7); // -30%
};

/**
 * Formate un montant en FCFA avec séparateurs de milliers
 */
export const formatCurrency = (amount: number): string => {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
};

/**
 * Calcule le nombre de jours entre deux dates
 */
export const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
