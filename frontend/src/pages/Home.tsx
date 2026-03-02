import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Shield, Clock, MapPin, Plane, CheckCircle, ArrowRight, CreditCard, Star, Phone, Lock } from 'lucide-react';
import Hero from '@/components/Hero';
import api from '@/services/api';
import type { Vehicle } from '@/types/vehicle';

const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      const response = await api.get('/vehicles', { 
        params: { limit: 3, sort: '-createdAt' } 
      });
      setFeaturedVehicles(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper pour obtenir l'URL de l'image principale
  const getVehicleImage = (vehicle: Vehicle): string => {
    if (!vehicle.images || vehicle.images.length === 0) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EVéhicule%3C/text%3E%3C/svg%3E';
    }
    
    // Trouver l'image principale ou prendre la première
    const primaryImage = vehicle.images.find(img => 
      typeof img === 'object' && img.isPrimary
    );
    
    if (primaryImage && typeof primaryImage === 'object') {
      return primaryImage.url;
    }
    
    // Sinon, prendre la première image
    const firstImage = vehicle.images[0];
    return typeof firstImage === 'string' ? firstImage : firstImage.url;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />

        {/* Statistiques Section */}
        <section className="section bg-white -mt-16 relative z-10">
          <div className="container">
            <div className="card p-8 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { number: '500+', label: 'Véhicules', icon: Car },
                  { number: '10000+', label: 'Clients satisfaits', icon: Users },
                  { number: '24/7', label: 'Support disponible', icon: Clock },
                  { number: '100%', label: 'Sécurisé', icon: Shield },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <stat.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                    <div className="text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="section bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-h2 font-heading font-bold mb-4">
                Nos Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Une gamme complète de services pour répondre à tous vos besoins de mobilité en Côte d'Ivoire
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Location avec chauffeur',
                  description: 'Chauffeurs professionnels expérimentés disponibles 24/7 pour tous vos déplacements professionnels ou personnels',
                  icon: Users,
                  link: '/vehicles?withDriver=true',
                  color: 'text-primary',
                },
                {
                  title: 'Location sans chauffeur',
                  description: 'Conduisez vous-même en toute liberté. Large choix de véhicules récents et bien entretenus',
                  icon: Car,
                  link: '/vehicles',
                  color: 'text-secondary',
                },
                {
                  title: 'Transfert aéroport',
                  description: 'Service premium d\'accueil et de transfert depuis l\'aéroport FHB vers votre destination',
                  icon: Plane,
                  link: '/airport-transfer',
                  color: 'text-accent',
                },
              ].map((service, index) => (
                <Link
                  key={index}
                  to={service.link}
                  className="card card-hover p-8 text-center group"
                >
                  <service.icon className={`w-16 h-16 mx-auto mb-4 ${service.color} group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-xl font-heading font-semibold mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <span className="inline-flex items-center text-primary font-medium">
                    En savoir plus <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-h2 font-heading font-bold mb-4">
                Pourquoi choisir DCM Groupe Agence ?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nous mettons tout en œuvre pour vous offrir la meilleure expérience de location
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: CreditCard,
                  title: 'Paiement flexible',
                  description: 'Paiement en ligne sécurisé ou à la livraison selon votre convenance',
                },
                {
                  icon: Star,
                  title: 'Véhicules récents',
                  description: 'Flotte moderne et bien entretenue avec révisions régulières',
                },
                {
                  icon: Phone,
                  title: 'Support 24/7',
                  description: 'Équipe disponible à tout moment pour vous assister',
                },
                {
                  icon: Lock,
                  title: 'Réservation sécurisée',
                  description: 'Système de réservation fiable et données protégées',
                },
              ].map((advantage, index) => {
                const IconComponent = advantage.icon;
                return (
                  <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-center mb-4">
                      <IconComponent className="w-16 h-16 text-primary-600" />
                    </div>
                    <h4 className="font-heading font-semibold text-lg mb-3">
                      {advantage.title}
                    </h4>
                    <p className="text-sm text-gray-600">{advantage.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Véhicules populaires */}
        <section className="section bg-gray-50">
          <div className="container">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-h2 font-heading font-bold mb-2">
                  Véhicules populaires
                </h2>
                <p className="text-gray-600">
                  Découvrez notre sélection de véhicules les plus demandés
                </p>
              </div>
              <Link 
                to="/vehicles"
                className="btn btn-outline hidden md:inline-flex"
              >
                Voir tout le catalogue
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {featuredVehicles.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun véhicule disponible pour le moment
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Nos véhicules seront bientôt disponibles. Revenez plus tard ou contactez-nous.
                    </p>
                    <Link to="/vehicles" className="btn btn-primary">
                      Voir le catalogue complet
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredVehicles.map((vehicle) => (
                    <Link
                      key={vehicle._id}
                      to={`/vehicles/${vehicle._id}`}
                      className="card card-hover group"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={getVehicleImage(vehicle)}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EVéhicule%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {vehicle.chauffeurAvailable && (
                          <span className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm shadow-lg">
                            Avec chauffeur
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading font-semibold text-xl mb-2">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          {vehicle.availability?.cities?.join(', ') || 'Disponible'}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              {vehicle.pricing?.daily?.toLocaleString()} FCFA
                            </span>
                            <span className="text-sm text-gray-600">/jour</span>
                          </div>
                          <span className="text-primary font-medium flex items-center">
                            Réserver <ArrowRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-8 md:hidden">
                  <Link to="/vehicles" className="btn btn-primary">
                    Voir tout le catalogue
                  </Link>
                </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-h2 font-heading font-bold mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Réservez votre véhicule en 3 étapes simples
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '1',
                  title: 'Choisissez votre véhicule',
                  description: 'Parcourez notre catalogue et sélectionnez le véhicule qui correspond à vos besoins',
                  icon: Car,
                },
                {
                  step: '2',
                  title: 'Réservez en ligne',
                  description: 'Remplissez le formulaire de réservation avec vos dates et informations',
                  icon: CheckCircle,
                },
                {
                  step: '3',
                  title: 'Récupérez votre véhicule',
                  description: 'Récupérez votre véhicule à l\'adresse convenue ou livraison possible',
                  icon: MapPin,
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-secondary z-0"></div>
                  )}
                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <step.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h4 className="font-heading font-semibold text-xl mb-3">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-gradient-to-br from-primary to-secondary text-white">
          <div className="container text-center">
            <h2 className="text-h2 font-heading font-bold mb-4">
              Prêt à partir ?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Réservez votre véhicule dès maintenant et profitez de nos meilleurs tarifs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vehicles" className="btn bg-white text-primary hover:bg-gray-100">
                <Car className="w-5 h-5 mr-2" />
                Voir tous les véhicules
              </Link>
              <Link to="/airport-transfer" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary">
                <Plane className="w-5 h-5 mr-2" />
                Réserver un transfert
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

