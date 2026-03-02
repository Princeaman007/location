import React from 'react';
import { Car, Users, Award, Shield, Clock, MapPin, Heart, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-h1 font-heading font-bold mb-6">
              À propos de DCM Groupe Agence
            </h1>
            <p className="text-xl opacity-90">
              Votre partenaire de confiance pour la location de véhicules en Côte d'Ivoire depuis plus de 10 ans
            </p>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h2 font-heading font-bold mb-6">
                Notre Histoire
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Fondée en 2014, <strong>DCM Groupe Agence</strong> est née de la passion pour la mobilité et le service client d'excellence. Notre mission a toujours été de faciliter vos déplacements en Côte d'Ivoire avec des solutions de location adaptées à tous vos besoins.
                </p>
                <p>
                  Au fil des années, nous avons bâti notre réputation sur la qualité de notre flotte, la fiabilité de nos services et la satisfaction de nos clients. Aujourd'hui, nous sommes fiers de compter parmi les leaders de la location de véhicules en Côte d'Ivoire.
                </p>
                <p>
                  Avec plus de <strong>10 000 clients satisfaits</strong> et une flotte de plus de <strong>500 véhicules</strong>, nous continuons d'innover pour vous offrir la meilleure expérience de location possible.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <Car className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-gray-600">Véhicules</div>
              </div>
              <div className="card p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
              <div className="card p-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-gray-600">Années d'expérience</div>
              </div>
              <div className="card p-6 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-sm text-gray-600">Villes couvertes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <Target className="w-16 h-16 text-primary mb-6" />
              <h3 className="text-2xl font-heading font-bold mb-4">Notre Mission</h3>
              <p className="text-gray-700">
                Fournir des solutions de mobilité fiables, accessibles et de qualité supérieure à tous nos clients en Côte d'Ivoire. Nous nous engageons à rendre chaque trajet confortable, sécurisé et sans souci.
              </p>
            </div>
            <div className="card p-8">
              <Heart className="w-16 h-16 text-secondary mb-6" />
              <h3 className="text-2xl font-heading font-bold mb-4">Nos Valeurs</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Excellence :</strong> Qualité de service irréprochable</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Fiabilité :</strong> Des véhicules entretenus et disponibles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Transparence :</strong> Prix clairs, sans surprise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span><strong>Proximité :</strong> Support client 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Services */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold mb-4">
              Nos Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de solutions pour tous vos besoins de mobilité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <Car className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">
                Location courte et longue durée
              </h3>
              <p className="text-gray-600">
                Que ce soit pour quelques jours ou plusieurs mois, nous avons la solution adaptée à vos besoins avec des tarifs dégressifs.
              </p>
            </div>

            <div className="card p-6">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">
                Location avec chauffeur
              </h3>
              <p className="text-gray-600">
                Chauffeurs professionnels, expérimentés et courtois pour vous conduire en toute sécurité partout en Côte d'Ivoire.
              </p>
            </div>

            <div className="card p-6">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-3">
                Assurance tous risques
              </h3>
              <p className="text-gray-600">
                Tous nos véhicules sont couverts par une assurance complète pour votre tranquillité d'esprit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold mb-4">
              Pourquoi nous choisir ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Sécurité garantie',
                description: 'Véhicules régulièrement entretenus et contrôlés',
              },
              {
                icon: Clock,
                title: 'Disponibilité 24/7',
                description: 'Service client disponible à tout moment',
              },
              {
                icon: Award,
                title: 'Meilleurs tarifs',
                description: 'Prix compétitifs et offres spéciales régulières',
              },
              {
                icon: MapPin,
                title: 'Partout en CI',
                description: 'Service disponible dans toutes les grandes villes',
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                <item.icon className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h4 className="font-heading font-semibold text-lg mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container text-center">
          <h2 className="text-h2 font-heading font-bold mb-6">
            Prêt à démarrer votre voyage ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Réservez dès maintenant et profitez de notre service de qualité supérieure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/vehicles" className="btn bg-white text-primary hover:bg-gray-100">
              Voir nos véhicules
            </a>
            <a href="/contact" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary">
              Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
