import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendVerification = async () => {
    if (!formData.email) return;
    setResendLoading(true);
    setResendMessage('');
    try {
      await authService.resendVerification(formData.email);
      setResendMessage('Email de vérification renvoyé ! Vérifiez votre boîte mail.');
    } catch {
      setResendMessage("Erreur lors de l'envoi. Réessayez plus tard.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEmailNotVerified(false);
    setResendMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email: formData.email, password: formData.password });
      setAuth(response.user, response.token);
      
      // Redirection selon le rôle
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'chauffeur') {
        navigate('/chauffeur/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response?.data?.emailNotVerified) {
        setEmailNotVerified(true);
        setError('');
      } else {
        setEmailNotVerified(false);
        setError(err.response?.data?.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary-600">DCM groupe agence</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {emailNotVerified && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-4 rounded-lg text-sm space-y-2">
              <p className="font-semibold">📧 Email non vérifié</p>
              <p>Vous devez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte de réception (et vos spams).</p>
              {resendMessage ? (
                <p className="text-green-700 font-medium">{resendMessage}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-1 text-primary-600 hover:text-primary-700 font-medium underline disabled:opacity-50"
                >
                  {resendLoading ? 'Envoi en cours...' : "Renvoyer l'email de vérification"}
                </button>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Inscription */}
        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
