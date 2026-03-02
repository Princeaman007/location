import { Link } from 'react-router-dom';
import { getStartingPrice, formatCurrency } from '../../utils/priceCalculator';

interface Vehicle {
  _id: string;
  slug?: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  images: Array<{ url: string; isPrimary?: boolean } | string>;
  pricing: {
    daily: number;
  };
  specifications: {
    seats: number;
    transmission: string;
    fuel: string;
    features?: {
      airConditioning?: boolean;
    };
  };
  chauffeurAvailable?: boolean;
  availability?: {
    status: string;
  };
}

interface VehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}

const VehicleCard = ({ vehicle, className = '' }: VehicleCardProps) => {
  // Obtenir l'image principale
  const getPrimaryImage = () => {
    if (!vehicle.images || vehicle.images.length === 0) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EVéhicule%3C/text%3E%3C/svg%3E';
    }

    // Si c'est un tableau d'objets avec url
    if (typeof vehicle.images[0] === 'object') {
      const primaryImg = vehicle.images.find((img: any) => img.isPrimary);
      return primaryImg ? (primaryImg as any).url : (vehicle.images[0] as any).url;
    }

    // Si c'est un tableau de strings
    return vehicle.images[0] as string;
  };

  // Calcul du prix de départ avec réduction maximale
  const startingPrice = getStartingPrice(vehicle.pricing.daily);

  // Déterminer si le véhicule est disponible
  const isAvailable = vehicle.availability?.status === 'disponible';

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${className}`}
    >
      {/* Image du véhicule */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={getPrimaryImage()}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EVéhicule%3C/text%3E%3C/svg%3E';
          }}
        />

        {/* Badge catégorie */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 capitalize">
            {vehicle.category}
          </span>
        </div>

        {/* Badge disponibilité */}
        {!isAvailable && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Non disponible
            </span>
          </div>
        )}
      </div>

      {/* Contenu de la card */}
      <div className="p-5">
        {/* Titre */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-xs text-gray-500">{vehicle.year}</p>
        </div>

        {/* Badge chauffeur disponible */}
        {vehicle.chauffeurAvailable && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Chauffeur disponible
            </span>
          </div>
        )}

        {/* Caractéristiques */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1" title="Nombre de places">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>{vehicle.specifications.seats}</span>
          </div>
          <div className="flex items-center gap-1" title="Transmission">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs capitalize">{vehicle.specifications.transmission}</span>
          </div>
          {vehicle.specifications.features?.airConditioning && (
            <div className="flex items-center gap-1" title="Climatisation">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs">Clim</span>
            </div>
          )}
        </div>

        {/* Prix */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xs text-gray-500">À partir de</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#FF8C42]">
              {formatCurrency(startingPrice)}
            </span>
            <span className="text-sm text-gray-500">/jour</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Prix dégressifs selon la durée</p>
        </div>

        {/* Bouton */}
        <Link
          to={`/vehicles/${vehicle.slug || vehicle._id}`}
          className={`block w-full text-center py-2.5 rounded-lg font-medium transition-colors ${
            isAvailable
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={(e) => !isAvailable && e.preventDefault()}
        >
          Voir détails & tarifs
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
