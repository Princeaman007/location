import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Car, Menu, X, User, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Véhicules', href: '/vehicles' },
    { name: 'Transfert Aéroport', href: '/airport-transfer' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold text-dark">
              <span className="text-primary">DCM</span> groupe agence
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden tablet:flex items-center space-x-8">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-dark-600 hover:text-primary'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden tablet:flex items-center space-x-4">
            <a
              href="tel:+2250759627603"
              className="flex items-center space-x-2 text-dark-600 hover:text-primary transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="font-medium">+225 07 59 62 76 03</span>
            </a>

            {isAuthenticated ? (
              <Link
                to={
                  user?.role === 'admin' 
                    ? '/admin/dashboard' 
                    : user?.role === 'chauffeur' 
                    ? '/chauffeur/dashboard' 
                    : '/dashboard'
                }
                className="flex items-center space-x-2 btn btn-primary"
              >
                <User className="w-5 h-5" />
                <span>{user?.prenom || user?.firstName || 'Mon Compte'}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="tablet:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu Mobile Déroulant */}
        {isMenuOpen && (
          <div className="tablet:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => 
                    `font-medium transition-colors py-2 ${
                      isActive ? 'text-primary' : 'text-dark-600 hover:text-primary'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              
              <div className="pt-4 border-t space-y-3">
                <a
                  href="tel:+2250759627603"
                  className="flex items-center space-x-2 text-dark-600 py-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>+225 07 59 62 76 03</span>
                </a>
                
                {isAuthenticated ? (
                  <Link
                    to={
                      user?.role === 'admin' 
                        ? '/admin/dashboard' 
                        : user?.role === 'chauffeur' 
                        ? '/chauffeur/dashboard' 
                        : '/dashboard'
                    }
                    className="btn btn-primary w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon Compte
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-outline w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
