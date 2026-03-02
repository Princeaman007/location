/**
 * Tests pour le système de tarification dégressive
 * 
 * Pour exécuter ces tests :
 * npm test -- priceCalculator.test.ts
 */

import {
  calculateRentalPrice,
  getDiscountTier,
  getNextTier,
  getStartingPrice,
  formatCurrency,
  calculateDays,
} from '../utils/priceCalculator';

describe('Système de Tarification Dégressive', () => {
  
  describe('getDiscountTier', () => {
    test('0% pour 1-2 jours', () => {
      expect(getDiscountTier(1)).toBe(0);
      expect(getDiscountTier(2)).toBe(0);
    });

    test('-5% pour 3-6 jours', () => {
      expect(getDiscountTier(3)).toBe(5);
      expect(getDiscountTier(6)).toBe(5);
    });

    test('-10% pour 7-13 jours', () => {
      expect(getDiscountTier(7)).toBe(10);
      expect(getDiscountTier(13)).toBe(10);
    });

    test('-15% pour 14-20 jours', () => {
      expect(getDiscountTier(14)).toBe(15);
      expect(getDiscountTier(20)).toBe(15);
    });

    test('-20% pour 21-29 jours', () => {
      expect(getDiscountTier(21)).toBe(20);
      expect(getDiscountTier(29)).toBe(20);
    });

    test('-30% pour 30+ jours', () => {
      expect(getDiscountTier(30)).toBe(30);
      expect(getDiscountTier(100)).toBe(30);
    });
  });

  describe('getNextTier', () => {
    test('Suggère 3 jours pour 1-2 jours', () => {
      const next = getNextTier(2);
      expect(next).toEqual({ days: 3, discount: 5 });
    });

    test('Suggère 7 jours pour 3-6 jours', () => {
      const next = getNextTier(5);
      expect(next).toEqual({ days: 7, discount: 10 });
    });

    test('Pas de suggestion au-delà de 30 jours', () => {
      const next = getNextTier(30);
      expect(next).toBeNull();
    });
  });

  describe('calculateRentalPrice', () => {
    test('Location 1 jour sans options', () => {
      const result = calculateRentalPrice(50000, 1, false, []);
      
      expect(result.discount).toBe(0);
      expect(result.tierRate).toBe(50000);
      expect(result.vehicleSubtotal).toBe(50000);
      expect(result.driverCost).toBe(0);
      expect(result.total).toBe(50000);
      expect(result.savings).toBe(0);
    });

    test('Location 7 jours avec -10%', () => {
      const result = calculateRentalPrice(50000, 7, false, []);
      
      expect(result.discount).toBe(10);
      expect(result.tierRate).toBe(45000); // 50000 * 0.9
      expect(result.vehicleSubtotal).toBe(315000); // 45000 * 7
      expect(result.total).toBe(315000);
      expect(result.savings).toBe(35000); // 50000*7 - 45000*7
    });

    test('Location 30 jours avec chauffeur et -30%', () => {
      const result = calculateRentalPrice(50000, 30, true, [], 15000);
      
      expect(result.discount).toBe(30);
      expect(result.tierRate).toBe(35000); // 50000 * 0.7
      expect(result.vehicleSubtotal).toBe(1050000); // 35000 * 30
      expect(result.driverCost).toBe(315000); // 15000 * 0.7 * 30
      expect(result.total).toBe(1365000);
      expect(result.savings).toBe(585000);
    });

    test('Location avec options', () => {
      const options = [
        { name: 'GPS', dailyPrice: 2000 },
        { name: 'Siège bébé', dailyPrice: 3000 },
      ];
      
      const result = calculateRentalPrice(50000, 5, false, options);
      
      expect(result.discount).toBe(5);
      expect(result.optionsCost).toBe(25000); // (2000 + 3000) * 5
      expect(result.total).toBe(262500); // véhicule + options
    });

    test('Calcul correct des suggestions', () => {
      const result = calculateRentalPrice(50000, 5, false, []);
      
      expect(result.nextTierDays).toBe(7);
      expect(result.nextTierDiscount).toBe(10);
    });

    test('Erreur si prix négatif', () => {
      expect(() => {
        calculateRentalPrice(-1000, 5, false, []);
      }).toThrow();
    });

    test('Erreur si jours négatif', () => {
      expect(() => {
        calculateRentalPrice(50000, -5, false, []);
      }).toThrow();
    });
  });

  describe('getStartingPrice', () => {
    test('Calcule le prix avec -30%', () => {
      expect(getStartingPrice(50000)).toBe(35000);
      expect(getStartingPrice(100000)).toBe(70000);
      expect(getStartingPrice(25000)).toBe(17500);
    });
  });

  describe('formatCurrency', () => {
    test('Formate correctement les montants', () => {
      expect(formatCurrency(50000)).toBe('50 000 FCFA');
      expect(formatCurrency(1234567)).toBe('1 234 567 FCFA');
      expect(formatCurrency(0)).toBe('0 FCFA');
    });

    test('Arrondit les décimales', () => {
      expect(formatCurrency(50000.7)).toBe('50 001 FCFA');
      expect(formatCurrency(50000.3)).toBe('50 000 FCFA');
    });
  });

  describe('calculateDays', () => {
    test('Calcule le nombre de jours entre deux dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-08');
      
      expect(calculateDays(start, end)).toBe(7);
    });

    test('Gère les dates inversées', () => {
      const start = new Date('2024-01-08');
      const end = new Date('2024-01-01');
      
      expect(calculateDays(start, end)).toBe(7);
    });

    test('Même jour = 0 jours', () => {
      const date = new Date('2024-01-01');
      
      expect(calculateDays(date, date)).toBe(0);
    });
  });

  describe('Scénarios réels', () => {
    test('Week-end (2 jours)', () => {
      const result = calculateRentalPrice(45000, 2, false, []);
      
      expect(result.discount).toBe(0);
      expect(result.total).toBe(90000);
    });

    test('Semaine complète (7 jours)', () => {
      const result = calculateRentalPrice(45000, 7, true, [
        { name: 'GPS', dailyPrice: 2000 }
      ], 15000);
      
      expect(result.discount).toBe(10);
      expect(result.vehicleSubtotal).toBe(283500); // 45000 * 0.9 * 7
      expect(result.driverCost).toBe(94500); // 15000 * 0.9 * 7
      expect(result.optionsCost).toBe(14000); // 2000 * 7
      expect(result.total).toBe(392000);
    });

    test('Mois complet (30 jours)', () => {
      const result = calculateRentalPrice(60000, 30, true, [], 15000);
      
      expect(result.discount).toBe(30);
      expect(result.vehicleSubtotal).toBe(1260000); // 60000 * 0.7 * 30
      expect(result.driverCost).toBe(315000); // 15000 * 0.7 * 30
      expect(result.total).toBe(1575000);
      expect(result.savings).toBe(675000);
      expect(result.savingsPercentage).toBe(30);
    });

    test('Location longue durée (90 jours)', () => {
      const result = calculateRentalPrice(50000, 90, false, []);
      
      expect(result.discount).toBe(30);
      expect(result.total).toBe(3150000); // 50000 * 0.7 * 90
      expect(result.savings).toBe(1350000);
    });
  });

  describe('Breakdown structure', () => {
    test('Structure correcte du breakdown', () => {
      const result = calculateRentalPrice(50000, 7, true, [
        { name: 'GPS', dailyPrice: 2000 }
      ]);

      expect(result.breakdown.vehicle).toEqual({
        dailyRate: 45000,
        days: 7,
        subtotal: 315000,
      });

      expect(result.breakdown.driver).toEqual({
        dailyRate: 13500, // 15000 * 0.9
        days: 7,
        subtotal: 94500,
      });

      expect(result.breakdown.options).toHaveLength(1);
      expect(result.breakdown.options[0]).toEqual({
        name: 'GPS',
        dailyRate: 2000,
        days: 7,
        subtotal: 14000,
      });
    });

    test('Pas de chauffeur = driver null', () => {
      const result = calculateRentalPrice(50000, 7, false, []);
      
      expect(result.breakdown.driver).toBeNull();
      expect(result.driverCost).toBe(0);
    });

    test('Pas d\'options = tableau vide', () => {
      const result = calculateRentalPrice(50000, 7, false, []);
      
      expect(result.breakdown.options).toEqual([]);
      expect(result.optionsCost).toBe(0);
    });
  });
});
