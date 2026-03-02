import React from 'react';
import { FileText, AlertCircle, Scale } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Scale className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-h1 font-heading font-bold mb-6">
              Conditions Générales de Location
            </h1>
            <p className="text-xl opacity-90">
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
                    Information importante
                  </h3>
                  <p className="text-sm text-blue-800">
                    En réservant un véhicule auprès de DCM Groupe Agence, vous acceptez les présentes conditions générales de location. Nous vous recommandons de les lire attentivement avant de procéder à votre réservation.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  1. Objet
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Les présentes Conditions Générales de Location (ci-après "CGL") régissent la relation contractuelle entre DCM Groupe Agence, société de location de véhicules immatriculée en Côte d'Ivoire (ci-après "le Loueur"), et toute personne physique ou morale louant un véhicule (ci-après "le Locataire").
                  </p>
                  <p>
                    Ces CGL s'appliquent à toutes les locations de véhicules effectuées par le biais de notre site internet, de notre application mobile, ou directement dans nos agences.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  2. Conditions de Location
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <h3 className="font-semibold text-lg mt-4">2.1 Âge et Permis de Conduire</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Le locataire doit être âgé d'au moins 21 ans et être titulaire d'un permis de conduire valide depuis au moins 2 ans.</li>
                    <li>Pour certaines catégories de véhicules (luxe, 4x4, minibus), l'âge minimum requis est de 25 ans avec 3 ans de permis.</li>
                    <li>Le permis de conduire doit être en cours de validité et correspondre à la catégorie du véhicule loué.</li>
                    <li>Les permis de conduire ivoiriens, CEDEAO et internationaux sont acceptés.</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.2 Documents Requis</h3>
                  <p>Le locataire doit présenter lors de la prise en charge du véhicule :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Une pièce d'identité valide (CNI, passeport ou attestation d'identité)</li>
                    <li>Un permis de conduire valide et correspondant à la catégorie du véhicule</li>
                    <li>Un justificatif de domicile de moins de 3 mois</li>
                    <li>Une preuve de paiement ou la somme due en espèces</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.3 Caution</h3>
                  <p>
                    Une caution est exigée lors de la prise en charge du véhicule. Le montant varie selon la catégorie du véhicule et peut être versée par carte bancaire (avec empreinte) ou en espèces. Cette caution sera restituée dans un délai maximum de 7 jours ouvrables après la restitution du véhicule, sous réserve de l'absence de dommages, d'infractions ou de carburant manquant.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  3. Réservation et Paiement
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <h3 className="font-semibold text-lg">3.1 Réservation</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>La réservation peut être effectuée en ligne, par téléphone ou en agence.</li>
                    <li>La réservation est confirmée dès réception du paiement ou de l'acompte.</li>
                    <li>Nous nous réservons le droit de refuser une réservation sans justification.</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.2 Tarifs</h3>
                  <p>
                    Les tarifs de location sont exprimés en Francs CFA (FCFA) et comprennent :
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>La location du véhicule pour la durée convenue</li>
                    <li>L'assurance responsabilité civile obligatoire</li>
                    <li>L'assistance routière 24/7</li>
                    <li>Les taxes applicables</li>
                  </ul>
                  <p className="mt-4">
                    Ne sont pas inclus : le carburant, les frais de péage, les frais de stationnement, les conducteurs additionnels, et toute prestation supplémentaire non mentionnée.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">3.3 Modes de Paiement</h3>
                  <p>Nous acceptons les paiements par :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Carte bancaire (Visa, Mastercard)</li>
                    <li>Mobile Money (Orange Money, MTN Money, Moov Money)</li>
                    <li>Virement bancaire</li>
                    <li>Espèces (à la livraison uniquement)</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.4 Annulation et Modification</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Plus de 48h avant :</strong> Annulation gratuite, remboursement intégral</li>
                    <li><strong>Entre 24h et 48h :</strong> Retenue de 30% du montant total</li>
                    <li><strong>Moins de 24h :</strong> Retenue de 50% du montant total</li>
                    <li><strong>Non-présentation :</strong> Aucun remboursement</li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  4. Utilisation du Véhicule
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <h3 className="font-semibold text-lg">4.1 Obligations du Locataire</h3>
                  <p>Le locataire s'engage à :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Utiliser le véhicule conformément à sa destination et aux règles du code de la route</li>
                    <li>Maintenir le véhicule en bon état et effectuer les vérifications d'usage (huile, eau, pression des pneus)</li>
                    <li>Ne pas conduire sous l'emprise de l'alcool, de stupéfiants ou de médicaments altérant les capacités</li>
                    <li>Ne pas sous-louer ou prêter le véhicule à un tiers</li>
                    <li>Ne pas utiliser le véhicule pour des activités illégales</li>
                    <li>Verrouiller le véhicule et en conserver les clés en permanence</li>
                    <li>Restituer le véhicule à la date et à l'heure convenues</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.2 Restrictions d'Utilisation</h3>
                  <p>Il est strictement interdit de :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sortir du territoire ivoirien sans autorisation écrite préalable</li>
                    <li>Utiliser le véhicule pour des compétitions ou courses</li>
                    <li>Transporter des matières dangereuses, inflammables ou illégales</li>
                    <li>Transporter plus de passagers que la capacité autorisée</li>
                    <li>Fumer dans le véhicule</li>
                    <li>Transporter des animaux sans protection adaptée</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.3 Carburant</h3>
                  <p>
                    Le véhicule est remis avec le plein de carburant. Le locataire doit restituer le véhicule avec le même niveau de carburant. À défaut, des frais de carburant majorés de 30% seront appliqués.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">4.4 Kilométrage</h3>
                  <p>
                    La location inclut un kilométrage illimité pour les déplacements en zone urbaine. Pour les trajets inter-villes, des conditions spécifiques peuvent s'appliquer selon le contrat.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  5. Assurance et Responsabilité
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <h3 className="font-semibold text-lg">5.1 Assurance Incluse</h3>
                  <p>
                    Tous nos véhicules sont couverts par une assurance responsabilité civile obligatoire qui couvre les dommages causés aux tiers en cas d'accident responsable.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">5.2 Franchise</h3>
                  <p>
                    En cas de dommages au véhicule, le locataire reste responsable jusqu'à concurrence de la franchise mentionnée dans le contrat, sauf en cas d'option "rachat de franchise".
                  </p>

                  <h3 className="font-semibold text-lg mt-6">5.3 Exclusions</h3>
                  <p>L'assurance ne couvre pas :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Les dommages causés volontairement</li>
                    <li>Les dommages résultant d'une violation des présentes CGL</li>
                    <li>Les dommages causés sous l'emprise d'alcool, drogues ou médicaments</li>
                    <li>La perte ou le vol des clés, documents du véhicule et effets personnels</li>
                    <li>Les dommages aux pneus, jantes et dessous du véhicule (sauf accident)</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">5.4 En Cas d'Accident</h3>
                  <p>Le locataire doit :</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Prévenir immédiatement la police et notre service d'assistance</li>
                    <li>Remplir un constat amiable avec les autres parties impliquées</li>
                    <li>Ne jamais reconnaître sa responsabilité sans notre accord</li>
                    <li>Nous transmettre tous les documents dans les 48 heures</li>
                  </ul>
                </div>
              </div>

              {/* Section 6 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  6. Restitution du Véhicule
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Le véhicule doit être restitué à la date, heure et lieu convenus lors de la réservation. Tout retard doit être signalé et autorisé par nos services sous peine de facturation supplémentaire.
                  </p>
                  
                  <h3 className="font-semibold text-lg mt-6">6.1 Retard de Restitution</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Retard de moins de 1 heure :</strong> Tolérance sans frais</li>
                    <li><strong>Retard entre 1h et 6h :</strong> Facturation de 2 heures supplémentaires</li>
                    <li><strong>Retard de plus de 6h :</strong> Facturation d'une journée supplémentaire</li>
                    <li><strong>Retard de plus de 24h sans autorisation :</strong> Majoration de 50% et dépôt de plainte pour vol</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">6.2 État du Véhicule</h3>
                  <p>
                    Le véhicule doit être restitué dans l'état dans lequel il a été remis (propre, sans dommage, avec le plein de carburant). Des frais de nettoyage de 10 000 FCFA peuvent être facturés si le véhicule est excessivement sale.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  7. Infractions et Contraventions
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    Le locataire est entièrement responsable de toutes les infractions commises pendant la durée de la location (excès de vitesse, stationnement interdit, etc.). Les amendes seront directement prélevées sur la caution, majorées de frais de dossier de 5 000 FCFA par infraction.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  8. Protection des Données
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    DCM Groupe Agence s'engage à protéger les données personnelles de ses clients conformément à la législation ivoirienne en vigueur. Pour plus d'informations, consultez notre <a href="/privacy-policy" className="text-primary hover:underline">Politique de Confidentialité</a>.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  9. Litiges
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux d'Abidjan seront seuls compétents, nonobstant pluralité de défendeurs ou appel en garantie.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div className="card p-8">
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">
                  10. Modifications
                </h2>
                <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
                  <p>
                    DCM Groupe Agence se réserve le droit de modifier les présentes conditions générales à tout moment. Les modifications entreront en vigueur dès leur publication sur le site. Il appartient au locataire de consulter régulièrement cette page.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card p-8 mt-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-start">
                <FileText className="w-8 h-8 text-primary mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-xl mb-3">
                    Questions sur nos conditions générales ?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Notre équipe juridique est à votre disposition pour toute clarification.
                  </p>
                  <a href="/contact" className="btn btn-primary">
                    Nous contacter
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

export default TermsConditions;
