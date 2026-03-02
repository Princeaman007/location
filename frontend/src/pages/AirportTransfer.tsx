import { useState } from 'react';
import { Plane } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const AirportTransfer = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'arrivee',
    date: '',
    heure: '',
    numeroVol: '',
    depart: '',
    arrivee: '',
    passagers: '1',
    telephone: user?.phone || '',
    nom: user?.lastName || '',
    prenom: user?.firstName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/airport-transfers', {
        type: formData.type,
        date: formData.date,
        heure: formData.heure,
        numeroVol: formData.numeroVol || undefined,
        depart: formData.type === 'depart' ? formData.depart : undefined,
        arrivee: formData.type === 'arrivee' ? formData.arrivee : undefined,
        passagers: parseInt(formData.passagers),
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email || undefined,
      });

      if (response.data.success) {
        setTransferData(response.data.data);
        setShowSuccessModal(true);
        
        // Réinitialiser le formulaire sauf les infos personnelles
        setFormData({
          ...formData,
          type: 'arrivee',
          date: '',
          heure: '',
          numeroVol: '',
          depart: '',
          arrivee: '',
          passagers: '1',
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    { icon: '', title: 'Accueil à l\'aéroport', desc: 'Votre chauffeur vous attend avec une pancarte' },
    { icon: '', title: 'Véhicules premium', desc: 'Flotte de véhicules confortables et climatisés' },
    { icon: '', title: 'Ponctualité garantie', desc: 'Suivi de votre vol en temps réel' },
    { icon: '', title: 'Service sur mesure', desc: 'Réponse rapide et devis personnalisé' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-600 text-white py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Plane className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-h1 font-heading font-bold mb-4">
              Transfert Aéroport Félix Houphouët-Boigny
            </h1>
            <p className="text-xl opacity-90">
              Service premium de transfert depuis et vers l'aéroport d'Abidjan
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-5xl mb-3">{service.icon}</div>
                <h3 className="font-heading font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulaire de réservation */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-h3 font-heading font-bold mb-2">
                Demande de transfert
              </h2>
              <p className="text-gray-600 mb-6">
                Remplissez ce formulaire et nous vous recontacterons rapidement pour confirmer votre réservation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type de transfert */}
                <div>
                  <label className="form-label">Type de transfert *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'arrivee' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === 'arrivee'
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Plane className="w-5 h-5 mx-auto mb-2" />
                      <span className="font-medium">Arrivée</span>
                      <p className="text-xs mt-1 opacity-75">Aéroport → Ville</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'depart' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.type === 'depart'
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Plane className="w-5 h-5 mx-auto mb-2 transform rotate-45" />
                      <span className="font-medium">Départ</span>
                      <p className="text-xs mt-1 opacity-75">Ville → Aéroport</p>
                    </button>
                  </div>
                </div>

                {/* Date et Heure */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Heure *</label>
                    <input
                      type="time"
                      name="heure"
                      value={formData.heure}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Numéro de vol */}
                <div>
                  <label className="form-label">Numéro de vol</label>
                  <input
                    type="text"
                    name="numeroVol"
                    value={formData.numeroVol}
                    onChange={handleChange}
                    placeholder="Ex: AF 748, ET 915..."
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pour un suivi en temps réel de votre vol</p>
                </div>

                {/* Adresse */}
                <div>
                  <label className="form-label">
                    {formData.type === 'arrivee' ? 'Adresse de destination *' : 'Adresse de départ *'}
                  </label>
                  <input
                    type="text"
                    name={formData.type === 'arrivee' ? 'arrivee' : 'depart'}
                    value={formData.type === 'arrivee' ? formData.arrivee : formData.depart}
                    onChange={handleChange}
                    placeholder="Ex: Hôtel Ivoire, Cocody Riviera..."
                    className="form-input"
                    required
                  />
                </div>

                {/* Nombre de passagers */}
                <div>
                  <label className="form-label">Nombre de passagers *</label>
                  <select
                    name="passagers"
                    value={formData.passagers}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num} passager{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-5">
                  <h3 className="font-semibold mb-4">Vos coordonnées</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="form-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pour recevoir une confirmation par email</p>
                  </div>

                  <div>
                    <label className="form-label">Téléphone *</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="+225 07 12 34 56 78"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Notre équipe vous contactera sous 15 minutes pour confirmer votre réservation et vous communiquer le tarif.
                </p>
              </form>
            </div>

            {/* Informations */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="font-heading font-semibold text-xl mb-6">
                  Inclus dans le service
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: '', text: 'Suivi du vol en temps réel' },
                    { icon: '', text: 'Accueil personnalisé avec pancarte' },
                    { icon: '', text: 'Aide avec les bagages' },
                    { icon: '', text: 'Véhicule climatisé et confortable' },
                    { icon: '', text: 'Chauffeur professionnel et courtois' },
                    { icon: '', text: 'Eau fraîche offerte' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="pt-0.5">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-xl">
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Pourquoi nous choisir ?
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ✓
                      </div>
                      <h4 className="font-semibold">Ponctualité garantie</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-13">
                      Votre chauffeur arrive toujours à l'heure, suivi de vol en temps réel
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ✓
                      </div>
                      <h4 className="font-semibold">Prix transparent</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-13">
                      Tarif fixe communiqué à l'avance, pas de mauvaise surprise
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ✓
                      </div>
                      <h4 className="font-semibold">Service premium</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-13">
                      Flotte de véhicules récents, propres et bien entretenus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-h2 font-heading font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Comment se déroule l\'accueil à l\'aéroport ?',
                r: 'Votre chauffeur vous attendra dans le hall des arrivées avec une pancarte à votre nom. Il vous aidera avec vos bagages et vous conduira directement au véhicule.'
              },
              {
                q: 'Que se passe-t-il si mon vol est retardé ?',
                r: 'Nous suivons votre vol en temps réel. Si votre vol est retardé, votre chauffeur ajustera automatiquement son heure d\'arrivée, sans frais supplémentaires.'
              },
              {
                q: 'Puis-je annuler ou modifier ma réservation ?',
                r: 'Oui, vous pouvez modifier ou annuler gratuitement votre réservation jusqu\'à 24h avant l\'heure prévue.'
              },
              {
                q: 'Quels modes de paiement acceptez-vous ?',
                r: 'Nous acceptons le paiement en espèces (FCFA), par carte bancaire, et par mobile money (Orange Money, MTN Money, Moov Money).'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-heading font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de confirmation */}
      {showSuccessModal && transferData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* En-tête avec animation */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center">Demande Envoyée !</h3>
            </div>

            {/* Contenu */}
            <div className="p-4">
              <div className="mb-3 text-center">
                <p className="text-gray-700 mb-1">
                  Votre demande a été enregistrée.
                </p>
                <p className="text-sm text-gray-600">
                  Notre équipe vous contactera sous <span className="font-bold text-primary-600">15 minutes</span>.
                </p>
              </div>

              {/* Récapitulatif */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 mb-3 border border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Récapitulatif
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium">Type:</span>
                    <span>{transferData.type === 'arrivee' ? 'Arrivée' : 'Départ'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Date:</span>
                    <span>{new Date(transferData.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Heure:</span>
                    <span>{transferData.heure}</span>
                  </div>
                  {transferData.numeroVol && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="font-medium">Vol:</span>
                      <span>{transferData.numeroVol}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Passagers:</span>
                    <span>{transferData.passagers} personne{transferData.passagers > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Prochaines étapes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-1.5 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Prochaines étapes
                </h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Un membre de notre équipe vous appellera sous 15 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Nous confirmerons tous les détails du transfert</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Un chauffeur professionnel vous sera assigné</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Vous recevrez les coordonnées de votre chauffeur</span>
                  </li>
                </ul>
              </div>

              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportTransfer;
