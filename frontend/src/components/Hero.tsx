import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';

interface SearchFormData {
  city: string;
  startDate: string;
  endDate: string;
  vehicleType: string;
  withDriver: boolean;
}

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SearchFormData>({
    city: '',
    startDate: '',
    endDate: '',
    vehicleType: '',
    withDriver: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construire l'URL avec les paramètres de recherche
    const params = new URLSearchParams();
    if (formData.city) params.append('ville', formData.city);
    if (formData.startDate) params.append('startDate', formData.startDate);
    if (formData.endDate) params.append('endDate', formData.endDate);
    if (formData.vehicleType) params.append('categorie', formData.vehicleType);
    if (formData.withDriver) params.append('withDriver', 'true');
    
    // Rediriger vers le catalogue avec les filtres
    navigate(`/vehicles?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <section className="hero">
      <div className="container py-20 tablet:py-32">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-12 items-center">
          {/* Contenu */}
          <div className="text-center tablet:text-left space-y-6 animate-fadeIn">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-medium">Plus de 500 véhicules disponibles</span>
            </div>
            <h1 className="text-h1 font-heading font-bold text-balance">
              Louez votre véhicule en toute confiance
            </h1>
            <p className="text-xl text-white/90 max-w-xl">
              Avec ou sans chauffeur, partout en Côte d'Ivoire. 
              Large choix de véhicules récents et paiement flexible.
            </p>

            {/* Points forts */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">Support 24/7</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">Véhicules récents</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">Prix transparents</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <span className="text-sm font-medium">Paiement flexible</span>
              </div>
            </div>
          </div>

          {/* Formulaire de recherche */}
          <div className="card p-6 tablet:p-8 animate-slideUp bg-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-semibold">
                Réservez maintenant
              </h2>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                RAPIDE
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">{/* Ville */}
              <div>
                <label className="label">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ville de prise en charge
                </label>
                <select 
                  name="city"
                  className="input cursor-pointer text-dark bg-white"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option value="" className="text-gray-500">Sélectionner une ville</option>
                  <option value="Abidjan" className="text-dark">Abidjan</option>
                  <option value="Yamoussoukro" className="text-dark">Yamoussoukro</option>
                  <option value="San-Pédro" className="text-dark">San-Pédro</option>
                  <option value="Bouaké" className="text-dark">Bouaké</option>
                  <option value="Korhogo" className="text-dark">Korhogo</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date début
                  </label>
                  <input 
                    type="date" 
                    name="startDate"
                    className="input bg-white text-dark"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date fin
                  </label>
                  <input 
                    type="date" 
                    name="endDate"
                    className="input bg-white text-dark"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Type véhicule */}
              <div>
                <label className="label">Type de véhicule</label>
                <select 
                  name="vehicleType"
                  className="input cursor-pointer text-dark bg-white"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="" className="text-gray-500">Tous les véhicules</option>
                  <option value="economique" className="text-dark">Économique</option>
                  <option value="berline" className="text-dark">Berline</option>
                  <option value="suv" className="text-dark">SUV</option>
                  <option value="4x4" className="text-dark">4x4</option>
                  <option value="minibus" className="text-dark">Minibus</option>
                  <option value="luxe" className="text-dark">Luxe</option>
                </select>
              </div>

              {/* Chauffeur */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="withDriver"
                    name="withDriver"
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                    checked={formData.withDriver}
                    onChange={handleChange}
                  />
                  <label htmlFor="withDriver" className="text-sm font-medium cursor-pointer">
                    Avec chauffeur professionnel
                  </label>
                </div>
              </div>

              {/* Bouton */}
              <button type="submit" className="btn btn-primary w-full shadow-lg hover:shadow-xl transition-shadow">
                <Search className="w-5 h-5 mr-2" />
                Rechercher des véhicules
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                Paiement en ligne ou à la livraison
              </p>
              <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                Réservation sécurisée et garantie
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vague décorative */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
