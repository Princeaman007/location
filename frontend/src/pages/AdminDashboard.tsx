import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import VehicleFormModal from '../components/VehicleFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

interface Stats {
  totalVehicules: number;
  totalReservations: number;
  totalUtilisateurs: number;
  totalTransferts: number;
  revenusMoisCourant: number;
  reservationsEnCours: number;
  transfertsEnCours: number;
  tauxOccupation: number;
  paiementsEnAttente: number;
  avisEnAttente: number;
}

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  category: string;
  registration: string;
  pricing: {
    daily: number;
    weekly?: number;
    monthly?: number;
    chauffeurSupplement?: number;
  };
  images: Array<{ url: string; publicId: string; isPrimary: boolean }>;
  availability: {
    status: string;
    cities: string[];
  };
  specifications: {
    transmission: string;
    fuel: string;
    seats: number;
    doors: number;
    color?: string;
    mileage?: number;
  };
  chauffeurAvailable: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

interface Reservation {
  _id: string;
  code: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
  serviceType?: string;
  vehicle?: {
    _id: string;
    brand: string;
    model: string;
    year: number;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  chauffeur?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  pickup?: {
    location?: {
      address?: string;
    };
  };
  ['return']?: {
    location?: {
      address?: string;
    };
  };
  pricing?: {
    vehicleTotal: number;
    chauffeurTotal: number;
    optionsTotal: number;
    total: number;
  };
  payment?: {
    method: string;
    status: string;
    paidAt?: string;
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
  user?: {
    firstName: string;
    lastName: string;
  };
  contact: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  chauffeur?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  tarif?: number;
  notes?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  documentsVerifies: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface Payment {
  _id: string;
  reservation?: string;
  amount: number;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
}

interface Review {
  _id: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  vehicle?: {
    brand: string;
    model: string;
  };
  rating: number;
  comment: string;
  statut: string;
  createdAt: string;
}

interface Chauffeur {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  chauffeurProfile?: {
    availability: string;
    rating: number;
    experience: number;
    languages?: string[];
    specialties?: string[];
    totalRides?: number;
  };
}

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [airportTransfers, setAirportTransfers] = useState<AirportTransfer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedReservationForChauffeur, setSelectedReservationForChauffeur] = useState<string | null>(null);
  const [selectedTransferForChauffeur, setSelectedTransferForChauffeur] = useState<string | null>(null);
  const [showChauffeurModal, setShowChauffeurModal] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [chauffeurFormData, setChauffeurFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    city: 'Abidjan',
    experience: 0,
    languages: ['Français'],
    specialties: [] as string[],
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Déconnexion réussie');
  };

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [activeTab, refreshKey]);

  const refresh = () => setRefreshKey(prev => prev + 1);

