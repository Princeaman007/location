import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/priceCalculator';

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  category: string;
  registration: string;
  images: Array<{ url: string; publicId: string; isPrimary: boolean }>;
  specifications: {
    transmission: string;
    fuel: string;
    seats: number;
    doors: number;
    color?: string;
    mileage?: number;
    features: {
      airConditioning: boolean;
      gps: boolean;
      bluetooth: boolean;
      camera: boolean;
      sunroof: boolean;
      leatherSeats: boolean;
      cruiseControl: boolean;
    };
  };
  pricing: {
    daily: number;
    weekly?: number;
    monthly?: number;
    chauffeurSupplement?: number;
  };
  availability: {
    status: string;
    cities: string[];
  };
  chauffeurAvailable: boolean;
  description?: string;
  isFeatured: boolean;
  isActive: boolean;
  stats?: {
    averageRating: number;
    totalReviews: number;
  };

}

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchVehicle();
    fetchReviews();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement du véhicule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${id}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${id}` } });
      return;
    }
    navigate(`/booking/${id}`);
  };

  const getPrimaryImage = () => {
    if (!vehicle?.images || vehicle.images.length === 0) {
      return '/placeholder-vehicle.jpg';
    }
    const primaryImg = vehicle.images.find(img => img.isPrimary);
    return primaryImg ? primaryImg.url : vehicle.images[0].url;
  };

  const getFeaturesList = () => {
    if (!vehicle?.specifications.features) return [];
    
    const features = [];
    const f = vehicle.specifications.features;
    
    if (f.airConditioning) features.push({ icon: '', name: 'Climatisation' });
    if (f.gps) features.push({ icon: '', name: 'GPS' });
    if (f.bluetooth) features.push({ icon: '', name: 'Bluetooth' });
    if (f.camera) features.push({ icon: '', name: 'Caméra de recul' });
    if (f.sunroof) features.push({ icon: '', name: 'Toit ouvrant' });
    if (f.leatherSeats) features.push({ icon: '', name: 'Sièges en cuir' });
    if (f.cruiseControl) features.push({ icon: '', name: 'Régulateur de vitesse' });
    
    return features;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      economique: 'Économique',
      berline: 'Berline',
      suv: 'SUV',
      '4x4': '4x4',
      minibus: 'Minibus',
      luxe: 'Luxe'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Disponible</span>;
      case 'loue':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Loué</span>;
      case 'maintenance':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">Maintenance</span>;
      case 'hors-service':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Hors service</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Véhicule introuvable</h2>
          <Link to="/vehicles" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = vehicle.availability.status === 'disponible';
  const features = getFeaturesList();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-600 hover:text-primary-600 transition">
            Accueil
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/vehicles" className="text-gray-600 hover:text-primary-600 transition">
            Catalogue
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">
            {vehicle.brand} {vehicle.model}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 md:h-[500px] bg-gray-900">
                <img
                  src={vehicle.images[selectedImage]?.url || getPrimaryImage()}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center">
                      <span className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-xl inline-block">
                        Non disponible
                      </span>
                      <p className="text-white mt-4 text-sm">Statut: {vehicle.availability.status}</p>
                    </div>
                  </div>
                )}
                {vehicle.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      Recommandé
                    </span>
                  </div>
                )}
              </div>
              {vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-gray-50">
                  {vehicle.images.map((image, index) => (
                    <button
                      key={image.publicId}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                        selectedImage === index
                          ? 'ring-4 ring-primary-600 scale-105'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Vue ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    {vehicle.brand} {vehicle.model}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Année:</span> {vehicle.year}
                    </span>
                    <span>•</span>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                      {getCategoryLabel(vehicle.category)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">Immatriculation:</span> {vehicle.registration}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(vehicle.availability.status)}
                  {vehicle.stats && vehicle.stats.totalReviews > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                      <span className="text-2xl font-bold text-gray-900">
                        {vehicle.stats.averageRating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-600">({vehicle.stats.totalReviews} avis)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {vehicle.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
                </div>
              )}

              {/* Spécifications techniques */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Spécifications techniques
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Places</p>
                      <p className="font-bold text-gray-900">{vehicle.specifications.seats} personnes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Transmission</p>
                      <p className="font-bold text-gray-900 capitalize">{vehicle.specifications.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Carburant</p>
                      <p className="font-bold text-gray-900 capitalize">{vehicle.specifications.fuel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Portes</p>
                      <p className="font-bold text-gray-900">{vehicle.specifications.doors} portes</p>
                    </div>
                  </div>
                  {vehicle.specifications.color && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                      <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Couleur</p>
                        <p className="font-bold text-gray-900 capitalize">{vehicle.specifications.color}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.specifications.mileage !== undefined && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Kilométrage</p>
                        <p className="font-bold text-gray-900">{vehicle.specifications.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Équipements et options */}
              {features.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Équipements et options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <span className="font-medium text-gray-700">{feature.name}</span>
                        <svg className="w-5 h-5 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarification */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tarification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 mb-1">Prix journalier</p>
                    <p className="text-3xl font-bold">{formatCurrency(vehicle.pricing.daily)}</p>
                    <p className="text-xs opacity-75 mt-1">par jour</p>
                  </div>
                  {vehicle.pricing.weekly && (
                    <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                      <p className="text-sm opacity-90 mb-1">Prix hebdomadaire</p>
                      <p className="text-3xl font-bold">{formatCurrency(vehicle.pricing.weekly)}</p>
                      <p className="text-xs opacity-75 mt-1">pour 7 jours</p>
                    </div>
                  )}
                  {vehicle.pricing.monthly && (
                    <div className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg">
                      <p className="text-sm opacity-90 mb-1">Prix mensuel</p>
                      <p className="text-3xl font-bold">{formatCurrency(vehicle.pricing.monthly)}</p>
                      <p className="text-xs opacity-75 mt-1">pour 30 jours</p>
                    </div>
                  )}
                </div>
                {vehicle.chauffeurAvailable && vehicle.pricing.chauffeurSupplement && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Chauffeur disponible</p>
                        <p className="text-sm text-gray-600">
                          Supplément de <span className="font-semibold text-primary-600">{formatCurrency(vehicle.pricing.chauffeurSupplement)}</span> par jour
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Disponibilité */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Disponibilité
                </h2>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Villes disponibles:</p>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.availability.cities.map((city, index) => (
                      <span key={index} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Avis des clients ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">Aucun avis pour le moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Soyez le premier à laisser un avis !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-primary-100">
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-600 mb-1">À partir de</p>
                <p className="text-4xl font-bold text-primary-600 mb-1">
                  {formatCurrency(vehicle.pricing.daily)}
                </p>
                <p className="text-gray-600">par jour</p>
                {vehicle.pricing.weekly && vehicle.pricing.monthly && (
                  <div className="mt-3 text-sm text-gray-500 space-y-1">
                    <p>• {formatCurrency(vehicle.pricing.weekly)} / semaine</p>
                    <p>• {formatCurrency(vehicle.pricing.monthly)} / mois</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleBooking}
                disabled={!isAvailable}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 mb-6"
              >
                {isAvailable ? 'Réserver maintenant' : 'Indisponible'}
              </button>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Annulation gratuite sous 24h</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Assistance 24/7</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Kilométrage illimité</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3 font-medium">Besoin d'aide ?</p>
                <a
                  href="https://wa.me/2250759627603"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
