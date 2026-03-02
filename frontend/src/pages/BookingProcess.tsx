import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Vehicle } from '../types/vehicle';

interface BookingData {
  vehicule: string;
  dateDebut: string;
  dateFin: string;
  lieuPriseEnCharge: string;
  lieuRetour: string;
  avecChauffeur: boolean;
  chauffeur?: string;
  paiementALivraison: boolean;
  commentaires: string;
}

const BookingProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState({
    prixVehicule: 0,
    prixChauffeur: 0,
    reduction: 0,
    total: 0,
  });

  const [bookingData, setBookingData] = useState<BookingData>({
    vehicule: id || '',
    dateDebut: '',
    dateFin: '',
    lieuPriseEnCharge: '',
    lieuRetour: '',
    avecChauffeur: false,
    paiementALivraison: false,
    commentaires: '',
  });

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (bookingData.avecChauffeur) {
      fetchChauffeurs();
    }
  }, [bookingData.avecChauffeur]);

  useEffect(() => {
    calculatePricing();
  }, [bookingData, vehicle]);

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      setVehicle(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const response = await api.get('/users/chauffeurs');
      setChauffeurs(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculatePricing = () => {
    if (!vehicle || !bookingData.dateDebut || !bookingData.dateFin) {
      // Reset pricing to 0 when dates are not selected
      setPricing({
        prixVehicule: 0,
        prixChauffeur: 0,
        reduction: 0,
        total: 0,
      });
      return;
    }

    const startDate = new Date(bookingData.dateDebut);
    const endDate = new Date(bookingData.dateFin);
    
    // Check for invalid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setPricing({
        prixVehicule: 0,
        prixChauffeur: 0,
        reduction: 0,
        total: 0,
      });
      return;
    }

    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Ensure days is positive
    if (days <= 0) {
      setPricing({
        prixVehicule: 0,
        prixChauffeur: 0,
        reduction: 0,
        total: 0,
      });
      return;
    }

    const prixVehicule = vehicle.pricing.daily * days;
    const prixChauffeur = bookingData.avecChauffeur ? (vehicle.pricing.chauffeurSupplement || 15000) * days : 0;
    
    // Réduction fidélité (exemple: 5% pour bronze, 10% silver, etc.)
    const loyaltyDiscount = user?.pointsFidelite
      ? user.pointsFidelite >= 1000
        ? 0.15
        : user.pointsFidelite >= 500
        ? 0.10
        : user.pointsFidelite >= 100
        ? 0.05
        : 0
      : 0;

    const subtotal = prixVehicule + prixChauffeur;
    const reduction = subtotal * loyaltyDiscount;
    const total = subtotal - reduction;

    setPricing({
      prixVehicule,
      prixChauffeur,
      reduction,
      total,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBookingData({ ...bookingData, [name]: checked });
    } else {
      setBookingData({ ...bookingData, [name]: value });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');

    switch (currentStep) {
      case 1:
        if (!bookingData.dateDebut || !bookingData.dateFin) {
          setError('Veuillez sélectionner les dates');
          return false;
        }
        if (new Date(bookingData.dateDebut) < new Date()) {
          setError('La date de début ne peut pas être dans le passé');
          return false;
        }
        if (new Date(bookingData.dateFin) <= new Date(bookingData.dateDebut)) {
          setError('La date de fin doit être après la date de début');
          return false;
        }
        return true;

      case 2:
        if (!bookingData.lieuPriseEnCharge || !bookingData.lieuRetour) {
          setError('Veuillez spécifier les lieux de prise en charge et de retour');
          return false;
        }
        return true;

      case 3:
        if (bookingData.avecChauffeur && !bookingData.chauffeur) {
          setError('Veuillez sélectionner un chauffeur');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Calculer la durée
      const start = new Date(bookingData.dateDebut);
      const end = new Date(bookingData.dateFin);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Transformer les données pour correspondre au format backend
      const reservationPayload = {
        vehicleId: bookingData.vehicule,
        startDate: bookingData.dateDebut,
        endDate: bookingData.dateFin,
        duration,
        serviceType: bookingData.avecChauffeur ? 'avec-chauffeur' : 'sans-chauffeur',
        chauffeurService: bookingData.avecChauffeur && bookingData.chauffeur ? {
          formula: '24h',
          accommodation: 'client',
          dailyRate: vehicle?.pricing.chauffeurSupplement || 15000
        } : undefined,
        pickup: {
          type: 'delivery',
          location: {
            address: bookingData.lieuPriseEnCharge,
          },
          time: bookingData.dateDebut,
        },
        return: {
          type: 'delivery',
          location: {
            address: bookingData.lieuRetour,
          },
          time: bookingData.dateFin,
        },
        paymentMethod: bookingData.paiementALivraison ? 'delivery-full' : 'online',
      };

      const response = await api.post('/reservations', reservationPayload);
      
      if (bookingData.paiementALivraison) {
        navigate('/dashboard', { state: { message: 'Réservation confirmée! Paiement à la livraison.' } });
      } else {
        // Redirection vers la page de paiement
        navigate(`/payment/${response.data.data._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
      console.error('Erreur réservation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {['Dates', 'Lieux', 'Options', 'Chauffeur', 'Confirmation'].map((label, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      index + 1 <= step
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 4 && (
                    <div
                      className={`hidden sm:block w-16 md:w-24 h-1 mx-2 ${
                        index + 1 < step ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              {['Dates', 'Lieux', 'Options', 'Chauffeur', 'Confirmation'].map((label, index) => (
                <span key={index} className={index + 1 === step ? 'font-semibold text-primary-600' : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Step 1: Dates */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-dark mb-6">Choisissez vos dates</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="datetime-local"
                        name="dateDebut"
                        value={bookingData.dateDebut}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="datetime-local"
                        name="dateFin"
                        value={bookingData.dateFin}
                        onChange={handleChange}
                        min={bookingData.dateDebut}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Lieux */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-dark mb-6">Lieux de prise en charge et retour</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de prise en charge
                      </label>
                      <input
                        type="text"
                        name="lieuPriseEnCharge"
                        value={bookingData.lieuPriseEnCharge}
                        onChange={handleChange}
                        placeholder="Ex: Aéroport Félix Houphouët-Boigny, Abidjan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de retour
                      </label>
                      <input
                        type="text"
                        name="lieuRetour"
                        value={bookingData.lieuRetour}
                        onChange={handleChange}
                        placeholder="Ex: Hôtel Ivoire, Abidjan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Chauffeur */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-dark mb-6">Chauffeur</h2>
                    
                    <label className="flex items-start p-4 border-2 border-primary-200 bg-primary-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        name="avecChauffeur"
                        checked={bookingData.avecChauffeur}
                        onChange={handleChange}
                        className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-dark">Avec chauffeur professionnel</span>
                        <p className="text-sm text-gray-600">15 000 FCFA/jour</p>
                      </div>
                    </label>

                    {bookingData.avecChauffeur && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sélectionner un chauffeur
                        </label>
                        <select
                          name="chauffeur"
                          value={bookingData.chauffeur}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Choisir un chauffeur</option>
                          {chauffeurs.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.prenom} {c.nom} - {c.experienceAnnees} ans d'expérience
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-dark mb-6">Confirmation</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-dark mb-2">Détails de la réservation</h3>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Dates:</dt>
                            <dd className="font-medium">
                              {new Date(bookingData.dateDebut).toLocaleDateString()} - {new Date(bookingData.dateFin).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Prise en charge:</dt>
                            <dd className="font-medium">{bookingData.lieuPriseEnCharge}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Retour:</dt>
                            <dd className="font-medium">{bookingData.lieuRetour}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Commentaires (optionnel)
                        </label>
                        <textarea
                          name="commentaires"
                          value={bookingData.commentaires}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Instructions spéciales, demandes particulières..."
                        />
                      </div>

                      <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          name="paiementALivraison"
                          checked={bookingData.paiementALivraison}
                          onChange={handleChange}
                          className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="font-medium text-dark">Paiement à la livraison</span>
                          <p className="text-sm text-gray-600">Payez en espèces lors de la prise en charge du véhicule</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                  )}
                  {step < 5 ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Suivant
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Traitement...' : 'Confirmer la réservation'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-bold text-dark mb-4">Résumé</h3>
                
                <div className="mb-4">
                  <img
                    src={vehicle.images[0]?.url || '/placeholder-car.jpg'}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="mt-2 font-semibold text-dark">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>

                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location véhicule</span>
                    <span className="font-medium">{pricing.prixVehicule.toLocaleString()} FCFA</span>
                  </div>
                  {pricing.prixChauffeur > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chauffeur</span>
                      <span className="font-medium">{pricing.prixChauffeur.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {pricing.reduction > 0 && (
                    <div className="flex justify-between text-secondary-600">
                      <span>Réduction fidélité</span>
                      <span className="font-medium">-{pricing.reduction.toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-dark">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {pricing.total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProcess;