  const fetchStats = async () => {
    try {
      // Utiliser l'endpoint admin optimisé
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vehicles') {
        const response = await api.get('/vehicles');
        setVehicles(response.data.data || []);
      } else if (activeTab === 'reservations') {
        const response = await api.get('/admin/reservations', { params: { limit: 100 } });
        setReservations(response.data.data || []);
        // Charger aussi les chauffeurs pour l'attribution
        const chauffeursResponse = await api.get('/admin/chauffeurs');
        setChauffeurs(chauffeursResponse.data.data || []);
      } else if (activeTab === 'airport-transfers') {
        const response = await api.get('/admin/airport-transfers', { params: { limit: 100 } });
        setAirportTransfers(response.data.data || []);
        // Charger aussi les chauffeurs pour l'attribution
        const chauffeursResponse = await api.get('/admin/chauffeurs');
        setChauffeurs(chauffeursResponse.data.data || []);
      } else if (activeTab === 'users') {
        const response = await api.get('/admin/users', { params: { limit: 100 } });
        setUsers(response.data.data || []);
      } else if (activeTab === 'chauffeurs') {
        const response = await api.get('/admin/chauffeurs');
        setChauffeurs(response.data.data || []);
      } else if (activeTab === 'payments') {
        const response = await api.get('/admin/payments', { params: { limit: 100 } });
        setPayments(response.data.data || []);
      } else if (activeTab === 'reviews') {
        const response = await api.get('/admin/reviews', { params: { limit: 100 } });
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/approve`);
      toast.success('Avis approuvé avec succès');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/reject`);
      toast.success('Avis rejeté avec succès');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const handleValidateDocuments = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/validate-documents`);
      toast.success('Documents validés avec succès');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleUpdateTransferStatus = async (transferId: string, status: string) => {
    try {
      await api.put(`/admin/airport-transfers/${transferId}/status`, { status });
      toast.success('Statut du transfert mis à jour');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleUpdateReservationStatus = async (reservationId: string, status: string) => {
    try {
      await api.put(`/admin/reservations/${reservationId}/status`, { status });
      
      if (status === 'completed') {
        toast.success('Réservation clôturée avec succès. Le paiement a été automatiquement finalisé.', {
          duration: 4000,
        });
      } else {
        toast.success('Statut de la réservation mis à jour');
      }
      
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleToggleVehicleStatus = async (vehicleId: string, currentStatus: string) => {
    // Cycle through statuses: disponible -> loue -> maintenance -> hors-service -> disponible
    const statusCycle = ['disponible', 'loue', 'maintenance', 'hors-service'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    try {
      await api.put(`/vehicles/${vehicleId}`, {
        availability: { status: nextStatus }
      });
      toast.success(`Statut mis à jour: ${nextStatus}`);
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleChangeVehicleStatus = async (vehicleId: string, newStatus: string) => {
    try {
      await api.put(`/vehicles/${vehicleId}`, {
        availability: { status: newStatus }
      });
      toast.success(`Statut mis à jour: ${newStatus}`);
      setStatusDropdownOpen(null); // Fermer le dropdown
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le véhicule',
      message: 'Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/vehicles/${vehicleId}`);
          toast.success('Véhicule supprimé avec succès');
          refresh();
        } catch (error: any) {
          console.error('Erreur:', error);
          toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
      }
    });
  };

  const handleAssignChauffeur = async (reservationId: string, chauffeurId: string) => {
    try {
      await api.put(`/admin/reservations/${reservationId}/assign-chauffeur`, { chauffeurId });
      toast.success('Chauffeur attribué avec succès');
      setSelectedReservationForChauffeur(null);
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
    }
  };

  const handleRemoveChauffeur = async (reservationId: string) => {
    try {
      await api.delete(`/admin/reservations/${reservationId}/remove-chauffeur`);
      toast.success('Chauffeur retiré avec succès');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du retrait');
    }
  };

  const handleOpenChauffeurModal = (chauffeur?: Chauffeur) => {
    if (chauffeur) {
      setEditingChauffeur(chauffeur);
      setChauffeurFormData({
        firstName: chauffeur.firstName,
        lastName: chauffeur.lastName,
        email: chauffeur.email,
        phone: chauffeur.phone,
        password: '',
        city: 'Abidjan',
        experience: chauffeur.chauffeurProfile?.experience || 0,
        languages: chauffeur.chauffeurProfile?.languages || ['Français'],
        specialties: chauffeur.chauffeurProfile?.specialties || [],
      });
    } else {
      setEditingChauffeur(null);
      setChauffeurFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        city: 'Abidjan',
        experience: 0,
        languages: ['Français'],
        specialties: [],
      });
    }
    setShowChauffeurModal(true);
  };

  const handleCloseChauffeurModal = () => {
    setShowChauffeurModal(false);
    setEditingChauffeur(null);
  };

  const handleSaveChauffeur = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChauffeur) {
        // Update
        await api.put(`/admin/chauffeurs/${editingChauffeur._id}`, chauffeurFormData);
        toast.success('Chauffeur mis à jour avec succès');
      } else {
        // Create
        await api.post('/admin/chauffeurs', chauffeurFormData);
        toast.success('Chauffeur créé avec succès');
      }
      handleCloseChauffeurModal();
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteChauffeur = (chauffeurId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer le chauffeur',
      message: 'Êtes-vous sûr de vouloir supprimer ce chauffeur ?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/chauffeurs/${chauffeurId}`);
          toast.success('Chauffeur supprimé avec succès');
          refresh();
        } catch (error: any) {
          console.error('Erreur:', error);
          toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
      }
    });
  };

  const handleAssignChauffeurToTransfer = async (transferId: string, chauffeurId: string) => {
    try {
      await api.put(`/admin/airport-transfers/${transferId}/assign-chauffeur`, { chauffeurId });
      toast.success('Chauffeur attribué au transfert avec succès');
      setSelectedTransferForChauffeur(null);
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'attribution');
    }
  };

  const handleRemoveChauffeurFromTransfer = async (transferId: string) => {
    try {
      await api.delete(`/admin/airport-transfers/${transferId}/remove-chauffeur`);
      toast.success('Chauffeur retiré du transfert avec succès');
      refresh();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du retrait');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark to-primary-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Administrateur</h1>
              <p className="opacity-90">Gestion complète de la plateforme DCM groupe agence</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={refresh}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                Actualiser
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg text-sm transition-colors font-medium"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-4 mb-8">
            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Véhicules</p>
              <p className="text-2xl font-bold text-dark">{stats.totalVehicules}</p>
            </div>

            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Réservations</p>
              <p className="text-2xl font-bold text-dark">{stats.totalReservations}</p>
            </div>

            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Transferts aéroport</p>
              <p className="text-2xl font-bold text-dark">{stats.totalTransferts}</p>
            </div>

            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
              <p className="text-2xl font-bold text-dark">{stats.totalUtilisateurs}</p>
            </div>

            <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Revenus (mois)</p>
              <p className="text-xl font-bold text-dark">{stats.revenusMoisCourant.toLocaleString()} F</p>
            </div>

            <div className="col-span-1 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Réserv. en cours</p>
              <p className="text-2xl font-bold text-dark">{stats.reservationsEnCours}</p>
            </div>

            <div className="col-span-1 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Transferts en cours</p>
              <p className="text-2xl font-bold text-dark">{stats.transfertsEnCours}</p>
            </div>

            <div className="col-span-1 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Taux occupation</p>
              <p className="text-2xl font-bold text-dark">{stats.tauxOccupation}%</p>
            </div>

            <div className="col-span-1 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avis en attente</p>
              <p className="text-2xl font-bold text-dark">{stats.avisEnAttente}</p>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { key: 'overview', label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { key: 'vehicles', label: 'Véhicules', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { key: 'reservations', label: 'Réservations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { key: 'airport-transfers', label: 'Transferts', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                { key: 'chauffeurs', label: 'Chauffeurs', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'users', label: 'Utilisateurs', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { key: 'payments', label: 'Paiements', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                { key: 'reviews', label: 'Avis', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Real Time Stats Chart */}
                  <div>
                    <h3 className="text-lg font-bold text-dark mb-4">Performance du mois</h3>
                    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Revenus actuels</p>
                          <p className="text-2xl font-bold text-primary-600">{stats?.revenusMoisCourant.toLocaleString()} F</p>
                          <p className="text-xs text-green-600 mt-1">↗ +15% vs mois dernier</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Taux de satisfaction</p>
                          <p className="text-2xl font-bold text-secondary-600">94%</p>
                          <p className="text-xs text-green-600 mt-1">↗ +2% vs mois dernier</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-bold text-dark mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setActiveTab('vehicles')}
                        className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg text-left transition-colors"
                      >
                        <svg className="w-6 h-6 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="font-medium text-dark">Gérer véhicules</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('airport-transfers')}
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
                      >
                        <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <p className="font-medium text-dark">Transferts aéroport</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('users')}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                      >
                        <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="font-medium text-dark">Gérer utilisateurs</p>
                      </button>
                      <button 
                        onClick={() => setActiveTab('reviews')}
                        className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors"
                      >
                        <svg className="w-6 h-6 text-yellow-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81" />
                        </svg>
                        <p className="font-medium text-dark">Modérer avis</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-bold text-dark mb-4">Alertes importantes</h3>
                  <div className="space-y-3">
                    {stats && stats.avisEnAttente > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.464 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-yellow-800">{stats?.avisEnAttente} avis en attente de modération</p>
                          <button 
                            onClick={() => setActiveTab('reviews')}
                            className="text-sm text-yellow-700 underline hover:text-yellow-900"
                          >
                            Voir les avis →
                          </button>
                        </div>
                      </div>
                    )}
                    {stats && stats.transfertsEnCours > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">{stats?.transfertsEnCours} transferts d'aéroport en cours</p>
                          <button 
                            onClick={() => setActiveTab('airport-transfers')}
                            className="text-sm text-purple-700 underline hover:text-purple-900"
                          >
                            Gérer les transferts →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Gestion des véhicules ({vehicles.length})</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={refresh}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Actualiser
                    </button>
                    <button 
                      onClick={() => {
                        setEditingVehicle(null);
                        setShowVehicleModal(true);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      + Ajouter un véhicule
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun véhicule trouvé</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécifications</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/jour</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles.map((vehicle) => {
                          const primaryImage = vehicle.images?.find(img => img.isPrimary) || vehicle.images?.[0];
                          const isAvailable = vehicle.availability?.status === 'disponible';
                          
                          return (
                            <tr key={vehicle._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                {primaryImage ? (
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-sm group">
                                    <img 
                                      src={typeof primaryImage === 'string' ? primaryImage : primaryImage.url} 
                                      alt={`${vehicle.brand} ${vehicle.model}`} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                    />
                                    {vehicle.isFeatured && (
                                      <div className="absolute top-1 right-1 bg-yellow-400 text-xs px-1.5 py-0.5 rounded-full text-gray-900 font-bold">
                                        ☆
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"/>
                                    </svg>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{vehicle.brand} {vehicle.model}</p>
                                  <p className="text-xs text-gray-600">Année: {vehicle.year}</p>
                                  <p className="text-xs text-gray-500">Immat: {vehicle.registration}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
                                  {vehicle.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs space-y-1">
                                  <p className="flex items-center gap-1">
                                    <span className="font-medium">{vehicle.specifications.seats} places</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <span className="capitalize">{vehicle.specifications.transmission}</span>
                                  </p>
                                  <p className="flex items-center gap-1">
                                    <span className="capitalize">{vehicle.specifications.fuel}</span>
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{vehicle.pricing?.daily?.toLocaleString()} FCFA</p>
                                  {vehicle.pricing?.weekly && (
                                    <p className="text-xs text-gray-500">{vehicle.pricing.weekly.toLocaleString()} FCFA/sem</p>
                                  )}
                                  {vehicle.chauffeurAvailable && (
                                    <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                                      Chauffeur
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-1">
                                    {vehicle.availability?.cities?.map((city, idx) => (
                                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                        {city}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative">
                                  <button
                                    onClick={() => setStatusDropdownOpen(statusDropdownOpen === vehicle._id ? null : vehicle._id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:shadow-md flex items-center gap-1 ${
                                      isAvailable
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : vehicle.availability.status === 'loue'
                                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                        : vehicle.availability.status === 'maintenance'
                                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    {isAvailable ? 'Disponible' : 
                                     vehicle.availability.status === 'loue' ? 'Loué' :
                                     vehicle.availability.status === 'maintenance' ? 'Maintenance' :
                                     'Hors service'}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  
                                  {statusDropdownOpen === vehicle._id && (
                                    <>
                                      {/* Backdrop pour fermer le dropdown */}
                                      <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setStatusDropdownOpen(null)}
                                      />
                                      
                                      {/* Menu déroulant */}
                                      <div className="absolute left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                        <button
                                          onClick={() => handleChangeVehicleStatus(vehicle._id, 'disponible')}
                                          className="w-full px-3 py-2 text-left text-xs font-medium text-green-800 hover:bg-green-50 transition-colors flex items-center gap-2"
                                        >
                                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                          Disponible
                                        </button>
                                        <button
                                          onClick={() => handleChangeVehicleStatus(vehicle._id, 'loue')}
                                          className="w-full px-3 py-2 text-left text-xs font-medium text-yellow-800 hover:bg-yellow-50 transition-colors flex items-center gap-2"
                                        >
                                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                          Loué
                                        </button>
                                        <button
                                          onClick={() => handleChangeVehicleStatus(vehicle._id, 'maintenance')}
                                          className="w-full px-3 py-2 text-left text-xs font-medium text-orange-800 hover:bg-orange-50 transition-colors flex items-center gap-2"
                                        >
                                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                          Maintenance
                                        </button>
                                        <button
                                          onClick={() => handleChangeVehicleStatus(vehicle._id, 'hors-service')}
                                          className="w-full px-3 py-2 text-left text-xs font-medium text-red-800 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                          Hors service
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {!vehicle.isActive && (
                                  <p className="text-xs text-red-600 mt-1">Inactif</p>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-col gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditingVehicle(vehicle);
                                      setShowVehicleModal(true);
                                    }}
                                    className="text-primary-600 hover:text-primary-900 font-medium hover:underline"
                                  >
                                    ✏️ Modifier
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteVehicle(vehicle._id)}
                                    className="text-red-600 hover:text-red-900 font-medium hover:underline"
                                  >
                                    🗑️ Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Reservations Tab */}
            {activeTab === 'reservations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Toutes les réservations ({reservations.length})</h3>
                  <button 
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucune réservation trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reservations.map((reservation) => {
                      // Vérifier si la réservation est terminée (date passée)
                      const endDate = new Date(reservation.endDate);
                      const now = new Date();
                      const isOverdue = endDate < now && reservation.status !== 'completed' && reservation.status !== 'cancelled';
                      const hasPaymentIssue = isOverdue && reservation.payment?.status !== 'paid';
                      
                      const getStatusBadge = (status: string) => {
                        const badges: { [key: string]: { text: string; class: string; icon: string } } = {
                          pending: { text: 'En attente', class: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
                          confirmed: { text: 'Confirmée', class: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
                          'documents-pending': { text: 'Documents requis', class: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📄' },
                          'in-progress': { text: 'En cours', class: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🚗' },
                          completed: { text: 'Terminée', class: 'bg-gray-100 text-gray-800 border-gray-200', icon: '✔️' },
                          cancelled: { text: 'Annulée', class: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
                        };
                        const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' };
                        return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${badge.class}`}>{badge.icon} {badge.text}</span>;
                      };

                      return (
                        <div key={reservation._id} className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-wrap justify-between items-center gap-4">
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                                  {reservation.code}
                                </div>
                                {getStatusBadge(reservation.status)}
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    À clôturer
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={reservation.status}
                                  onChange={(e) => handleUpdateReservationStatus(reservation._id, e.target.value)}
                                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmée</option>
                                  <option value="documents-pending">Documents requis</option>
                                  <option value="in-progress">En cours</option>
                                  <option value="completed">Terminée</option>
                                  <option value="cancelled">Annulée</option>
                                </select>
                              </div>
                            </div>
                            
                            {/* Alertes */}
                            {isOverdue && (
                              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-800">Réservation à traiter</p>
                                    <p className="text-xs text-red-700 mt-1">
                                      La date de fin était le {endDate.toLocaleDateString()} à {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. 
                                      {hasPaymentIssue && ' ⚠️ Paiement non finalisé.'}
                                      {' '}Veuillez vérifier que le véhicule a été retourné et mettre à jour le statut.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Body */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Client Info */}
                              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Client
                                </h4>
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                                    {reservation.user?.firstName?.charAt(0)}{reservation.user?.lastName?.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">
                                      {reservation.user?.firstName} {reservation.user?.lastName}
                                    </p>
                                    <a href={`mailto:${reservation.user?.email}`} className="text-sm text-blue-600 hover:text-blue-800 truncate block">
                                      {reservation.user?.email}
                                    </a>
                                    {reservation.user?.phone && (
                                      <a href={`tel:${reservation.user.phone}`} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {reservation.user.phone}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Vehicle Info */}
                              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  Véhicule
                                </h4>
                                <div className="space-y-2">
                                  <p className="font-bold text-gray-900 text-lg">
                                    {reservation.vehicle?.brand} {reservation.vehicle?.model}
                                  </p>
                                  <p className="text-sm text-gray-600">Année: {reservation.vehicle?.year}</p>
                                  {reservation.serviceType && (
                                    <p className="text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        reservation.serviceType === 'avec-chauffeur' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {reservation.serviceType === 'avec-chauffeur' ? '👤 Avec chauffeur' : '🚗 Sans chauffeur'}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Dates & Pricing */}
                              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Période & Tarif
                                </h4>
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <p className="text-gray-600">Début</p>
                                    <p className="font-medium">{new Date(reservation.startDate).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="text-gray-600">Fin</p>
                                    <p className="font-medium">{new Date(reservation.endDate).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="text-gray-600">Durée</p>
                                    <p className="font-medium">{reservation.duration} jour(s)</p>
                                  </div>
                                  <div className="pt-2 border-t border-green-200">
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="font-bold text-2xl text-green-600">
                                      {reservation.pricing?.total?.toLocaleString() || '0'} FCFA
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {reservation.pickup?.location?.address && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-gray-600 font-medium">Prise en charge</p>
                                    <p className="text-gray-900">{reservation.pickup.location.address}</p>
                                  </div>
                                </div>
                              )}
                              {reservation['return']?.location?.address && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-gray-600 font-medium">Retour</p>
                                    <p className="text-gray-900">{reservation['return'].location.address}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Chauffeur Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              {reservation.chauffeur ? (
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                        {reservation.chauffeur.firstName.charAt(0)}{reservation.chauffeur.lastName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-900">
                                          Chauffeur: {reservation.chauffeur.firstName} {reservation.chauffeur.lastName}
                                        </p>
                                        <div className="flex gap-4 text-sm text-gray-600">
                                          <a href={`tel:${reservation.chauffeur.phone}`} className="hover:text-blue-600 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {reservation.chauffeur.phone}
                                          </a>
                                          {reservation.chauffeur.email && (
                                            <a href={`mailto:${reservation.chauffeur.email}`} className="hover:text-blue-600 flex items-center gap-1">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                              </svg>
                                              {reservation.chauffeur.email}
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveChauffeur(reservation._id)}
                                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                      title="Retirer le chauffeur"
                                    >
                                      Retirer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  {selectedReservationForChauffeur === reservation._id ? (
                                    <div className="flex items-center gap-2">
                                      <select
                                        onChange={(e) => handleAssignChauffeur(reservation._id, e.target.value)}
                                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 bg-white"
                                        defaultValue=""
                                      >
                                        <option value="" disabled>Sélectionner un chauffeur...</option>
                                        {chauffeurs.map((chauffeur) => (
                                          <option key={chauffeur._id} value={chauffeur._id}>
                                            {chauffeur.firstName} {chauffeur.lastName} - {chauffeur.chauffeurProfile?.availability === 'available' ? '✅ Disponible' : '⏳ Occupé'}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => setSelectedReservationForChauffeur(null)}
                                        className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setSelectedReservationForChauffeur(reservation._id)}
                                      className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                      </svg>
                                      Attribuer un chauffeur
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Payment Status */}
                            {reservation.payment && (
                              <div className="mt-4">
                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                  <span className="text-gray-600 font-medium">Paiement:</span>
                                  <span className={`px-3 py-1.5 rounded-full font-semibold text-sm border-2 ${
                                    reservation.payment.status === 'paid' 
                                      ? 'bg-green-50 text-green-800 border-green-300' 
                                      : hasPaymentIssue
                                      ? 'bg-red-50 text-red-800 border-red-300'
                                      : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                  }`}>
                                    {reservation.payment.status === 'paid' ? (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Payé
                                      </span>
                                    ) : hasPaymentIssue ? (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        En attente (urgent)
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        En attente
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {reservation.payment.method === 'delivery-full' ? 'Paiement à la livraison (total)' : 
                                     reservation.payment.method === 'delivery-deposit' ? 'Paiement à la livraison (acompte)' :
                                     'Paiement en ligne'}
                                  </span>
                                </div>
                                {hasPaymentIssue && (
                                  <div className="mt-2 p-2 bg-orange-50 border-l-4 border-orange-400 rounded">
                                    <p className="text-xs text-orange-800 font-medium">
                                      ⚠️ Action requise : Vérifier le paiement avec le client et mettre à jour le statut avant de clôturer la réservation.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* NEW: Airport Transfers Tab */}
            {activeTab === 'airport-transfers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Transferts d'aéroport ({airportTransfers.length})</h3>
                  <button 
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : airportTransfers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun transfert d'aéroport trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {airportTransfers.map((transfer) => (
                      <div key={transfer._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${{
                                'arrivee': 'bg-blue-100 text-blue-800',
                                'depart': 'bg-green-100 text-green-800'
                              }[transfer.type]}`}>
                                {transfer.type === 'arrivee' && '✈→🏨 Arrivée'}
                                {transfer.type === 'depart' && '🏨→✈ Départ'}
                              </div>
                              <select
                                value={transfer.statut}
                                onChange={(e) => handleUpdateTransferStatus(transfer._id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="en_attente">En attente</option>
                                <option value="contacte">Contacté</option>
                                <option value="confirme">Confirmé</option>
                                <option value="termine">Terminé</option>
                                <option value="annule">Annulé</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-gray-600">Client</p>
                                <p className="font-medium">
                                  {transfer.contact?.prenom} {transfer.contact?.nom}
                                </p>
                                <p className="text-xs text-gray-500">{transfer.contact?.telephone}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">{transfer.type === 'arrivee' ? 'Arrivée' : 'Départ'}</p>
                                <p className="font-medium">{transfer.type === 'arrivee' ? transfer.arrivee : transfer.depart}</p>
                                {transfer.numeroVol && <p className="text-xs text-gray-500">Vol: {transfer.numeroVol}</p>}
                              </div>
                              <div>
                                <p className="text-gray-600">Lieu</p>
                                <p className="font-medium">{transfer.type === 'arrivee' ? transfer.depart : transfer.arrivee}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Date & Heure</p>
                                <p className="font-medium">
                                  {new Date(transfer.date).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">{transfer.heure}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Prix</p>
                                <p className="font-medium text-secondary-600">{transfer.tarif?.toLocaleString() || 'À déterminer'} F</p>
                                <p className="text-xs text-gray-500">{transfer.passagers} passager(s)</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Chauffeur</p>
                                {transfer.chauffeur ? (
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-green-600">
                                      {transfer.chauffeur.firstName} {transfer.chauffeur.lastName}
                                    </p>
                                    <button
                                      onClick={() => handleRemoveChauffeurFromTransfer(transfer._id)}
                                      className="text-red-500 hover:text-red-700"
                                      title="Retirer le chauffeur"
                                    >
                                      ❌
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">Non attribué</p>
                                )}
                              </div>
                            </div>
                            {transfer.notes && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {transfer.notes}
                                </p>
                              </div>
                            )}

                            {/* Section attribution chauffeur */}
                            {!transfer.chauffeur && (
                              <div className="mt-4 pt-4 border-t">
                                {selectedTransferForChauffeur === transfer._id ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      onChange={(e) => handleAssignChauffeurToTransfer(transfer._id, e.target.value)}
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
                                      defaultValue=""
                                    >
                                      <option value="" disabled>Sélectionner un chauffeur...</option>
                                      {chauffeurs.map((chauffeur) => (
                                        <option key={chauffeur._id} value={chauffeur._id}>
                                          {chauffeur.firstName} {chauffeur.lastName} - {chauffeur.chauffeurProfile?.availability === 'available' ? '✅ Disponible' : '⏳ Occupé'}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => setSelectedTransferForChauffeur(null)}
                                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectedTransferForChauffeur(transfer._id)}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors"
                                  >
                                    👤 Attribuer un chauffeur
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Gestion des utilisateurs ({users.length})</h3>
                  <button 
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-dark">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-600">{user.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${{
                                'admin': 'bg-red-100 text-red-800',
                                'chauffeur': 'bg-blue-100 text-blue-800',
                                'client': 'bg-gray-100 text-gray-800'
                              }[user.role] || 'bg-gray-100 text-gray-800'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isVerified ? 'Vérifié' : 'Non vérifié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.documentsVerifies ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {user.documentsVerifies ? 'Validés' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                {!user.documentsVerifies && (
                                  <button
                                    onClick={() => handleValidateDocuments(user._id)}
                                    className="text-secondary-600 hover:text-secondary-900"
                                  >
                                    Valider
                                  </button>
                                )}
                                <button className="text-primary-600 hover:text-primary-900">Voir profil</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Chauffeurs Tab */}
            {activeTab === 'chauffeurs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Gestion des chauffeurs ({chauffeurs.length})</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={refresh}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Actualiser
                    </button>
                    <button
                      onClick={() => handleOpenChauffeurModal()}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                    >
                      ➕ Nouveau chauffeur
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : chauffeurs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun chauffeur trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chauffeurs.map((chauffeur) => (
                      <div key={chauffeur._id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {chauffeur.firstName.charAt(0)}{chauffeur.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-dark">{chauffeur.firstName} {chauffeur.lastName}</p>
                              <p className="text-xs text-gray-600">{chauffeur.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            chauffeur.chauffeurProfile?.availability === 'available'
                              ? 'bg-green-100 text-green-800'
                              : chauffeur.chauffeurProfile?.availability === 'busy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {chauffeur.chauffeurProfile?.availability === 'available' && '✅ Disponible'}
                            {chauffeur.chauffeurProfile?.availability === 'busy' && '⏳ Occupé'}
                            {chauffeur.chauffeurProfile?.availability === 'offline' && '⭕ Hors ligne'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📞</span>
                            <span>{chauffeur.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>⭐</span>
                            <span>Note: {chauffeur.chauffeurProfile?.rating?.toFixed(1) || '0.0'}/5</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>🚗</span>
                            <span>Courses: {chauffeur.chauffeurProfile?.totalRides || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📅</span>
                            <span>Exp: {chauffeur.chauffeurProfile?.experience || 0} ans</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <button
                            onClick={() => handleOpenChauffeurModal(chauffeur)}
                            className="flex-1 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md text-sm font-medium transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteChauffeur(chauffeur._id)}
                            className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-sm font-medium transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NEW: Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Gestion des paiements</h3>
                  <button 
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun paiement trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filtres */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
                          <select 
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            onChange={(e) => {
                              // Placeholder pour futur filtre
                              console.log('Filtre:', e.target.value);
                            }}
                          >
                            <option value="all">Tous</option>
                            <option value="paid">Payés</option>
                            <option value="pending">En attente</option>
                          </select>
                        </div>
                        <div className="ml-auto flex gap-4 text-sm">
                          <div className="px-3 py-1.5 bg-green-50 rounded-lg">
                            <span className="text-gray-600">Payés: </span>
                            <span className="font-bold text-green-700">
                              {reservations.filter(r => r.payment?.status === 'paid').length}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 bg-yellow-50 rounded-lg">
                            <span className="text-gray-600">En attente: </span>
                            <span className="font-bold text-yellow-700">
                              {reservations.filter(r => r.payment?.status !== 'paid').length}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
                            <span className="text-gray-600">Total: </span>
                            <span className="font-bold text-blue-700">
                              {reservations.reduce((sum, r) => sum + (r.pricing?.total || 0), 0).toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Liste des paiements */}
                    {reservations.map((reservation) => {
                      const endDate = new Date(reservation.endDate);
                      const now = new Date();
                      const isOverdue = endDate < now && reservation.status !== 'completed' && reservation.status !== 'cancelled';
                      const hasPaymentIssue = reservation.payment?.status !== 'paid';

                      return (
                        <div key={reservation._id} className="border-2 rounded-lg p-6 hover:bg-gray-50 transition-colors bg-white">
                          <div className="flex flex-col lg:flex-row justify-between gap-6">
                            {/* Infos réservation */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="bg-primary-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                                  {reservation.code}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900">
                                      {reservation.vehicle?.brand} {reservation.vehicle?.model}
                                    </h4>
                                    {isOverdue && hasPaymentIssue && (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        ⚠️ URGENT
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span>{reservation.user?.firstName} {reservation.user?.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span>{new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Infos paiement */}
                              {reservation.payment && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600 mb-1">Méthode</p>
                                      <p className="font-medium capitalize flex items-center gap-2">
                                        {reservation.payment.method === 'delivery-full' && '💵 Paiement à la livraison (total)'}
                                        {reservation.payment.method === 'delivery-deposit' && '💵 Paiement à la livraison (acompte)'}
                                        {reservation.payment.method === 'online' && '💳 Paiement en ligne'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-1">Montant</p>
                                      <p className="font-bold text-lg text-secondary-600">
                                        {reservation.pricing?.total?.toLocaleString() || '0'} FCFA
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-1">Statut</p>
                                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                                        reservation.payment.status === 'paid' 
                                          ? 'bg-green-100 text-green-800' 
                                          : hasPaymentIssue && isOverdue
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {reservation.payment.status === 'paid' ? (
                                          <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Payé
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            En attente
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {hasPaymentIssue && isOverdue && (
                                    <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                                      <p className="text-xs text-orange-800 font-medium">
                                        ⚠️ La période de location est terminée. Veuillez confirmer la réception du paiement et mettre à jour le statut de la réservation.
                                      </p>
                                    </div>
                                  )}

                                  {reservation.payment.paidAt && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      Payé le {new Date(reservation.payment.paidAt).toLocaleDateString()} à {new Date(reservation.payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 lg:w-48">
                              {reservation.payment?.status !== 'paid' && (
                                <button
                                  onClick={() => handleUpdateReservationStatus(reservation._id, 'completed')}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                  ✓ Marquer comme payé
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-dark">Modération des avis ({reviews.length})</h3>
                  <button 
                    onClick={refresh}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Actualiser
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun avis trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div>
                                <p className="font-semibold text-dark">
                                  {review.user?.firstName} {review.user?.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{review.user?.email}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-2 text-sm font-medium">({review.rating}/5)</span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span>📅 {new Date(review.createdAt).toLocaleDateString()}</span>
                              {review.vehicle && (
                                <span>🚗 {review.vehicle.brand} {review.vehicle.model}</span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                                'en_attente': 'bg-yellow-100 text-yellow-800',
                                'approuve': 'bg-green-100 text-green-800',
                                'rejete': 'bg-red-100 text-red-800'
                              }[review.statut] || 'bg-gray-100 text-gray-800'}`}>
                                {review.statut === 'en_attente' && 'En attente'}
                                {review.statut === 'approuve' && 'Approuvé'}
                                {review.statut === 'rejete' && 'Rejeté'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.statut === 'en_attente' && (
                          <div className="flex gap-3 pt-4 border-t">
                            <button
                              onClick={() => handleApproveReview(review._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approuver
                            </button>
                            <button
                              onClick={() => handleRejectReview(review._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Chauffeur */}
        {showChauffeurModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark">
                  {editingChauffeur ? 'Modifier le chauffeur' : 'Nouveau chauffeur'}
                </h2>
                <button
                  onClick={handleCloseChauffeurModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveChauffeur} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={chauffeurFormData.firstName}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={chauffeurFormData.lastName}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={chauffeurFormData.email}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={chauffeurFormData.phone}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, phone: e.target.value })}
                      placeholder="+225XXXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  {!editingChauffeur && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        value={chauffeurFormData.password}
                        onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required={!editingChauffeur}
                        minLength={8}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <select
                      value={chauffeurFormData.city}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Abidjan">Abidjan</option>
                      <option value="Yamoussoukro">Yamoussoukro</option>
                      <option value="San-Pédro">San-Pédro</option>
                      <option value="Bouaké">Bouaké</option>
                      <option value="Korhogo">Korhogo</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Années d'expérience
                    </label>
                    <input
                      type="number"
                      value={chauffeurFormData.experience}
                      onChange={(e) => setChauffeurFormData({ ...chauffeurFormData, experience: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseChauffeurModal}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
                  >
                    {editingChauffeur ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de gestion des véhicules */}
        <VehicleFormModal
          isOpen={showVehicleModal}
          onClose={() => {
            setShowVehicleModal(false);
            setEditingVehicle(null);
          }}
          onSuccess={() => {
            refresh();
          }}
          vehicleToEdit={editingVehicle}
        />

        {/* ConfirmDialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;