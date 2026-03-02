import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle, Mail, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-h1 font-heading font-bold mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl opacity-90">
              Protection et traitement de vos données personnelles
            </p>
            <p className="mt-4 opacity-75">
              Dernière mise à jour : 2 Mars 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Notice */}
            <div className="card p-6 mb-8 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Votre vie privée est importante pour nous
                  </h3>
                  <p className="text-sm text-blue-800">
                    DCM Groupe Agence s'engage à protéger et respecter votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles conformément à la législation ivoirienne en vigueur.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Nav */}
            <div className="card p-6 mb-8">
              <h3 className="font-heading font-bold text-lg mb-4">Accès rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: Database, text: 'Données collectées', href: '#collecte' },
                  { icon: Eye, text: 'Utilisation des données', href: '#utilisation' },
                  { icon: Lock, text: 'Sécurité', href: '#securite' },
                  { icon: UserCheck, text: 'Vos droits', href: '#droits' },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-primary mr-3" />
                    <span className="font-medium">{item.text}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div id="introduction" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <Shield className="w-8 h-8 mr-3" />
                  1. Introduction
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    DCM Groupe Agence (ci-après "nous", "notre" ou "DCM") est une société de location de véhicules opérant en Côte d'Ivoire. Nous sommes engagés à protéger et respecter votre vie privée.
                  </p>
                  <p>
                    Cette politique de confidentialité explique :
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Quelles données personnelles nous collectons</li>
                    <li>Comment nous utilisons ces données</li>
                    <li>Avec qui nous les partageons</li>
                    <li>Comment nous les protégeons</li>
                    <li>Vos droits concernant vos données</li>
                  </ul>
                  <p>
                    En utilisant nos services, vous acceptez les pratiques décrites dans cette politique.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div id="collecte" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <Database className="w-8 h-8 mr-3" />
                  2. Données que Nous Collectons
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <h3 className="font-semibold text-lg">2.1 Données Fournies Directement</h3>
                  <p>Lorsque vous utilisez nos services, vous nous fournissez :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Informations d'identification :</strong> Nom, prénom, date de naissance, photo</li>
                    <li><strong>Coordonnées :</strong> Adresse email, numéro de téléphone, adresse postale</li>
                    <li><strong>Documents :</strong> Copie de la pièce d'identité, permis de conduire, justificatif de domicile</li>
                    <li><strong>Informations de paiement :</strong> Données de carte bancaire, coordonnées Mobile Money</li>
                    <li><strong>Préférences :</strong> Choix de véhicule, options de location, historique de réservations</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.2 Données Collectées Automatiquement</h3>
                  <p>Lors de votre navigation sur notre site, nous collectons :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation</li>
                    <li><strong>Données de navigation :</strong> Pages visitées, durée de visite, liens cliqués</li>
                    <li><strong>Cookies :</strong> Identifiants de session, préférences utilisateur</li>
                    <li><strong>Données de localisation :</strong> Ville, région (avec votre consentement)</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.3 Données de Tiers</h3>
                  <p>Nous pouvons recevoir des informations depuis :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Plateformes de paiement (confirmation de transaction)</li>
                    <li>Réseaux sociaux (si vous vous connectez via ces services)</li>
                    <li>Partenaires commerciaux (aéroports, hôtels)</li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div id="utilisation" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <Eye className="w-8 h-8 mr-3" />
                  3. Utilisation de Vos Données
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>Nous utilisons vos données personnelles pour :</p>
                  
                  <h3 className="font-semibold text-lg mt-4">3.1 Gestion des Services</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Traiter vos réservations et gérer vos locations</li>
                    <li>Vérifier votre identité et votre éligibilité à la location</li>
                    <li>Gérer les paiements et la facturation</li>
                    <li>Vous fournir une assistance client</li>
                    <li>Gérer les réclamations et litiges</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.2 Communication</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Envoyer des confirmations de réservation</li>
                    <li>Vous informer de l'état de votre location</li>
                    <li>Répondre à vos questions et demandes</li>
                    <li>Vous envoyer des notifications importantes</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.3 Marketing (avec votre consentement)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Vous informer de nos offres spéciales et promotions</li>
                    <li>Vous envoyer notre newsletter</li>
                    <li>Personnaliser votre expérience sur notre site</li>
                  </ul>
                  <p className="text-sm italic mt-2">
                    Vous pouvez vous désinscrire à tout moment en cliquant sur le lien présent dans chaque email.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">3.4 Amélioration de Nos Services</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Analyser l'utilisation de notre site et nos services</li>
                    <li>Améliorer l'expérience utilisateur</li>
                    <li>Développer de nouvelles fonctionnalités</li>
                    <li>Effectuer des recherches et analyses statistiques</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.5 Obligations Légales</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Respecter nos obligations légales et réglementaires</li>
                    <li>Prévenir la fraude et garantir la sécurité</li>
                    <li>Coopérer avec les autorités judiciaires si nécessaire</li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div id="partage" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  4. Partage de Vos Données
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :</p>
                  
                  <h3 className="font-semibold text-lg mt-4">4.1 Prestataires de Services</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Plateformes de paiement (traitement des transactions)</li>
                    <li>Services d'hébergement et cloud</li>
                    <li>Services de messagerie et communication</li>
                    <li>Outils d'analyse et de statistiques</li>
                  </ul>
                  <p className="text-sm italic">
                    Ces prestataires sont contractuellement tenus de protéger vos données et de les utiliser uniquement pour les finalités spécifiées.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">4.2 Partenaires Commerciaux</h3>
                  <p>Avec votre consentement explicite, nous pouvons partager vos données avec :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Compagnies d'assurance (en cas d'accident ou sinistre)</li>
                    <li>Partenaires hôteliers et aéroportuaires</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.3 Autorités Légales</h3>
                  <p>
                    Nous pouvons divulguer vos données si la loi l'exige, en réponse à une procédure judiciaire, ou pour protéger nos droits, notre propriété ou la sécurité de nos utilisateurs.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div id="securite" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <Lock className="w-8 h-8 mr-3" />
                  5. Sécurité de Vos Données
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Nous prenons la sécurité de vos données très au sérieux et mettons en œuvre des mesures techniques et organisationnelles appropriées :
                  </p>
                  
                  <h3 className="font-semibold text-lg mt-4">Mesures Techniques</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Chiffrement SSL/TLS pour toutes les transmissions de données</li>
                    <li>Stockage sécurisé avec cryptage des données sensibles</li>
                    <li>Pare-feu et systèmes de détection d'intrusion</li>
                    <li>Sauvegardes régulières et plans de récupération</li>
                    <li>Tests de sécurité et audits réguliers</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">Mesures Organisationnelles</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accès limité aux données personnelles (principe du besoin d'en connaître)</li>
                    <li>Formation régulière de nos employés à la protection des données</li>
                    <li>Politiques internes strictes de confidentialité</li>
                    <li>Procédures de gestion des incidents de sécurité</li>
                  </ul>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Important :</strong> Bien que nous mettions tout en œuvre pour protéger vos données, aucune transmission sur Internet n'est totalement sécurisée. Nous vous recommandons de prendre vos propres mesures de sécurité (mot de passe fort, déconnexion après usage, etc.).
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div id="conservation" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  6. Conservation de Vos Données
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Données de compte actif :</strong> Pendant toute la durée de votre compte + 3 ans après la dernière activité</li>
                    <li><strong>Historique de location :</strong> 5 ans (obligations comptables et fiscales)</li>
                    <li><strong>Documents d'identité :</strong> Durée légale de conservation + 6 mois</li>
                    <li><strong>Données de paiement :</strong> 13 mois pour détecter la fraude</li>
                    <li><strong>Cookies :</strong> 13 mois maximum</li>
                  </ul>

                  <p className="mt-4">
                    À l'expiration de ces délais, vos données sont supprimées de manière sécurisée ou anonymisées à des fins statistiques.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div id="droits" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <UserCheck className="w-8 h-8 mr-3" />
                  7. Vos Droits
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Conformément à la législation applicable, vous disposez des droits suivants :
                  </p>
                  
                  <h3 className="font-semibold text-lg mt-4">7.1 Droit d'Accès</h3>
                  <p>
                    Vous pouvez demander une copie de toutes les données personnelles que nous détenons à votre sujet.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.2 Droit de Rectification</h3>
                  <p>
                    Vous pouvez demander la correction de données inexactes ou incomplètes.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.3 Droit à l'Effacement</h3>
                  <p>
                    Vous pouvez demander la suppression de vos données dans certaines circonstances (sauf obligations légales de conservation).
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.4 Droit d'Opposition</h3>
                  <p>
                    Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct à tout moment.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.5 Droit à la Portabilité</h3>
                  <p>
                    Vous pouvez demander à recevoir vos données dans un format structuré et couramment utilisé.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.6 Droit de Limitation</h3>
                  <p>
                    Vous pouvez demander la limitation du traitement de vos données dans certaines situations.
                  </p>

                  <div className="bg-primary/5 border-l-4 border-primary p-4 mt-6">
                    <h4 className="font-semibold mb-2">Comment exercer vos droits ?</h4>
                    <p className="text-sm">
                      Pour exercer l'un de ces droits, contactez-nous par email à <strong>privacy@dcmgroupe.ci</strong> ou par courrier à notre siège social. Nous répondrons à votre demande dans un délai maximum de 30 jours.
                    </p>
                    <p className="text-sm mt-2">
                      Une pièce d'identité pourra vous être demandée pour vérifier votre identité.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 8 */}
              <div id="cookies" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  8. Cookies et Technologies Similaires
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Notre site utilise des cookies pour améliorer votre expérience. Un cookie est un petit fichier texte stocké sur votre appareil.
                  </p>
                  
                  <h3 className="font-semibold text-lg mt-4">Types de Cookies Utilisés</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (connexion, panier)</li>
                    <li><strong>Cookies de performance :</strong> Analysent l'utilisation du site pour l'améliorer</li>
                    <li><strong>Cookies de personnalisation :</strong> Mémorisent vos préférences</li>
                    <li><strong>Cookies publicitaires :</strong> Affichent des publicités pertinentes (avec consentement)</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">Gestion des Cookies</h3>
                  <p>
                    Vous pouvez accepter, refuser ou gérer les cookies via le bandeau de consentement ou les paramètres de votre navigateur. Le refus de certains cookies peut limiter certaines fonctionnalités du site.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div id="modifications" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  9. Modifications de Cette Politique
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Toute modification sera publiée sur cette page avec une nouvelle "date de mise à jour".
                  </p>
                  <p>
                    Pour les modifications importantes, nous vous en informerons par email ou via une notification sur notre site.
                  </p>
                  <p>
                    Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques de protection des données.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div id="contact" className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary flex items-center">
                  <Mail className="w-8 h-8 mr-3" />
                  10. Nous Contacter
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, vous pouvez nous contacter :
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <h4 className="font-semibold mb-4">Délégué à la Protection des Données (DPO)</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Mail className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <strong>Email :</strong><br />
                          privacy@dcmgroupe.ci
                        </div>
                      </li>
                      <li className="flex items-start">
                        <FileText className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <strong>Courrier :</strong><br />
                          DCM Groupe Agence<br />
                          Service Protection des Données<br />
                          Grand Bassam, Cafop 1 Irma - Nouveau Goudron<br />
                          Côte d'Ivoire
                        </div>
                      </li>
                    </ul>
                  </div>

                  <p className="mt-6">
                    Nous nous engageons à répondre à toutes vos demandes dans les meilleurs délais et, en tout état de cause, dans le délai légal de 30 jours.
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="card p-8 mt-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-heading font-bold text-xl mb-3">
                  Votre confiance est notre priorité
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée. Pour toute question, n'hésitez pas à nous contacter.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contact" className="btn btn-primary">
                    Nous contacter
                  </a>
                  <a href="/terms-conditions" className="btn btn-outline">
                    Voir les conditions générales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
