import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      <div className="container">
        {/* Top Section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 tablet:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">
                <span className="text-primary">DCM</span> groupe agence
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme n°1 de location de véhicules en Côte d'Ivoire. 
              Avec ou sans chauffeur, partout en Côte d'Ivoire.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/vehicles" className="text-gray-400 hover:text-primary transition-colors">
                  Location avec chauffeur
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-gray-400 hover:text-primary transition-colors">
                  Location sans chauffeur
                </Link>
              </li>
              <li>
                <Link to="/airport-transfer" className="text-gray-400 hover:text-primary transition-colors">
                  Transfert aéroport
                </Link>
              </li>
              <li>
                <Link to="/vehicles?duration=longue" className="text-gray-400 hover:text-primary transition-colors">
                  Location longue durée
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens Utiles */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Liens Utiles</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-gray-400 hover:text-primary transition-colors">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Grand Bassam, Cafop 1 Irma<br />
                  Nouveau Goudron, Côte d'Ivoire
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+2250759627603" className="text-gray-400 hover:text-primary transition-colors">
                  +225 07 59 62 76 03
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:contact@ivoiredrive.ci" className="text-gray-400 hover:text-primary transition-colors">
                  contact@ivoiredrive.ci
                </a>
              </li>
            </ul>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/2250759627603"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-btn hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dark-600 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center">
            <p className="text-gray-400 text-sm text-center">
              © {currentYear} DCM groupe agence. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
