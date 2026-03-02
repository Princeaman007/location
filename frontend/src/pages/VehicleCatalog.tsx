import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Vehicle } from '../types/vehicle';

const categories = ['economique', 'berline', 'suv', 'luxe', 'minibus'];
const villes = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pedro', 'Korhogo'];
const transmissions = ['automatique', 'manuelle'];

const VehicleCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const [filters, setFilters] = useState({
    categorie: searchParams.get('categorie') || '',
    ville: searchParams.get('ville') || '',
    prixMin: searchParams.get('prixMin') || '',
    prixMax: searchParams.get('prixMax') || '',
    transmission: searchParams.get('transmission') || '',
    nombrePlaces: searchParams.get('nombrePlaces') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    withDriver: searchParams.get('withDriver') === 'true',
  });

  useEffect(() => {
    fetchVehicles();
  }, [searchParams]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: searchParams.get('page') || 1,
        limit: 12,
      };

      if (filters.categorie) params.categorie = filters.categorie;
      if (filters.ville) params.ville = filters.ville;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      if (filters.transmission) params.transmission = filters.transmission;
      if (filters.nombrePlaces) params.nombrePlaces = filters.nombrePlaces;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.withDriver) params.withDriver = 'true';

      const response = await api.get('/vehicles', { params });
      setVehicles(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
      setVehicles([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, String(val));
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      categorie: '',
      ville: '',
      prixMin: '',
      prixMax: '',
      transmission: '',
      nombrePlaces: '',
      startDate: '',
      endDate: '',
      withDriver: false,
    });
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Catalogue de véhicules</h1>
          <p className="text-lg opacity-90">Trouvez le véhicule parfait pour vos besoins</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark">Filtres</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="space-y-6">
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={filters.categorie}
                    onChange={(e) => handleFilterChange('categorie', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Toutes</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="text-dark">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    value={filters.ville}
                    onChange={(e) => handleFilterChange('ville', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Toutes</option>
                    {villes.map((ville) => (
                      <option key={ville} value={ville} className="text-dark">
                        {ville}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par jour (FCFA)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.prixMin}
                      onChange={(e) => handleFilterChange('prixMin', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.prixMax}
                      onChange={(e) => handleFilterChange('prixMax', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark"
                    />
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Toutes</option>
                    {transmissions.map((trans) => (
                      <option key={trans} value={trans} className="text-dark">
                        {trans.charAt(0).toUpperCase() + trans.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre de places */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de places
                  </label>
                  <select
                    value={filters.nombrePlaces}
                    onChange={(e) => handleFilterChange('nombrePlaces', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark cursor-pointer"
                  >
                    <option value="" className="text-gray-500">Tous</option>
                    <option value="2" className="text-dark">2 places</option>
                    <option value="4" className="text-dark">4 places</option>
                    <option value="5" className="text-dark">5 places</option>
                    <option value="7" className="text-dark">7 places</option>
                    <option value="9" className="text-dark">9+ places</option>
                  </select>
                </div>

                {/* Dates de réservation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    min={filters.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-dark"
                  />
                </div>

                {/* Option avec chauffeur */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.withDriver}
                      onChange={(e) => {
                        const newFilters = { ...filters, withDriver: e.target.checked };
                        setFilters(newFilters);
                        const params = new URLSearchParams();
                        Object.entries(newFilters).forEach(([key, val]) => {
                          if (val) params.set(key, String(val));
                        });
                        setSearchParams(params);
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Avec chauffeur professionnel
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des véhicules */}
          <div className="lg:w-3/4">
            {/* Résultats */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {pagination?.total || 0} véhicule{(pagination?.total || 0) > 1 ? 's' : ''} trouvé{(pagination?.total || 0) > 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun véhicule trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <Link
                      key={vehicle._id}
                      to={`/vehicles/${vehicle._id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={vehicle.images[0]?.url || '/placeholder-car.jpg'}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {vehicle.availability.status !== 'disponible' && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                              Non disponible
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-dark">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-600">{vehicle.year}</p>
                          </div>
                          <span className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                            {vehicle.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {vehicle.specifications.seats}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {vehicle.specifications.transmission}
                          </span>
                        </div>

                        {vehicle.stats?.averageRating && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(vehicle.stats.averageRating)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({vehicle.stats.totalReviews} avis)
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div>
                            <p className="text-2xl font-bold text-primary-600">
                              {vehicle.pricing.daily.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-gray-600">par jour</p>
                          </div>
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Réserver
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.page === i + 1
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCatalog;
