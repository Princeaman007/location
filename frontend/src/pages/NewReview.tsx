import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Reservation {
  _id: string;
  code: string;
  vehicle: {
    _id: string;
    brand: string;
    model: string;
    year: number;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
  chauffeur?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  startDate: string;
  endDate: string;
  serviceType: string;
}

const NewReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservation');
  const { user } = useAuthStore();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Note globale
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Notes détaillées
  const [detailedRating, setDetailedRating] = useState({
    cleanliness: 0,
    comfort: 0,
    performance: 0,
    value: 0,
  });

  // Note chauffeur
  const [chauffeurRating, setChauffeurRating] = useState({
    rating: 0,
    comment: '',
  });

  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!reservationId) {
      toast.error('Réservation non spécifiée');
      navigate('/dashboard');
      return;
    }

    fetchReservation();
  }, [reservationId, user, navigate]);

  const fetchReservation = async () => {
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      const res = response.data.data;

      // Vérifier que la réservation est terminée
      if (res.status !== 'completed') {
        toast.error('Vous pouvez laisser un avis uniquement après la fin de la location');
        navigate('/dashboard');
        return;
      }

      setReservation(res);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (rating === 0) {
      toast.error('Veuillez donner une note globale');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    if (detailedRating.cleanliness === 0 || detailedRating.comfort === 0 || 
        detailedRating.performance === 0 || detailedRating.value === 0) {
      toast.error('Veuillez noter tous les critères détaillés');
      return;
    }

    if (reservation?.chauffeur && chauffeurRating.rating === 0) {
      toast.error('Veuillez noter le service du chauffeur');
      return;
    }

    setSubmitting(true);

    try {
      const reviewData: any = {
        reservationId: reservation?._id,
        vehicleId: reservation?.vehicle._id,
        rating,
        comment: comment.trim(),
        detailedRating,
      };

      if (reservation?.chauffeur && chauffeurRating.rating > 0) {
        reviewData.chauffeurRating = chauffeurRating;
      }

      const response = await api.post('/reviews', reviewData);

      toast.success(response.data.message || 'Avis publié avec succès ! Merci pour votre retour', {
        duration: 4000,
      });

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la publication de l\'avis');
      setSubmitting(false);
    }
  };

  const renderStars = (
    currentRating: number,
    onRate: (rating: number) => void,
    hoverable: boolean = true,
    size: 'sm' | 'md' | 'lg' = 'lg'
  ) => {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-7 h-7',
      lg: 'w-10 h-10',
    };

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => hoverable && setHoverRating(star)}
            onMouseLeave={() => hoverable && setHoverRating(0)}
            className={`${sizeClasses[size]} transition-all duration-200 transform hover:scale-110 focus:outline-none`}
          >
            <svg
              className={`w-full h-full ${
                star <= (hoverable && hoverRating > 0 ? hoverRating : currentRating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const renderDetailedRating = (
    label: string,
    key: keyof typeof detailedRating
  ) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              setDetailedRating({ ...detailedRating, [key]: star })
            }
            className="w-6 h-6 transition-transform hover:scale-110 focus:outline-none"
          >
            <svg
              className={`w-full h-full ${
                star <= detailedRating[key] ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  const primaryImage = reservation.vehicle.images?.find((img) => img.isPrimary) || reservation.vehicle.images?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Laisser un avis</h1>
          <p className="text-gray-600 mt-2">Partagez votre expérience avec notre véhicule</p>
        </div>

        {/* Carte véhicule */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex gap-6">
            {primaryImage && (
              <img
                src={primaryImage.url}
                alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {reservation.vehicle.brand} {reservation.vehicle.model} ({reservation.vehicle.year})
              </h2>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Code de réservation:</span> {reservation.code}
                </p>
                <p>
                  <span className="font-medium">Période:</span>{' '}
                  {new Date(reservation.startDate).toLocaleDateString()} -{' '}
                  {new Date(reservation.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'avis */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Note globale */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Note globale *</h3>
            <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
              {renderStars(rating, setRating)}
              <p className="text-gray-600 text-sm">
                {rating === 0 && 'Cliquez sur les étoiles pour donner votre note'}
                {rating === 1 && 'Très décevant'}
                {rating === 2 && 'Décevant'}
                {rating === 3 && 'Correct'}
                {rating === 4 && 'Très bien'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>
          </div>

          {/* Notes détaillées */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Évaluation détaillée *</h3>
            <div className="space-y-3">
              {renderDetailedRating('Propreté', 'cleanliness')}
              {renderDetailedRating('Confort', 'comfort')}
              {renderDetailedRating('Performance', 'performance')}
              {renderDetailedRating('Rapport qualité-prix', 'value')}
            </div>
          </div>

          {/* Note du chauffeur si applicable */}
          {reservation.chauffeur && (
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Service du chauffeur *
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Chauffeur: {reservation.chauffeur.firstName} {reservation.chauffeur.lastName}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium text-gray-700">Note:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setChauffeurRating({ ...chauffeurRating, rating: star })
                      }
                      className="w-8 h-8 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <svg
                        className={`w-full h-full ${
                          star <= chauffeurRating.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={chauffeurRating.comment}
                onChange={(e) =>
                  setChauffeurRating({ ...chauffeurRating, comment: e.target.value })
                }
                placeholder="Commentaire sur le service du chauffeur (optionnel)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Commentaire */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-900 mb-2">
              Votre commentaire *
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Minimum 10 caractères. Partagez votre expérience en détail pour aider les autres utilisateurs.
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience avec ce véhicule... Qu'avez-vous particulièrement apprécié ? Y a-t-il des points à améliorer ?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={6}
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 mt-2">
              {comment.length} / 1000 caractères
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publication...
                </span>
              ) : (
                'Publier mon avis'
              )}
            </button>
            <Link
              to="/dashboard"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Annuler
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            💎 En publiant votre avis, vous gagnez 20 points de fidélité !
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default NewReview;
