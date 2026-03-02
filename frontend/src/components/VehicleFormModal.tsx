import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  category: string;
  registration: string;
  specifications: {
    transmission: string;
    fuel: string;
    seats: number;
    doors: number;
    color: string;
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
  description: string;
  isFeatured: boolean;
}

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleToEdit?: any;
}

const initialFormData: VehicleFormData = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: 'economique',
  registration: '',
  specifications: {
    transmission: 'automatique',
    fuel: 'essence',
    seats: 5,
    doors: 4,
    color: '',
    features: {
      airConditioning: true,
      gps: false,
      bluetooth: false,
      camera: false,
      sunroof: false,
      leatherSeats: false,
      cruiseControl: false,
    },
  },
  pricing: {
    daily: 0,
    weekly: undefined,
    monthly: undefined,
    chauffeurSupplement: 15000,
  },
  availability: {
    status: 'disponible',
    cities: [],
  },
  chauffeurAvailable: true,
  description: '',
  isFeatured: false,
};

const VehicleFormModal = ({ isOpen, onClose, onSuccess, vehicleToEdit }: VehicleFormModalProps) => {
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });

  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        setFormData({
          brand: vehicleToEdit.brand || '',
          model: vehicleToEdit.model || '',
          year: vehicleToEdit.year || new Date().getFullYear(),
          category: vehicleToEdit.category || 'economique',
          registration: vehicleToEdit.registration || '',
          specifications: vehicleToEdit.specifications || initialFormData.specifications,
          pricing: vehicleToEdit.pricing || initialFormData.pricing,
          availability: vehicleToEdit.availability || initialFormData.availability,
          chauffeurAvailable: vehicleToEdit.chauffeurAvailable || true,
          description: vehicleToEdit.description || '',
          isFeatured: vehicleToEdit.isFeatured || false,
        });
        
        // Charger les images existantes
        if (vehicleToEdit.images && vehicleToEdit.images.length > 0) {
          setExistingImages(vehicleToEdit.images);
        } else {
          setExistingImages([]);
        }
        setNewImages([]);
        setNewImagePreviews([]);
      } else {
        setFormData(initialFormData);
        setNewImages([]);
        setNewImagePreviews([]);
        setExistingImages([]);
        setCurrentStep(1);
      }
    }
  }, [vehicleToEdit, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Helper pour parser les nombres sans obtenir NaN
    const parseNumber = (val: string) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = parseFloat(val);
      return isNaN(num) ? undefined : num;
    };

    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        if (parent === 'specifications') {
          const specs = { ...newData.specifications };
          if (subChild) {
            // Pour features
            specs.features = {
              ...specs.features,
              [subChild]: type === 'checkbox' ? checked : value,
            };
          } else {
            (specs as any)[child] = type === 'number' ? parseNumber(value) : value;
          }
          newData.specifications = specs;
        } else if (parent === 'pricing') {
          newData.pricing = {
            ...newData.pricing,
            [child]: type === 'number' ? parseNumber(value) : value,
          };
        } else if (parent === 'availability') {
          newData.availability = {
            ...newData.availability,
            [child]: value,
          };
        }
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseNumber(value) : value,
      }));
    }
  };

  const handleCityToggle = (city: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        cities: prev.availability.cities.includes(city)
          ? prev.availability.cities.filter((c) => c !== city)
          : [...prev.availability.cities, city],
      },
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    console.log('Fichiers sélectionnés:', files.length);
    
    if (files.length === 0) {
      console.log('Aucun fichier sélectionné');
      return;
    }
    
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images autorisées');
      e.target.value = ''; // Reset input
      return;
    }

    // Valider la taille des fichiers
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error('Certaines images dépassent 5MB');
      e.target.value = ''; // Reset input
      return;
    }

    setNewImages(prev => {
      const newImgs = [...prev, ...files];
      console.log('Total nouvelles images après ajout:', newImgs.length);
      return newImgs;
    });

    // Créer des previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input pour permettre de sélectionner les mêmes fichiers à nouveau
    e.target.value = '';
    
    toast.success(`${files.length} image(s) ajoutée(s)`);
  };

  const handleRemoveNewImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast('Image retirée');
  };

  const handleRemoveExistingImage = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!vehicleToEdit) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cette image',
      message: 'Êtes-vous sûr de vouloir supprimer cette image du serveur ? Cette action est irréversible.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/vehicles/${vehicleToEdit._id}/images/${imageId}`);
          setExistingImages(prev => prev.filter(img => img._id !== imageId));
          toast.success('Image supprimée du serveur');
        } catch (error: any) {
          console.error('Erreur suppression image:', error);
          toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'image');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUT SOUMISSION FORMULAIRE ===');
    console.log('Étape actuelle:', currentStep);
    console.log('Nombre de nouvelles images:', newImages.length);
    console.log('Nombre d\'images existantes:', existingImages.length);
    console.log('FormData:', formData);
    
    // Empêcher la soumission si on n'est pas à l'étape 4 (Photos)
    if (currentStep < 4) {
      console.log('Tentative de soumission avant l\'étape 4 - bloquée');
      toast.error('Veuillez compléter toutes les étapes');
      return;
    }
    
    // Validation: au moins 1 image requise (existante ou nouvelle)
    const totalImages = existingImages.length + newImages.length;
    if (!vehicleToEdit && totalImages === 0) {
      console.log('Aucune image - soumission bloquée');
      toast.error('Veuillez ajouter au moins une image du véhicule');
      return;
    }

    // Confirmation avant création/modification
    const confirmMessage = vehicleToEdit 
      ? `Confirmer la modification du véhicule ${formData.brand} ${formData.model} ?\n\nImages existantes: ${existingImages.length}\nNouvelles images: ${newImages.length}`
      : `Confirmer la création du véhicule ${formData.brand} ${formData.model} (${formData.year}) ?\n\nPrix: ${formData.pricing.daily.toLocaleString()} FCFA/jour\nCatégorie: ${formData.category}\nImages: ${newImages.length}`;
    
    setConfirmDialog({
      isOpen: true,
      title: vehicleToEdit ? 'Modifier le véhicule' : 'Créer le véhicule',
      message: confirmMessage,
      variant: 'info',
      onConfirm: async () => {
        await performSubmit();
      }
    });
  };

  const performSubmit = async () => {
    console.log('Validations passées - début upload');
    setLoading(true);

    try {
      // Nettoyer les données avant l'envoi (retirer les undefined et NaN)
      const cleanedFormData = {
        ...formData,
        pricing: {
          daily: formData.pricing.daily || 0,
          ...(formData.pricing.weekly && { weekly: formData.pricing.weekly }),
          ...(formData.pricing.monthly && { monthly: formData.pricing.monthly }),
          ...(formData.pricing.chauffeurSupplement && { chauffeurSupplement: formData.pricing.chauffeurSupplement }),
        },
        specifications: {
          ...formData.specifications,
          seats: formData.specifications.seats || 5,
          doors: formData.specifications.doors || 4,
        },
        year: formData.year || new Date().getFullYear(),
      };

      console.log('Données nettoyées:', cleanedFormData);

      const formDataToSend = new FormData();
      
      // Ajouter les données JSON
      formDataToSend.append('data', JSON.stringify(cleanedFormData));
      console.log('Data JSON ajoutée');

      // Ajouter les nouvelles images seulement
      newImages.forEach((image, index) => {
        console.log(`Ajout nouvelle image ${index + 1}:`, image.name, image.size, 'bytes');
        formDataToSend.append('images', image);
      });
      
      console.log('Total nouvelles images ajoutées au FormData:', newImages.length);

      // Log FormData entries
      console.log('=== CONTENU FORMDATA ===');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      if (vehicleToEdit) {
        console.log('Mode: Mise à jour véhicule', vehicleToEdit._id);
        // Mise à jour
        const response = await api.put(`/vehicles/${vehicleToEdit._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Réponse PUT:', response.data);
        toast.success('Véhicule mis à jour avec succès');
      } else {
        console.log('Mode: Création nouveau véhicule');
        // Création
        const response = await api.post('/vehicles', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Réponse POST:', response.data);
        toast.success('Véhicule créé avec succès');
      }

      console.log('=== FIN SOUMISSION RÉUSSIE ===');
      onSuccess();
      onClose();
      setFormData(initialFormData);
      setNewImages([]);
      setNewImagePreviews([]);
      setExistingImages([]);
      setCurrentStep(1);
    } catch (error: any) {
      console.error('=== ERREUR SOUMISSION ===');
      console.error('Error object:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Error message from backend:', error.response?.data?.message);
      console.error('Error details:', error.response?.data?.error);
      console.error('Validation details:', error.response?.data?.details);
      
      // Afficher un message d'erreur plus détaillé
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
      const errorDetails = error.response?.data?.error;
      const validationDetails = error.response?.data?.details;
      
      if (validationDetails && Array.isArray(validationDetails)) {
        const fieldErrors = validationDetails.map((d: any) => `${d.field}: ${d.message}`).join(', ');
        console.error('Erreurs de validation:', fieldErrors);
        toast.error(`${errorMessage}: ${fieldErrors}`);
      } else if (errorDetails) {
        console.error('Détails de l\'erreur:', errorDetails);
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['economique', 'berline', 'suv', '4x4', 'minibus', 'luxe'];
  const cities = ['Abidjan', 'Yamoussoukro', 'San-Pédro', 'Bouaké', 'Korhogo'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {vehicleToEdit ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-center mt-6 space-x-2">
              {[
                { num: 1, label: 'Infos' },
                { num: 2, label: 'Specs' },
                { num: 3, label: 'Prix' },
                { num: 4, label: 'Photos' }
              ].map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.num
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.num}
                    </div>
                    <span className={`text-xs mt-1 ${currentStep >= step.num ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-12 h-1 mb-5 ${
                        currentStep > step.num ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Informations de base */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Informations de base</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marque *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modèle *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Année *
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year || ''}
                        onChange={handleInputChange}
                        required
                        min={2010}
                        max={new Date().getFullYear() + 1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Immatriculation *
                      </label>
                      <input
                        type="text"
                        name="registration"
                        value={formData.registration}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Couleur
                      </label>
                      <input
                        type="text"
                        name="specifications.color"
                        value={formData.specifications.color}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 caractères</p>
                  </div>
                </div>
              )}

              {/* Step 2: Spécifications */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Spécifications</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transmission *
                      </label>
                      <select
                        name="specifications.transmission"
                        value={formData.specifications.transmission}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="manuelle">Manuelle</option>
                        <option value="automatique">Automatique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Carburant *
                      </label>
                      <select
                        name="specifications.fuel"
                        value={formData.specifications.fuel}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="essence">Essence</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybride">Hybride</option>
                        <option value="electrique">Électrique</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de places *
                      </label>
                      <input
                        type="number"
                        name="specifications.seats"
                        value={formData.specifications.seats || ''}
                        onChange={handleInputChange}
                        required
                        min={2}
                        max={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de portes *
                      </label>
                      <input
                        type="number"
                        name="specifications.doors"
                        value={formData.specifications.doors || ''}
                        onChange={handleInputChange}
                        required
                        min={2}
                        max={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Équipements
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(formData.specifications.features).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name={`specifications.features.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            {key === 'airConditioning' && 'Climatisation'}
                            {key === 'gps' && 'GPS'}
                            {key === 'bluetooth' && 'Bluetooth'}
                            {key === 'camera' && 'Caméra de recul'}
                            {key === 'sunroof' && 'Toit ouvrant'}
                            {key === 'leatherSeats' && 'Sièges en cuir'}
                            {key === 'cruiseControl' && 'Régulateur de vitesse'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Tarification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Section Tarification */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Tarification</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Système de réductions dégressives :</span> Les clients bénéficient automatiquement de réductions jusqu'à 30% selon la durée de location.
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Seul le prix journalier est obligatoire. Les prix hebdomadaire et mensuel sont calculés automatiquement si non fournis.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix journalier (FCFA) * <span className="text-red-500 text-xs">Obligatoire</span>
                        </label>
                        <input
                          type="number"
                          name="pricing.daily"
                          value={formData.pricing.daily || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          placeholder="Ex: 50000"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Prix de base par jour de location</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix hebdomadaire (FCFA)
                        </label>
                        <input
                          type="number"
                          name="pricing.weekly"
                          value={formData.pricing.weekly || ''}
                          onChange={handleInputChange}
                          min={0}
                          placeholder="Auto: -10% sur 7 jours"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Laissez vide pour calcul automatique</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix mensuel (FCFA)
                        </label>
                        <input
                          type="number"
                          name="pricing.monthly"
                          value={formData.pricing.monthly || ''}
                          onChange={handleInputChange}
                          min={0}
                          placeholder="Auto: -30% sur 30 jours"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Laissez vide pour calcul automatique</p>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplément chauffeur par jour (FCFA)
                        </label>
                        <input
                          type="number"
                          name="pricing.chauffeurSupplement"
                          value={formData.pricing.chauffeurSupplement || ''}
                          onChange={handleInputChange}
                          min={0}
                          placeholder="Ex: 15000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Prix journalier si le client demande un chauffeur (par défaut: 15 000 FCFA)</p>
                      </div>
                    </div>
                  </div>

                  {/* Section Disponibilité */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Disponibilité</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Statut du véhicule *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, status: 'disponible' } }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.availability.status === 'disponible'
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              formData.availability.status === 'disponible' ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className={`text-sm font-semibold ${
                              formData.availability.status === 'disponible' ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              Disponible
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, status: 'loue' } }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.availability.status === 'loue'
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              formData.availability.status === 'loue' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}>
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <span className={`text-sm font-semibold ${
                              formData.availability.status === 'loue' ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              Loué
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, status: 'maintenance' } }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.availability.status === 'maintenance'
                              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                              : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              formData.availability.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-300'
                            }`}>
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className={`text-sm font-semibold ${
                              formData.availability.status === 'maintenance' ? 'text-amber-700' : 'text-gray-600'
                            }`}>
                              Maintenance
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, availability: { ...prev.availability, status: 'hors-service' } }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.availability.status === 'hors-service'
                              ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              formData.availability.status === 'hors-service' ? 'bg-red-500' : 'bg-gray-300'
                            }`}>
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </div>
                            <span className={`text-sm font-semibold ${
                              formData.availability.status === 'hors-service' ? 'text-red-700' : 'text-gray-600'
                            }`}>
                              Hors service
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Villes disponibles *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {cities.map((city) => (
                          <label key={city} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.availability.cities.includes(city)}
                              onChange={() => handleCityToggle(city)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{city}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="chauffeurAvailable"
                          checked={formData.chauffeurAvailable}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Chauffeur disponible</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Véhicule vedette</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Images et récapitulatif */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Récapitulatif complet */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Récapitulatif du véhicule
                    </h4>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
                      {/* Informations principales */}
                      <div className="pb-4 border-b border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Véhicule</p>
                        <p className="font-bold text-gray-900 text-xl">
                          {formData.brand} {formData.model} <span className="text-gray-600">({formData.year})</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Immatriculation: {formData.registration || 'Non renseignée'}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-primary-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Catégorie</p>
                          <p className="font-semibold text-gray-900 capitalize">{formData.category}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Prix journalier</p>
                          <p className="font-bold text-green-700 text-lg">
                            {formData.pricing.daily?.toLocaleString() || '0'} FCFA
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Prix hebdo.</p>
                          <p className="font-bold text-blue-700">
                            {formData.pricing.weekly?.toLocaleString() || 'Auto'} FCFA
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Prix mensuel</p>
                          <p className="font-bold text-purple-700">
                            {formData.pricing.monthly?.toLocaleString() || 'Auto'} FCFA
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Chauffeur</p>
                          <p className="font-semibold text-gray-900">
                            {formData.chauffeurAvailable ? (
                              <span className="text-green-700">✓ +{formData.pricing.chauffeurSupplement?.toLocaleString()} FCFA/j</span>
                            ) : (
                              <span className="text-gray-500">✗ Non disponible</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 mb-1">Villes</p>
                          <p className="font-semibold text-gray-900 text-xs">
                            {formData.availability.cities.length > 0 
                              ? formData.availability.cities.join(', ')
                              : 'Aucune'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Spécifications */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Spécifications</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-600">Places</p>
                              <p className="font-semibold text-gray-900">{formData.specifications.seats}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-600">Portes</p>
                              <p className="font-semibold text-gray-900">{formData.specifications.doors}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-600">Trans.</p>
                              <p className="font-semibold text-gray-900 capitalize">{formData.specifications.transmission}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-600">Carburant</p>
                              <p className="font-semibold text-gray-900 capitalize">{formData.specifications.fuel}</p>
                            </div>
                          </div>
                          {formData.specifications.color && (
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/>
                              </svg>
                              <div>
                                <p className="text-xs text-gray-600">Couleur</p>
                                <p className="font-semibold text-gray-900 capitalize">{formData.specifications.color}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Équipements */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Équipements inclus</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.specifications.features.airConditioning && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">❄️ Climatisation</span>
                          )}
                          {formData.specifications.features.gps && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">🧭 GPS</span>
                          )}
                          {formData.specifications.features.bluetooth && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">📡 Bluetooth</span>
                          )}
                          {formData.specifications.features.camera && (
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">📷 Caméra</span>
                          )}
                          {formData.specifications.features.sunroof && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">☀️ Toit ouvrant</span>
                          )}
                          {formData.specifications.features.leatherSeats && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">🪑 Sièges cuir</span>
                          )}
                          {formData.specifications.features.cruiseControl && (
                            <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">🎛️ Régulateur</span>
                          )}
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-xs text-gray-600">Disponibilité</p>
                          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
                            formData.availability.status === 'disponible' ? 'bg-green-100 text-green-800' :
                            formData.availability.status === 'loue' ? 'bg-blue-100 text-blue-800' :
                            formData.availability.status === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formData.availability.status === 'disponible' && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {formData.availability.status === 'loue' && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                            {formData.availability.status === 'maintenance' && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              </svg>
                            )}
                            {formData.availability.status === 'hors-service' && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            )}
                            <span className="capitalize">
                              {formData.availability.status === 'hors-service' ? 'Hors service' : 
                               formData.availability.status === 'loue' ? 'Loué' :
                               formData.availability.status}
                            </span>
                          </span>
                        </div>
                        {formData.isFeatured && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                            Véhicule en vedette
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium">
                        ℹ️ Vérifiez attentivement toutes les informations avant de cliquer sur "Créer le véhicule"
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Images du véhicule *
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        ({existingImages.length + newImages.length}/10)
                      </span>
                    </h4>
                  
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="vehicle-images"
                        disabled={existingImages.length + newImages.length >= 10}
                      />
                      <label
                        htmlFor="vehicle-images"
                        className={`cursor-pointer flex flex-col items-center justify-center hover:text-primary-600 transition-colors ${
                          existingImages.length + newImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-1 font-medium">
                          {existingImages.length + newImages.length > 0 ? 'Ajouter plus d\'images' : 'Cliquez pour ajouter des images'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {existingImages.length + newImages.length > 0 
                            ? `Vous pouvez ajouter ${10 - existingImages.length - newImages.length} image(s) supplémentaire(s)`
                            : 'Maximum 10 images (JPEG, PNG, GIF, WEBP - 5MB max)'
                          }
                        </p>
                      </label>
                    </div>

                    {!vehicleToEdit && existingImages.length === 0 && newImages.length === 0 && (
                      <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-3">
                        <p className="text-sm text-amber-800 font-medium text-center">
                          Au moins une image est requise pour créer le véhicule
                        </p>
                      </div>
                    )}

                    {/* Images existantes (du serveur) */}
                    {existingImages.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Serveur</span>
                          Images existantes ({existingImages.length})
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          {existingImages.map((image, index) => (
                            <div key={image._id} className="relative group">
                              <img
                                src={image.url}
                                alt={`Image existante ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow-sm border-2 border-blue-300"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleRemoveExistingImage(e, image._id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                title="Supprimer du serveur"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {image.isPrimary && (
                                <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded font-medium shadow">
                                  Principale
                                </span>
                              )}
                              {index === 0 && !image.isPrimary && (
                                <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium shadow">
                                  Image {index + 1}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nouvelles images (locales) */}
                    {newImages.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Local</span>
                          Nouvelles images à uploader ({newImages.length})
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          {newImagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Nouvelle image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg shadow-sm border-2 border-green-300"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleRemoveNewImage(e, index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                title="Retirer (non uploadée)"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-medium shadow">
                                Nouveau {index + 1}
                              </span>
                              {existingImages.length === 0 && index === 0 && (
                                <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded font-medium shadow">
                                  #1
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Précédent
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    Suivant
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || (!vehicleToEdit && (existingImages.length + newImages.length) === 0)}
                    className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : vehicleToEdit ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Mettre à jour le véhicule
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Créer le véhicule
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
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
  );
};

export default VehicleFormModal;
