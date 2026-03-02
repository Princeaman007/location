import { formatCurrency, getDiscountTier } from '../../utils/priceCalculator';

interface VehiclePricingSectionProps {
  vehicleDailyRate: number;
  chauffeurDailyRate?: number;
  className?: string;
}

const VehiclePricingSection = ({
  vehicleDailyRate,
  chauffeurDailyRate = 15000,
  className = '',
}: VehiclePricingSectionProps) => {
  // Définir les paliers de tarification
  const pricingTiers = [
    { days: '1-2 jours', discount: 0, minDays: 1, maxDays: 2 },
    { days: '3-6 jours', discount: 5, minDays: 3, maxDays: 6 },
    { days: '7-13 jours', discount: 10, minDays: 7, maxDays: 13 },
    { days: '14-20 jours', discount: 15, minDays: 14, maxDays: 20 },
    { days: '21-29 jours', discount: 20, minDays: 21, maxDays: 29 },
    { days: '30+ jours', discount: 30, minDays: 30, maxDays: 30 },
  ];

  // Calculer les prix pour chaque palier
  const calculateTierPrice = (discount: number) => {
    return vehicleDailyRate * (1 - discount / 100);
  };

  const calculateTierDriverPrice = (discount: number) => {
    return chauffeurDailyRate * (1 - discount / 100);
  };

  // Calcul d'exemple pour 7 jours (pour mettre en avant)
  const exampleDays = 7;
  const exampleDiscount = getDiscountTier(exampleDays);
  const examplePrice = calculateTierPrice(exampleDiscount);
  const exampleTotal = examplePrice * exampleDays;
  const exampleSavings = (vehicleDailyRate - examplePrice) * exampleDays;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tarification & Réductions</h2>
        <p className="text-gray-600">
          Plus vous louez longtemps, plus vous économisez ! Profitez de nos tarifs dégressifs.
        </p>
      </div>

      {/* Exemple mis en avant */}
      <div className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] rounded-lg p-6 text-white mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-bold">Exemple : Location 7 jours</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Prix par jour</p>
            <p className="text-2xl font-bold">{formatCurrency(examplePrice)}</p>
            <p className="text-xs text-white/70 line-through">
              au lieu de {formatCurrency(vehicleDailyRate)}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(exampleTotal)}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Vous économisez</p>
            <p className="text-2xl font-bold">{formatCurrency(exampleSavings)}</p>
            <p className="text-xs text-white/90">soit {exampleDiscount}% de réduction</p>
          </div>
        </div>
      </div>

      {/* Tableau des tarifs */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Grille tarifaire véhicule</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Réduction
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Prix / jour
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Économie / jour
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingTiers.map((tier, index) => {
                const tierPrice = calculateTierPrice(tier.discount);
                const saving = vehicleDailyRate - tierPrice;
                const isHighlighted = tier.discount >= 10;

                return (
                  <tr
                    key={index}
                    className={`${
                      isHighlighted ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          isHighlighted ? 'text-green-900' : 'text-gray-900'
                        }`}
                      >
                        {tier.days}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tier.discount > 0 ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tier.discount >= 20
                              ? 'bg-green-100 text-green-800'
                              : tier.discount >= 10
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          -{tier.discount}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Prix plein</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span
                        className={`text-sm font-bold ${
                          isHighlighted ? 'text-green-700' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(tierPrice)}
                      </span>
                      {tier.discount > 0 && (
                        <div className="text-xs text-gray-400 line-through">
                          {formatCurrency(vehicleDailyRate)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {tier.discount > 0 ? (
                        <span className="text-sm font-medium text-green-600">
                          +{formatCurrency(saving)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarifs chauffeur */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Service chauffeur (optionnel)</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👨‍✈️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                Profitez de votre voyage en toute tranquillité avec un chauffeur professionnel.
                Les mêmes réductions s'appliquent au service chauffeur !
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tarif de base</p>
                  <p className="font-bold text-gray-900">{formatCurrency(chauffeurDailyRate)}/jour</p>
                </div>
                <div>
                  <p className="text-gray-600">À partir de (30+ jours)</p>
                  <p className="font-bold text-[#FF8C42]">
                    {formatCurrency(calculateTierDriverPrice(30))}/jour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Avantages inclus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Kilométrage illimité',
            'Assistance 24/7',
            'Entretien véhicule inclus',
            'Prise en charge flexible',
            'Pas de frais cachés',
          ].map((advantage, index) => (
            <div key={index} className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">{advantage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Bon à savoir</p>
            <p className="text-blue-700">
              Les réductions sont calculées automatiquement en fonction de la durée de votre
              location. Aucune démarche supplémentaire nécessaire !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclePricingSection;
