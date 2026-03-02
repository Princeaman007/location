/**
 * 🎮 DÉMO INTERACTIVE - Système de Tarification Dégressive
 * 
 * Copiez-collez ces exemples dans la console du navigateur (F12)
 * pour tester le système de tarification
 */

// ========================================
// 1️⃣ IMPORT DES FONCTIONS
// ========================================

import { 
  calculateRentalPrice, 
  getDiscountTier,
  formatCurrency,
  getStartingPrice 
} from './priceCalculator';

// ========================================
// 2️⃣ EXEMPLES SIMPLES
// ========================================

console.log('🚗 SYSTÈME DE TARIFICATION DÉGRESSIVE - DÉMO\n');

// Exemple 1: Prix de base (1 jour)
console.log('📌 Exemple 1: Location 1 jour sans options');
const ex1 = calculateRentalPrice(50000, 1, false, []);
console.log(`Prix/jour: ${formatCurrency(ex1.tierRate)}`);
console.log(`Total: ${formatCurrency(ex1.total)}`);
console.log(`Réduction: ${ex1.discount}%\n`);

// Exemple 2: Une semaine (-10%)
console.log('📌 Exemple 2: Location 1 semaine');
const ex2 = calculateRentalPrice(50000, 7, false, []);
console.log(`Prix/jour: ${formatCurrency(ex2.tierRate)}`);
console.log(`Total: ${formatCurrency(ex2.total)}`);
console.log(`Réduction: ${ex2.discount}%`);
console.log(`Économies: ${formatCurrency(ex2.savings)} ✨\n`);

// Exemple 3: Un mois (-30%)
console.log('📌 Exemple 3: Location 1 mois');
const ex3 = calculateRentalPrice(50000, 30, false, []);
console.log(`Prix/jour: ${formatCurrency(ex3.tierRate)}`);
console.log(`Total: ${formatCurrency(ex3.total)}`);
console.log(`Réduction: ${ex3.discount}%`);
console.log(`Économies: ${formatCurrency(ex3.savings)} 🎉\n`);

// ========================================
// 3️⃣ AVEC CHAUFFEUR
// ========================================

console.log('👨‍✈️ AVEC SERVICE CHAUFFEUR\n');

console.log('📌 Location 7 jours avec chauffeur');
const ex4 = calculateRentalPrice(50000, 7, true, [], 15000);
console.log(`Véhicule: ${formatCurrency(ex4.vehicleSubtotal)}`);
console.log(`Chauffeur: ${formatCurrency(ex4.driverCost)}`);
console.log(`Total: ${formatCurrency(ex4.total)}`);
console.log(`Économies totales: ${formatCurrency(ex4.savings)}\n`);

// ========================================
// 4️⃣ AVEC OPTIONS
// ========================================

console.log('🎯 AVEC OPTIONS SUPPLÉMENTAIRES\n');

const options = [
  { name: 'GPS', dailyPrice: 2000 },
  { name: 'Siège bébé', dailyPrice: 3000 },
];

console.log('📌 Location 14 jours avec GPS + Siège bébé');
const ex5 = calculateRentalPrice(50000, 14, false, options);
console.log(`Véhicule: ${formatCurrency(ex5.vehicleSubtotal)}`);
console.log(`Options: ${formatCurrency(ex5.optionsCost)}`);
console.log(`Total: ${formatCurrency(ex5.total)}`);
console.log(`Réduction: ${ex5.discount}%\n`);

// ========================================
// 5️⃣ TABLEAU COMPARATIF
// ========================================

console.log('📊 TABLEAU COMPARATIF DES TARIFS\n');
console.log('Prix de base du véhicule: 50,000 FCFA/jour\n');

const durations = [1, 3, 7, 14, 21, 30, 60, 90];

console.table(
  durations.map(days => {
    const calc = calculateRentalPrice(50000, days, false, []);
    return {
      'Durée': `${days} jour${days > 1 ? 's' : ''}`,
      'Réduction': `${calc.discount}%`,
      'Prix/jour': formatCurrency(calc.tierRate),
      'Total': formatCurrency(calc.total),
      'Économies': formatCurrency(calc.savings),
    };
  })
);

// ========================================
// 6️⃣ SIMULATIONS COMPLÈTES
// ========================================

console.log('\n💼 SIMULATIONS BUSINESS\n');

// Simulation 1: Entreprise - Location 3 mois
console.log('📌 Simulation Entreprise: 90 jours avec chauffeur');
const business1 = calculateRentalPrice(80000, 90, true, [], 15000);
console.log(`Véhicule: ${formatCurrency(business1.vehicleSubtotal)}`);
console.log(`Chauffeur: ${formatCurrency(business1.driverCost)}`);
console.log(`Total: ${formatCurrency(business1.total)}`);
console.log(`Économies: ${formatCurrency(business1.savings)} (${business1.savingsPercentage.toFixed(1)}%)`);
console.log(`Prix équivalent sans réduction: ${formatCurrency(business1.total + business1.savings)}\n`);

