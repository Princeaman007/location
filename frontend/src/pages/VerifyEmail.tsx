import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.post(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Votre email a été vérifié avec succès !');
        
        // Redirection après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Le lien de vérification est invalide ou a expiré.'
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">
              Vérification en cours...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">
              Email vérifié !
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-dark mb-4">
              Erreur de vérification
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/register" className="btn btn-primary w-full">
                Créer un nouveau compte
              </Link>
              <Link to="/login" className="btn btn-ghost w-full">
                Se connecter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
