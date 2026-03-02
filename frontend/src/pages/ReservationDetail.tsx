import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

interface Reservation {
  _id: string;
  code: string;
  vehicle: {
    _id: string;
    brand: string;
    model: string;
    year: number;
    images: {
      url: string;
      publicId: string;
      isPrimary: boolean;
    }[];
    pricing: {
      daily: number;
      chauffeurSupplement: number;
    };
  };
  startDate: string;
  endDate: string;
  duration: number;
  serviceType: 'sans-chauffeur' | 'avec-chauffeur';
  chauffeur?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  pickup?: {
    type: string;
    location?: {
      address?: string;
      city?: string;
    };
    time: string;
  };
  ['return']?: {
    type: string;
    location?: {
      address?: string;
      city?: string;
    };
    time: string;
  };
  additionalOptions?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;

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
  payment: {
    method: string;
    status: string;
  };
  status: string;
}

const ReservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({
    startDate: '',
    endDate: '',
    pickupAddress: '',
    returnAddress: '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      const response = await api.get(`/reservations/${id}`);
      const data = response.data.data;
      setReservation(data);
      
      // Initialiser les données d'édition
      setEditData({
        startDate: new Date(data.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.endDate).toISOString().slice(0, 16),
        pickupAddress: data.pickup?.location?.address || '',
        returnAddress: data['return']?.location?.address || '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger la réservation');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!reservation) return;

    // Validation
    if (!editData.startDate || !editData.endDate) {
      toast.error('Veuillez sélectionner les dates');
      return;
    }

    if (new Date(editData.startDate) < new Date()) {
      toast.error('La date de début ne peut pas être dans le passé');
      return;
    }

    if (new Date(editData.endDate) <= new Date(editData.startDate)) {
      toast.error('La date de fin doit être après la date de début');
      return;
    }

    if (!editData.pickupAddress || !editData.returnAddress) {
      toast.error('Veuillez renseigner les adresses de prise en charge et de retour');
      return;
    }

    setUpdating(true);

    try {
      const start = new Date(editData.startDate);
      const end = new Date(editData.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const updatePayload = {
        startDate: editData.startDate,
        endDate: editData.endDate,
        duration,
        pickup: {
          type: reservation.pickup?.type || 'delivery',
          location: {
            address: editData.pickupAddress,
          },
          time: editData.startDate,
        },
        return: {
          type: reservation['return']?.type || 'delivery',
          location: {
            address: editData.returnAddress,
          },
          time: editData.endDate,
        },
      };

      await api.put(`/reservations/${id}`, updatePayload);
      toast.success('Réservation mise à jour avec succès !');
      setIsEditing(false);
      fetchReservation(); // Recharger les données
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      console.error('Erreur:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelReservation = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Annuler la réservation',
      message: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await api.delete(`/reservations/${id}`);
          toast.success('Réservation annulée avec succès');
          navigate('/dashboard');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
          console.error('Erreur:', error);
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; class: string } } = {
      pending: { text: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'Confirmée', class: 'bg-green-100 text-green-800' },
      'documents-pending': { text: 'Documents en attente', class: 'bg-blue-100 text-blue-800' },
      'in-progress': { text: 'En cours', class: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Terminée', class: 'bg-gray-100 text-gray-800' },
      cancelled: { text: 'Annulée', class: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || { text: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Réservation introuvable</p>
      </div>
    );
  }

  const canEdit = ['pending', 'confirmed'].includes(reservation.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au tableau de bord
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-dark">Détails de la réservation</h1>
                <p className="text-gray-600 mt-2">Code: {reservation.code}</p>
              </div>
              {getStatusBadge(reservation.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Détails principaux */}
            <div className="lg:col-span-2 space-y-6">
              {/* Véhicule */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-dark mb-4">Véhicule</h2>
                <div className="flex gap-4">
                  <img
                    src={reservation.vehicle.images?.[0]?.url || '/placeholder-car.jpg'}
                    alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-dark">
                      {reservation.vehicle.brand} {reservation.vehicle.model}
                    </h3>
                    <p className="text-gray-600">Année: {reservation.vehicle.year}</p>
                    <p className="text-gray-600 mt-2">
                      Type: {reservation.serviceType === 'avec-chauffeur' ? 'Avec chauffeur' : 'Sans chauffeur'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates et lieux */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-dark">Dates et lieux</h2>
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={editData.startDate}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={editData.endDate}
                        onChange={handleChange}
                        min={editData.startDate}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de prise en charge
                      </label>
                      <input
                        type="text"
                        name="pickupAddress"
                        value={editData.pickupAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lieu de retour
                      </label>
                      <input
                        type="text"
                        name="returnAddress"
                        value={editData.returnAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-1 py-2 px-4 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:opacity-50 transition-colors"
                      >
                        {updating ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Réinitialiser les données
                          setEditData({
                            startDate: new Date(reservation.startDate).toISOString().slice(0, 16),
                            endDate: new Date(reservation.endDate).toISOString().slice(0, 16),
                            pickupAddress: reservation.pickup?.location?.address || '',
                            returnAddress: reservation['return']?.location?.address || '',
                          });
                        }}
                        className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Dates</h3>
                      <p className="text-gray-600">
                        Du {new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-gray-600">
                        Au {new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-gray-800 font-semibold mt-2">
                        Durée: {reservation.duration} jour(s)
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Prise en charge</h3>
                      <p className="text-gray-600">{reservation.pickup?.location?.address || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1">Retour</h3>
                      <p className="text-gray-600">{reservation['return']?.location?.address || 'Non spécifié'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chauffeur */}
              {reservation.chauffeur && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-dark mb-4">Chauffeur assigné</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {reservation.chauffeur.firstName.charAt(0)}{reservation.chauffeur.lastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-dark">
                        {reservation.chauffeur.firstName} {reservation.chauffeur.lastName}
                      </h3>
                      <p className="text-gray-600">{reservation.chauffeur.phone}</p>
                      <p className="text-gray-600">{reservation.chauffeur.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              {reservation.additionalOptions && reservation.additionalOptions.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-dark mb-4">Options supplémentaires</h2>
                  <ul className="space-y-2">
                    {reservation.additionalOptions.map((option, index) => (
                      <li key={index} className="flex justify-between items-center text-gray-600">
                        <span>{option.name}</span>
                        <span className="font-medium">{option.price.toLocaleString()} FCFA/jour</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Résumé et actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-bold text-dark mb-4">Résumé financier</h3>
                
                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location véhicule</span>
                    <span className="font-medium">{reservation.pricing.vehicleTotal.toLocaleString()} FCFA</span>
                  </div>
                  {reservation.pricing.chauffeurTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chauffeur</span>
                      <span className="font-medium">{reservation.pricing.chauffeurTotal.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {reservation.pricing.optionsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Options</span>
                      <span className="font-medium">{reservation.pricing.optionsTotal.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  {reservation.pricing.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-secondary-600">
                      <span>Réduction fidélité</span>
                      <span className="font-medium">-{reservation.pricing.loyaltyDiscount.toLocaleString()} FCFA</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-dark">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {reservation.pricing.total.toLocaleString()} FCFA
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Méthode de paiement: {reservation.payment.method === 'delivery-full' ? 'Paiement à la livraison' : 'Paiement en ligne'}</p>
                    <p>Statut: {reservation.payment.status === 'pending' ? 'En attente' : 'Payé'}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={handleCancelReservation}
                      className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Annuler la réservation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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

export default ReservationDetail;
