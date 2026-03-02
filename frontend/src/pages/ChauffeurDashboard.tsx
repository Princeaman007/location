import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Reservation {
  _id: string;
  vehicle: {
    brand: string;
    model: string;
    images: string[];
  };
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  code: string;
  pickupLocation: string;
  returnLocation: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  type: 'reservation';
}

interface AirportTransfer {
  _id: string;
  typeTransfert: 'arrivee' | 'depart';
  dateTransfert: string;
  heureTransfert: string;
  numeroVol?: string;
  aeroportDepart?: string;
  aeroportArrivee?: string;
  lieuPriseEnCharge?: string;
  destination?: string;
  nombrePassagers: number;
  statut: string;
  tarif?: number;
  notes?: string;
  vehicule?: {
    _id: string;
    brand: string;
    model: string;
    registration: string;
    images: string[];
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  type: 'transfer';
}

type Mission = Reservation | AirportTransfer;

const ChauffeurDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [disponible, setDisponible] = useState(user?.chauffeurProfile?.availability === 'available' || false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  useEffect(() => {
    fetchMissions();
    fetchStats();
  }, []);

  const fetchMissions = async () => {
    try {
      // Récupérer les réservations où le chauffeur est assigné
      const reservationsResponse = await api.get('/reservations');
      const reservations = reservationsResponse.data.data.map((r: any) => ({ ...r, type: 'reservation' }));

      // Récupérer les transferts aéroport où le chauffeur est assigné
      const transfersResponse = await api.get('/airport-transfers/my-missions');
      const transfers = transfersResponse.data.data.map((t: any) => ({ ...t, type: 'transfer' }));

      // Combiner et trier par date
      const allMissions = [...reservations, ...transfers].sort((a, b) => {
        const dateA = 'startDate' in a ? new Date(a.startDate) : new Date(a.dateTransfert);
        const dateB = 'startDate' in b ? new Date(b.startDate) : new Date(b.dateTransfert);
        return dateB.getTime() - dateA.getTime();
      });

      setMissions(allMissions);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/me/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDisponibiliteToggle = async () => {
    try {
      const newAvailability = !disponible ? 'available' : 'offline';
      await api.put('/users/me', { 
        'chauffeurProfile.availability': newAvailability 
      });
      setDisponible(!disponible);
      toast.success(`Vous êtes maintenant ${!disponible ? 'disponible' : 'indisponible'}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour de la disponibilité');
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: any = {
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      confirmee: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      confirme: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmé' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours' },
      en_cours: { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      terminee: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      termine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      annulee: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
    };
    const config = statusConfig[statut] || statusConfig.confirmed;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderMissionCard = (mission: Mission) => {
    if (mission.type === 'reservation') {
      return (
        <div key={mission._id} className="p-6 hover:bg-gray-50 border-l-4 border-blue-500">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={mission.vehicle.images[0] || '/placeholder-car.jpg'}
              alt={`${mission.vehicle.brand} ${mission.vehicle.model}`}
              className="w-full md:w-48 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      Réservation
                    </span>
                    <h3 className="text-lg font-bold text-dark">
                      {mission.vehicle.brand} {mission.vehicle.model}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">Code: {mission.code}</p>
                </div>
                {getStatusBadge(mission.status)}
              </div>

              {/* Informations du client */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {mission.user.firstName.charAt(0)}{mission.user.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Client: {mission.user.firstName} {mission.user.lastName}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-700 mt-1">
                      <a href={`tel:${mission.user.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {mission.user.phone}
                      </a>
                      <a href={`mailto:${mission.user.email}`} className="flex items-center gap-1 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {mission.user.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(mission.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} - {new Date(mission.endDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {mission.pickupLocation || 'À définir'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {(mission.totalAmount * 0.2).toLocaleString()} FCFA
                  <span className="text-sm text-gray-600 font-normal">(votre part estimée)</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${mission.user.phone}`}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                  {mission.status === 'confirmed' && (
                    <button 
                      onClick={() => toast('Fonction à venir')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Démarrer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Transfert aéroport
      return (
        <div key={mission._id} className="p-6 hover:bg-gray-50 border-l-4 border-purple-500">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                      ✈️ Transfert Aéroport
                    </span>
                    <h3 className="text-lg font-bold text-dark">
                      {mission.typeTransfert === 'arrivee' ? 'Arrivée' : 'Départ'}
                    </h3>
                  </div>
                  {mission.numeroVol && (
                    <p className="text-sm text-gray-600">Vol: {mission.numeroVol}</p>
                  )}
                </div>
                {getStatusBadge(mission.statut)}
              </div>

              {/* Informations du client */}
              <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {mission.user.firstName.charAt(0)}{mission.user.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Client: {mission.user.firstName} {mission.user.lastName}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-700 mt-1">
                      <a href={`tel:${mission.user.phone}`} className="flex items-center gap-1 hover:text-purple-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {mission.user.phone}
                      </a>
                      <a href={`mailto:${mission.user.email}`} className="flex items-center gap-1 hover:text-purple-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {mission.user.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Véhicule assigné */}
              {mission.vehicule && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Véhicule: {mission.vehicule.brand} {mission.vehicule.model}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Immatriculation: <span className="font-mono font-bold">{mission.vehicule.registration}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes spéciales */}
              {mission.notes && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900 mb-1">Notes importantes</p>
                      <p className="text-sm text-yellow-800">{mission.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(mission.dateTransfert).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {mission.heureTransfert}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {mission.nombrePassagers} passager{mission.nombrePassagers > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {mission.typeTransfert === 'arrivee' 
                    ? `${mission.aeroportDepart || 'Aéroport'} → ${mission.destination || 'Destination'}`
                    : `${mission.lieuPriseEnCharge || 'Départ'} → ${mission.aeroportArrivee || 'Aéroport'}`
                  }
                </div>
              </div>

              <div className="flex items-center justify-between">
                {mission.tarif && (
                  <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {(mission.tarif * 0.2).toLocaleString()} FCFA
                    <span className="text-sm text-gray-600 font-normal">(votre part estimée)</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <a
                    href={`tel:${mission.user.phone}`}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                  {(mission.statut === 'confirme' || mission.statut === 'confirmed') && (
                    <button 
                      onClick={() => toast('Fonction à venir')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Démarrer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Chauffeur: {user?.firstName} {user?.lastName}
              </h1>
              <p className="opacity-90">Gérez vos missions et votre disponibilité</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {disponible ? 'Disponible' : 'Indisponible'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={handleDisponibiliteToggle}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary-600"></div>
              </label>
              <button 
                onClick={handleLogout}
                className="ml-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-sm transition-colors font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <h3 className="font-bold text-dark">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                {user?.chauffeurProfile?.experience && (
                  <div className="mt-4 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg text-sm font-medium">
                    {user.chauffeurProfile.experience} ans d'expérience
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('missions')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'missions'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mes missions
                </button>
                <button
                  onClick={() => setActiveTab('revenus')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'revenus'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Revenus
                </button>
                <button
                  onClick={() => setActiveTab('profil')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'profil'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mon profil
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Missions totales</p>
                      <p className="text-3xl font-bold text-dark">{stats.totalMissions || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
                      <p className="text-2xl font-bold text-dark">
                        {(stats.totalRevenus || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
                      <p className="text-3xl font-bold text-dark">{stats.noteMoyenne?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Missions Tab */}
            {activeTab === 'missions' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-dark">Mes missions</h2>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {missions.length} mission{missions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="divide-y">
                  {missions.length === 0 ? (
                    <div className="p-12 text-center">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune mission attribuée
                      </h3>
                      <p className="text-gray-600">
                        {disponible 
                          ? "Vous êtes disponible. Les missions vous seront attribuées par l'admin." 
                          : "Activez votre disponibilité pour recevoir des missions"}
                      </p>
                    </div>
                  ) : (
                    missions.map((mission) => renderMissionCard(mission))
                  )}
                </div>
              </div>
            )}

            {/* Revenus Tab */}
            {activeTab === 'revenus' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-dark mb-6">Revenus</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1">Ce mois-ci</p>
                      <p className="text-3xl font-bold text-secondary-600">
                        {(stats?.revenusMoisCourant || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
                      <p className="text-sm text-gray-700 mb-1">Total</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {(stats?.totalRevenus || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-dark mb-4">Historique des paiements</h3>
                    <p className="text-gray-600 text-center py-8">
                      Aucun paiement pour le moment
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profil Tab */}
            {activeTab === 'profil' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-dark mb-6">Mon profil chauffeur</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={user?.nom || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={user?.prenom || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={user?.telephone || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                      <input
                        type="number"
                        value={user?.experienceAnnees || 0}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permis de conduire</label>
                      <input
                        type="text"
                        value={user?.numeroPermis || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langues parlées</label>
                    <div className="flex flex-wrap gap-2">
                      {user?.chauffeurProfile?.languages && user.chauffeurProfile.languages.length > 0 ? (
                        user.chauffeurProfile.languages.map((langue: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm"
                          >
                            {langue}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Aucune langue spécifiée</span>
                      )}
                    </div>
                  </div>

                  {user?.chauffeurProfile?.specialties && user.chauffeurProfile.specialties.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spécialités</label>
                      <div className="flex flex-wrap gap-2">
                        {user.chauffeurProfile.specialties.map((specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-secondary-100 text-secondary-600 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Modifier mes informations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChauffeurDashboard;