// Simulation 2: Tourisme - Week-end
console.log('📌 Simulation Tourisme: Week-end (2 jours)');
const tourism1 = calculateRentalPrice(35000, 2, false, [
  { name: 'GPS', dailyPrice: 2000 }
]);
console.log(`Total: ${formatCurrency(tourism1.total)}`);
console.log(`💡 Suggestion: Louez 1 jour de plus pour bénéficier de -5%!\n`);

// Simulation 3: Famille - Vacances (15 jours)
console.log('📌 Simulation Famille: Vacances (15 jours) avec options');
const family1 = calculateRentalPrice(60000, 15, false, [
  { name: 'GPS', dailyPrice: 2000 },
  { name: 'Siège bébé', dailyPrice: 3000 },
  { name: 'Assurance premium', dailyPrice: 5000 },
]);
console.log(`Véhicule: ${formatCurrency(family1.vehicleSubtotal)}`);
console.log(`Options: ${formatCurrency(family1.optionsCost)}`);
console.log(`Total: ${formatCurrency(family1.total)}`);
console.log(`Économies sur le véhicule: ${formatCurrency(family1.savings)}\n`);

// ========================================
// 7️⃣ PRIX "À PARTIR DE" POUR LE CATALOGUE
// ========================================

console.log('🏷️ PRIX "À PARTIR DE" (pour catalogue)\n');

const vehicles = [
  { name: 'Économique', pricePerDay: 25000 },
  { name: 'Berline', pricePerDay: 50000 },
  { name: 'SUV', pricePerDay: 75000 },
  { name: 'Luxe', pricePerDay: 150000 },
];

console.table(
  vehicles.map(v => ({
    'Catégorie': v.name,
    'Prix normal': formatCurrency(v.pricePerDay),
    'À partir de': formatCurrency(getStartingPrice(v.pricePerDay)),
    'Économie': formatCurrency(v.pricePerDay - getStartingPrice(v.pricePerDay)),
  }))
);

// ========================================
// 8️⃣ TESTS INTERACTIFS
// ========================================

console.log('\n🎮 TESTEZ VOUS-MÊME!\n');
console.log('Utilisez ces fonctions dans la console:');
console.log(`
// Calculer un prix
const result = calculateRentalPrice(
  50000,  // Prix véhicule/jour
  7,      // Nombre de jours
  true,   // Avec chauffeur?
  [       // Options
    { name: 'GPS', dailyPrice: 2000 }
  ]
);

console.log('Total:', formatCurrency(result.total));
console.log('Économies:', formatCurrency(result.savings));
console.log('Réduction:', result.discount + '%');

// Voir les détails
console.log(result.breakdown);

// Quelle réduction pour X jours?
console.log('Réduction pour 15 jours:', getDiscountTier(15) + '%');

// Prix de départ pour le catalogue
console.log('À partir de:', formatCurrency(getStartingPrice(50000)));
`);

// ========================================
// 9️⃣ CONSEILS D'OPTIMISATION
// ========================================

console.log('\n💡 CONSEILS D\'OPTIMISATION\n');

const testDurations = [2, 6, 13, 20, 29];

testDurations.forEach(days => {
  const calc = calculateRentalPrice(50000, days, false, []);
  if (calc.nextTierDays && calc.nextTierDiscount) {
    const additional = calc.nextTierDays - days;
    console.log(`📍 ${days} jours (${calc.discount}%)`);
    console.log(`   👉 Louez ${additional} jour${additional > 1 ? 's' : ''} de plus → ${calc.nextTierDiscount}% de réduction\n`);
  }
});

// ========================================
// 🔟 COMPARAISON AVANT/APRÈS
// ========================================

console.log('⚖️ AVANT/APRÈS SYSTÈME DE RÉDUCTION\n');

const testCases = [
  { days: 7, vehicle: 50000, driver: true },
  { days: 30, vehicle: 50000, driver: true },
  { days: 90, vehicle: 50000, driver: false },
];

testCases.forEach(test => {
  const withDiscount = calculateRentalPrice(test.vehicle, test.days, test.driver);
  const withoutDiscount = test.vehicle * test.days + (test.driver ? 15000 * test.days : 0);
  
  console.log(`📌 ${test.days} jours ${test.driver ? 'avec chauffeur' : 'sans chauffeur'}`);
  console.log(`   Sans réduction: ${formatCurrency(withoutDiscount)}`);
  console.log(`   Avec réduction: ${formatCurrency(withDiscount.total)}`);
  console.log(`   💰 Économie: ${formatCurrency(withDiscount.savings)} (${withDiscount.discount}%)\n`);
});

console.log('✅ Démo terminée! Le système est opérationnel.');
