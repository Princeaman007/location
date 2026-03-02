import { useEffect, useState } from 'react';
import {
  calculateRentalPrice,
  calculateDays,
  formatCurrency,
  RentalPriceCalculation,
  PriceOption,
} from '../../utils/priceCalculator';

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  pricing: {
    daily: number;
    chauffeurSupplement?: number;
  };
}

interface PriceCalculatorProps {
  vehicle: Vehicle;
  startDate: Date | null;
  endDate: Date | null;
  withDriver: boolean;
  options?: PriceOption[];
  className?: string;
}

const PriceCalculator = ({
  vehicle,
  startDate,
  endDate,
  withDriver,
  options = [],
  className = '',
}: PriceCalculatorProps) => {
  const [calculation, setCalculation] = useState<RentalPriceCalculation | null>(null);
  const [numberOfDays, setNumberOfDays] = useState<number>(0);

  useEffect(() => {
    if (startDate && endDate && startDate < endDate) {
      const days = calculateDays(startDate, endDate);
      setNumberOfDays(days);

      try {
        const result = calculateRentalPrice(
          vehicle.pricing.daily,
          days,
          withDriver,
          options,
          vehicle.pricing.chauffeurSupplement || 15000
        );
        setCalculation(result);
      } catch (error) {
        console.error('Erreur calcul prix:', error);
        setCalculation(null);
      }
    } else {
      setCalculation(null);
      setNumberOfDays(0);
    }
  }, [vehicle, startDate, endDate, withDriver, options]);

  if (!calculation || numberOfDays === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h3>
        <p className="text-gray-500 text-center py-8">
          Sélectionnez vos dates pour voir le prix
        </p>
      </div>
    );
  }

  const showOptimizationTip = calculation.nextTierDays && calculation.nextTierDiscount;
  const additionalDays = calculation.nextTierDays ? calculation.nextTierDays - numberOfDays : 0;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 sticky top-4 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h3>

      {/* Badge de réduction */}
      {calculation.discount > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <p className="text-green-800 font-bold text-sm">
                Réduction {calculation.discount}% appliquée !
              </p>
              <p className="text-green-600 text-xs">
                Vous économisez {formatCurrency(calculation.savings)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Détails de tarification */}
      <div className="space-y-3 mb-4">
        {/* Véhicule */}
        <div className="border-b border-gray-200 pb-3">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-700">
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(calculation.vehicleSubtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {formatCurrency(calculation.breakdown.vehicle.dailyRate)}/jour × {numberOfDays} jour
              {numberOfDays > 1 ? 's' : ''}
            </span>
            {calculation.discount > 0 && (
              <span className="line-through text-gray-400">
                {formatCurrency(vehicle.pricing.daily * numberOfDays)}
              </span>
            )}
          </div>
        </div>

        {/* Chauffeur */}
        {calculation.breakdown.driver && (
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm text-gray-700">Service chauffeur</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(calculation.driverCost)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {formatCurrency(calculation.breakdown.driver.dailyRate)}/jour × {numberOfDays} jour
                {numberOfDays > 1 ? 's' : ''}
              </span>
              {calculation.discount > 0 && (
                <span className="line-through text-gray-400">
                  {formatCurrency(
                    (vehicle.pricing.chauffeurSupplement || 15000) * numberOfDays
                  )}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Options */}
        {calculation.breakdown.options.map((option, index) => (
          <div key={index} className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm text-gray-700">{option.name}</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(option.subtotal)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {formatCurrency(option.dailyRate)}/jour × {numberOfDays} jour
              {numberOfDays > 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-200 pt-4 mb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-base font-semibold text-gray-700">Total</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FF8C42]">
              {formatCurrency(calculation.total)}
            </div>
            {calculation.discount > 0 && calculation.savings > 0 && (
              <div className="text-sm text-green-600 font-medium mt-1">
                Économie : {formatCurrency(calculation.savings)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion d'optimisation */}
      {showOptimizationTip && additionalDays > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
            </svg>
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-800 mb-1">Astuce :</p>
              <p className="text-xs text-yellow-700">
                Louez {additionalDays} jour{additionalDays > 1 ? 's' : ''} de plus et bénéficiez
                de {calculation.nextTierDiscount}% de réduction au lieu de {calculation.discount}%
                !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Durée de location */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Durée de location</span>
          <span className="font-medium">
            {numberOfDays} jour{numberOfDays > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
