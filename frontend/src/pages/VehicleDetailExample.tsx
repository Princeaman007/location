import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import PriceCalculator from '../components/booking/PriceCalculator';
import VehiclePricingSection from '../components/vehicles/VehiclePricingSection';
import toast from 'react-hot-toast';

/**
 * EXEMPLE D'INTÉGRATION du système de tarification dégressive
 * dans la page de détail d'un véhicule
 * 
 * Ce fichier montre comment utiliser :
 * - PriceCalculator : Récapitulatif des prix avec suggestions
 * - VehiclePricingSection : Tableau détaillé des tarifs
 */

const VehicleDetailExample = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // État pour le calculateur de prix
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [withDriver, setWithDriver] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Array<{ name: string; dailyPrice: number }>>([]);

  // Options disponibles
  const availableOptions = [
    { name: 'GPS', dailyPrice: 2000 },
    { name: 'Siège bébé', dailyPrice: 3000 },
    { name: 'Chaînes à neige', dailyPrice: 5000 },
  ];

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (option: { name: string; dailyPrice: number }) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.name === option.name);
      if (exists) {
        return prev.filter(opt => opt.name !== option.name);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleReservation = () => {
    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner des dates');
      return;
    }

    // Rediriger vers la page de réservation avec les paramètres
    // navigate(`/booking/${vehicle._id}?start=${startDate}&end=${endDate}&driver=${withDriver}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Véhicule non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLONNE PRINCIPALE - 2/3 de la largeur */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images et informations du véhicule */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image principale */}
              <div className="relative h-96">
                <img
                  src={vehicle.images?.[0]?.url || vehicle.images?.[0] || '/placeholder.jpg'}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Détails du véhicule */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {vehicle.brand} {vehicle.model}
                    </h1>
                    <p className="text-gray-600">{vehicle.year}</p>
                  </div>
                  <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                    {vehicle.category}
                  </span>
                </div>

                {/* Caractéristiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="text-xs text-gray-500">Places</p>
                      <p className="font-medium">{vehicle.specifications.seats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <p className="text-xs text-gray-500">Transmission</p>
                      <p className="font-medium capitalize">{vehicle.specifications.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⛽</span>
                    <div>
                      <p className="text-xs text-gray-500">Carburant</p>
                      <p className="font-medium capitalize">{vehicle.specifications.fuel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❄️</span>
                    <div>
                      <p className="text-xs text-gray-500">Climatisation</p>
                      <p className="font-medium">
                        {vehicle.specifications.features?.airConditioning ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{vehicle.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION TARIFICATION DÉTAILLÉE */}
            <VehiclePricingSection
              vehicleDailyRate={vehicle.pricing.daily}
              chauffeurDailyRate={vehicle.pricing.chauffeurSupplement || 15000}
            />
          </div>

          {/* SIDEBAR - 1/3 de la largeur - STICKY */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Formulaire de sélection */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Réserver ce véhicule</h3>

                {/* Date de début */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Date de fin */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    min={startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Service chauffeur */}
                {vehicle.chauffeurAvailable && (
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={withDriver}
                        onChange={(e) => setWithDriver(e.target.checked)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">Avec chauffeur</span>
                        <p className="text-xs text-gray-500">
                          +{(vehicle.pricing.chauffeurSupplement || 15000).toLocaleString()} FCFA/jour
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Options supplémentaires */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options supplémentaires
                  </label>
                  <div className="space-y-2">
                    {availableOptions.map((option) => (
                      <label
                        key={option.name}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptions.some(opt => opt.name === option.name)}
                          onChange={() => handleOptionToggle(option)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-gray-900">{option.name}</span>
                          <span className="text-sm text-gray-600">
                            +{option.dailyPrice.toLocaleString()} FCFA/jour
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bouton de réservation */}
                <button
                  onClick={handleReservation}
                  disabled={!startDate || !endDate}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continuer la réservation
                </button>
              </div>

              {/* CALCULATEUR DE PRIX - STICKY */}
              <PriceCalculator
                vehicle={vehicle}
                startDate={startDate}
                endDate={endDate}
                withDriver={withDriver}
                options={selectedOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailExample;
