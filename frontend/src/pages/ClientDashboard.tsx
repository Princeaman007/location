import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Reservation {
  _id: string;
  vehicle: {
    brand: string;
    model: string;
    images: {
      url: string;
      publicId: string;
      isPrimary: boolean;
    }[];
  };
  startDate: string;
  endDate: string;
  status: string;
  pricing: {
    vehicleTotal: number;
    chauffeurTotal: number;
    optionsTotal: number;
    insuranceTotal: number;
    subtotal: number;
    discount: number;
    loyaltyDiscount: number;
    total: number;
  };
  code: string;
  chauffeur?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    chauffeurProfile?: {
      rating?: number;
      experience?: string;
      languages?: string[];
    };
  };
}

interface AirportTransfer {
  _id: string;
  type: 'arrivee' | 'depart';
  date: string;
  heure: string;
  numeroVol?: string;
  depart?: string;
  arrivee?: string;
  passagers: number;
  statut: string;
  tarif?: number;
  createdAt: string;
  contact?: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  chauffeur?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    chauffeurProfile?: {
      rating?: number;
      experience?: string;
      languages?: string[];
    };
  };
}

const ClientDashboard = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [airportTransfers, setAirportTransfers] = useState<AirportTransfer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    profession: user?.profession || '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<string | null>(null);
  const [transferFormData, setTransferFormData] = useState({
    type: 'arrivee',
    date: '',
    heure: '',
    numeroVol: '',
    depart: '',
    arrivee: '',
    passagers: '1',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
  });
  const [updatingTransfer, setUpdatingTransfer] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  useEffect(() => {
    fetchReservations();
    fetchAirportTransfers();
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.city || '',
        profession: user.profession || '',
      });
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirportTransfers = async () => {
    try {
      const response = await api.get('/airport-transfers/my-transfers');
      setAirportTransfers(response.data.data);
    } catch (error) {
      console.error('Erreur récupération transferts:', error);
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ne pas soumettre si on n'est pas en mode édition
    if (!isEditingProfile) {
      return;
    }
    
    setUpdatingProfile(true);

    try {
      // Filtrer les champs vides pour n'envoyer que les valeurs définies
      const dataToSend: any = {};
      Object.keys(profileData).forEach((key) => {
        const value = profileData[key as keyof typeof profileData];
        if (value && value.trim() !== '') {
          dataToSend[key] = value;
        }
      });

      const response = await api.put('/auth/update-profile', dataToSend);
      if (response.data.success) {
        setUser(response.data.data);
        setIsEditingProfile(false);
        toast.success('Profil mis à jour avec succès !');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      console.error('Erreur:', error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleEnableEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.city || '',
        profession: user.profession || '',
      });
    }
  };

  const canEditTransfer = (transfer: AirportTransfer) => {
    // Peut modifier si statut en attente et date future
    if (transfer.statut !== 'en_attente') return false;
    const transferDate = new Date(transfer.date);
    const now = new Date();
    return transferDate >= now;
  };

  const handleEditTransfer = (transfer: AirportTransfer) => {
    setTransferFormData({
      type: transfer.type,
      date: new Date(transfer.date).toISOString().split('T')[0],
      heure: transfer.heure,
      numeroVol: transfer.numeroVol || '',
      depart: transfer.depart || '',
      arrivee: transfer.arrivee || '',
      passagers: transfer.passagers.toString(),
      nom: transfer.contact?.nom || '',
      prenom: transfer.contact?.prenom || '',
      telephone: transfer.contact?.telephone || '',
      email: transfer.contact?.email || '',
    });
    setEditingTransfer(transfer._id);
  };

  const handleCancelEditTransfer = () => {
    setEditingTransfer(null);
    setTransferFormData({
      type: 'arrivee',
      date: '',
      heure: '',
      numeroVol: '',
      depart: '',
      arrivee: '',
      passagers: '1',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
    });
  };

  const handleTransferFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTransferFormData({
      ...transferFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransfer) return;
    
    setUpdatingTransfer(true);

    try {
      const response = await api.put(`/airport-transfers/${editingTransfer}/edit`, {
        type: transferFormData.type,
        date: transferFormData.date,
        heure: transferFormData.heure,
        numeroVol: transferFormData.numeroVol || undefined,
        depart: transferFormData.type === 'depart' ? transferFormData.depart : undefined,
        arrivee: transferFormData.type === 'arrivee' ? transferFormData.arrivee : undefined,
        passagers: parseInt(transferFormData.passagers),
        nom: transferFormData.nom,
        prenom: transferFormData.prenom,
        telephone: transferFormData.telephone,
        email: transferFormData.email || undefined,
      });

      if (response.data.success) {
        toast.success('Votre demande a été modifiée avec succès !');
        setEditingTransfer(null);
        fetchAirportTransfers(); // Recharger les données
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
      console.error('Erreur:', error);
    } finally {
      setUpdatingTransfer(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: any = {
      // Statuts en backend (anglais)
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      'documents-pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Documents requis' },
      'in-progress': { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours' },
      'completed': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      // Statuts anciens (français) - pour compatibilité si certains existent
      'en_attente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'confirmee': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      'en_cours': { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours' },
      'terminee': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminée' },
      'annulee': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
    };
    const config = statusConfig[statut] || statusConfig['pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTransferStatusBadge = (statut: string) => {
    const statusConfig: any = {
      en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente de contact' },
      contacte: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacté' },
      confirme: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
      termine: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Terminé' },
      annule: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
    };
    const config = statusConfig[statut] || statusConfig.en_attente;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 1000) return { level: 'Platine', color: 'text-purple-600', progress: 100 };
    if (points >= 500) return { level: 'Or', color: 'text-yellow-600', progress: (points / 1000) * 100 };
    if (points >= 100) return { level: 'Argent', color: 'text-gray-600', progress: (points / 500) * 100 };
    return { level: 'Bronze', color: 'text-orange-600', progress: (points / 100) * 100 };
  };

  const loyalty = getLoyaltyLevel(user?.pointsFidelite || 0);

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
                Bonjour, {user?.firstName || user?.prenom} {user?.lastName || user?.nom} 👋
              </h1>
              <p className="opacity-90">Gérez vos réservations et votre profil</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-sm transition-colors font-medium"
            >
              Déconnexion
            </button>
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
                  {(user?.firstName || user?.prenom)?.charAt(0)}{(user?.lastName || user?.nom)?.charAt(0)}
                </div>
                <h3 className="font-bold text-dark">{user?.firstName || user?.prenom} {user?.lastName || user?.nom}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Loyalty Card */}
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Programme fidélité</span>
                  <span className={`text-lg font-bold ${loyalty.color}`}>{loyalty.level}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                    style={{ width: `${loyalty.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{user?.pointsFidelite} points</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'reservations'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mes réservations
                </button>
                <button
                  onClick={() => setActiveTab('favoris')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'favoris'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Favoris
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
                      <p className="text-sm text-gray-600 mb-1">Réservations totales</p>
                      <p className="text-3xl font-bold text-dark">{stats.totalReservations || 0}</p>
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
                      <p className="text-sm text-gray-600 mb-1">Dépenses totales</p>
                      <p className="text-2xl font-bold text-dark">
                        {(stats.totalDepense || 0).toLocaleString()} FCFA
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
                      <p className="text-sm text-gray-600 mb-1">Points fidélité</p>
                      <p className="text-3xl font-bold text-dark">{user?.pointsFidelite || 0}</p>
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

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="bg-white rounded-xl shadow-md">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-dark">Mes réservations</h2>
                    <Link
                      to="/vehicles"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Nouvelle réservation
                    </Link>
                  </div>
                </div>

                <div className="divide-y">
                  {reservations.length === 0 && airportTransfers.length === 0 ? (
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
                        Aucune réservation
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Vous n'avez pas encore effectué de réservation
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Link
                          to="/vehicles"
                          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Explorer les véhicules
                        </Link>
                        <Link
                          to="/airport-transfer"
                          className="inline-block px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                        >
                          Transfert aéroport
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Transferts aéroport */}
                      {airportTransfers.map((transfer) => (
                        <div key={transfer._id} className="p-6 hover:bg-gray-50 bg-blue-50/30">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-dark">
                                      Transfert Aéroport - {transfer.type === 'arrivee' ? 'Arrivée' : 'Départ'}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">✈️ Aéroport</span>
                                  </div>
                                  {transfer.numeroVol && (
                                    <p className="text-sm text-gray-600">Vol: {transfer.numeroVol}</p>
                                  )}
                                </div>
                                {getTransferStatusBadge(transfer.statut)}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(transfer.date).toLocaleDateString('fr-FR')} à {transfer.heure}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {transfer.passagers} passager{transfer.passagers > 1 ? 's' : ''}
                                </div>
                                {transfer.arrivee && (
                                  <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Destination: {transfer.arrivee}
                                  </div>
                                )}
                                {transfer.depart && (
                                  <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Départ: {transfer.depart}
                                  </div>
                                )}
                                {transfer.tarif && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {transfer.tarif.toLocaleString()} FCFA
                                  </div>
                                )}
                              </div>
                              
                              {/* Informations du chauffeur */}
                              {transfer.chauffeur && (
                                <div className="mt-4 mb-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                                      {transfer.chauffeur.firstName.charAt(0)}{transfer.chauffeur.lastName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">
                                          {transfer.chauffeur.firstName} {transfer.chauffeur.lastName}
                                        </h4>
                                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                          Chauffeur
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          <a href={`tel:${transfer.chauffeur.phone}`} className="hover:text-purple-600 font-medium">
                                            {transfer.chauffeur.phone}
                                          </a>
                                        </div>
                                        {transfer.chauffeur.chauffeurProfile?.rating && (
                                          <div className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-medium">{transfer.chauffeur.chauffeurProfile.rating}/5</span>
                                          </div>
                                        )}
                                        {transfer.chauffeur.chauffeurProfile?.experience && (
                                          <div className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <span>{transfer.chauffeur.chauffeurProfile.experience} ans d'expérience</span>
                                          </div>
                                        )}
                                        {transfer.chauffeur.chauffeurProfile?.languages && transfer.chauffeur.chauffeurProfile.languages.length > 0 && (
                                          <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                            </svg>
                                            <span>Langues: {transfer.chauffeur.chauffeurProfile.languages.join(', ')}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="mt-2 flex gap-2">
                                        <a
                                          href={`tel:${transfer.chauffeur.phone}`}
                                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          Appeler
                                        </a>
                                        <a
                                          href={`mailto:${transfer.chauffeur.email}`}
                                          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          Email
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4">
                                {canEditTransfer(transfer) && (
                                  <button
                                    onClick={() => handleEditTransfer(transfer)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    Modifier
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Réservations de véhicules */}
                      {reservations.map((reservation) => {
                        // Vérifier si la réservation est passée
                        const endDate = new Date(reservation.endDate);
                        const now = new Date();
                        const isOverdue = endDate < now && reservation.status !== 'completed' && reservation.status !== 'terminee' && reservation.status !== 'cancelled' && reservation.status !== 'annulee';
                        
                        return (
                        <div key={reservation._id} className="p-6 hover:bg-gray-50">
                          <div className="flex flex-col md:flex-row gap-6">
                            <img
                              src={reservation.vehicle.images?.[0]?.url || '/placeholder-car.jpg'}
                              alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
                              className="w-full md:w-48 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-lg font-bold text-dark">
                                    {reservation.vehicle.brand} {reservation.vehicle.model}
                                  </h3>
                                  <p className="text-sm text-gray-600">Code: {reservation.code}</p>
                                </div>
                                {getStatusBadge(reservation.status)}
                              </div>
                              
                              {/* Alerte si réservation terminée non clôturée */}
                              {isOverdue && (
                                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                  <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-blue-800">Véhicule retourné</p>
                                      <p className="text-xs text-blue-700 mt-1">
                                        La période de location s'est terminée le {endDate.toLocaleDateString()} à {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. 
                                        Nous espérons que vous avez passé un bon moment avec notre véhicule ! 
                                        Notre équipe va finaliser votre dossier sous peu.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {reservation.pricing?.total?.toLocaleString() || '0'} FCFA
                                </div>
                              </div>
                              
                              {/* Informations du chauffeur */}
                              {reservation.chauffeur && (
                                <div className="mt-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                                      {reservation.chauffeur.firstName.charAt(0)}{reservation.chauffeur.lastName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">
                                          {reservation.chauffeur.firstName} {reservation.chauffeur.lastName}
                                        </h4>
                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                          Chauffeur
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          <a href={`tel:${reservation.chauffeur.phone}`} className="hover:text-blue-600 font-medium">
                                            {reservation.chauffeur.phone}
                                          </a>
                                        </div>
                                        {reservation.chauffeur.chauffeurProfile?.rating && (
                                          <div className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-medium">{reservation.chauffeur.chauffeurProfile.rating}/5</span>
                                          </div>
                                        )}
                                        {reservation.chauffeur.chauffeurProfile?.experience && (
                                          <div className="flex items-center gap-2 text-gray-700">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <span>{reservation.chauffeur.chauffeurProfile.experience} ans d'expérience</span>
                                          </div>
                                        )}
                                        {reservation.chauffeur.chauffeurProfile?.languages && reservation.chauffeur.chauffeurProfile.languages.length > 0 && (
                                          <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                            </svg>
                                            <span>Langues: {reservation.chauffeur.chauffeurProfile.languages.join(', ')}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="mt-2 flex gap-2">
                                        <a
                                          href={`tel:${reservation.chauffeur.phone}`}
                                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          Appeler
                                        </a>
                                        <a
                                          href={`mailto:${reservation.chauffeur.email}`}
                                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center gap-1"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          Email
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-3">
                                <Link
                                  to={`/reservations/${reservation._id}`}
                                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                                >
                                  Voir détails
                                </Link>
                                {(reservation.status === 'completed' || reservation.status === 'terminee') && (
                                  <Link
                                    to={`/reviews/new?reservation=${reservation._id}`}
                                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                                  >
                                    Laisser un avis
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Favoris Tab */}
            {activeTab === 'favoris' && (
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun favori
                </h3>
                <p className="text-gray-600">
                  Ajoutez des véhicules à vos favoris pour les retrouver facilement
                </p>
              </div>
            )}

            {/* Profil Tab */}
            {activeTab === 'profil' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-dark mb-6">Mon profil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white' : 'bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white' : 'bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white' : 'bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <select
                        name="city"
                        value={profileData.city}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white' : 'bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      >
                        <option value="">Sélectionnez une ville</option>
                        <option value="Abidjan">Abidjan</option>
                        <option value="Yamoussoukro">Yamoussoukro</option>
                        <option value="San-Pédro">San-Pédro</option>
                        <option value="Bouaké">Bouaké</option>
                        <option value="Korhogo">Korhogo</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                      <input
                        type="text"
                        name="profession"
                        value={profileData.profession}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${
                          isEditingProfile ? 'bg-white' : 'bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {!isEditingProfile ? (
                      <button
                        type="button"
                        onClick={handleEnableEdit}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Modifier mes informations
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={updatingProfile}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingProfile ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={updatingProfile}
                          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de modification du transfert */}
      {editingTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-dark">Modifier le transfert aéroport</h2>
            </div>

            <form onSubmit={handleUpdateTransfer} className="p-6 space-y-5">
              {/* Type de transfert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de transfert *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferFormData({ ...transferFormData, type: 'arrivee' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      transferFormData.type === 'arrivee'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium">Arrivée</span>
                    <p className="text-xs mt-1 opacity-75">Aéroport → Ville</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferFormData({ ...transferFormData, type: 'depart' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      transferFormData.type === 'depart'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium">Départ</span>
                    <p className="text-xs mt-1 opacity-75">Ville → Aéroport</p>
                  </button>
                </div>
              </div>

              {/* Date et Heure */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={transferFormData.date}
                    onChange={handleTransferFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                  <input
                    type="time"
                    name="heure"
                    value={transferFormData.heure}
                    onChange={handleTransferFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Numéro de vol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de vol</label>
                <input
                  type="text"
                  name="numeroVol"
                  value={transferFormData.numeroVol}
                  onChange={handleTransferFormChange}
                  placeholder="Ex: AF 748, ET 915..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Adresse de destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {transferFormData.type === 'arrivee' ? 'Adresse de destination *' : 'Adresse de départ *'}
                </label>
                <input
                  type="text"
                  name={transferFormData.type === 'arrivee' ? 'arrivee' : 'depart'}
                  value={transferFormData.type === 'arrivee' ? transferFormData.arrivee : transferFormData.depart}
                  onChange={handleTransferFormChange}
                  placeholder="Ex: Hôtel Ivoire, Cocody Riviera..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Nombre de passagers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de passagers *</label>
                <select
                  name="passagers"
                  value={transferFormData.passagers}
                  onChange={handleTransferFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      {num} passager{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordonnées */}
              <div className="border-t pt-5">
                <h3 className="font-semibold mb-4">Vos coordonnées</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={transferFormData.nom}
                      onChange={handleTransferFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      value={transferFormData.prenom}
                      onChange={handleTransferFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={transferFormData.email}
                    onChange={handleTransferFormChange}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={transferFormData.telephone}
                    onChange={handleTransferFormChange}
                    placeholder="+225 07 12 34 56 78"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={updatingTransfer}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingTransfer ? 'Modification...' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditTransfer}
                  disabled={updatingTransfer}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
