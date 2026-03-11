import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';


const ResetPassword = () => {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/auth/reset-password/${resetToken}`, {
        password: formData.password,
      });
      
      setSuccess(true);
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Le lien est invalide ou expiré. Veuillez demander un nouveau lien.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
          <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-dark mb-4">
            Mot de passe réinitialisé !
          </h2>
          <p className="text-gray-600 mb-6">
            Votre mot de passe a été modifié avec succès.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers la page de connexion...
          </p>
        </div>
      </div>
    );
  }
if (!resetToken) {
  return <Navigate to="/forgot-password" replace />;
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-dark">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-gray-600">
            Choisissez un mot de passe sécurisé
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Nouveau mot de passe */}
          <div>
            <label htmlFor="password" className="form-label">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input pr-10"
                placeholder="Min. 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input pr-10"
                placeholder="Retapez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Exigences mot de passe */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Votre mot de passe doit contenir :
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                • Au moins 8 caractères
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                • Une lettre majuscule
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                • Une lettre minuscule
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                • Un chiffre
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <div className="spinner mr-2"></div>
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>

        {/* Lien retour */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-primary hover:text-primary-600 font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
