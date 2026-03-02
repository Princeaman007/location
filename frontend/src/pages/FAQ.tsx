import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Phone, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Toutes');

  const faqData: FAQItem[] = [
    // Réservation
    {
      category: 'Réservation',
      question: 'Comment réserver un véhicule ?',
      answer: 'Vous pouvez réserver directement sur notre site en sélectionnant le véhicule de votre choix, puis en remplissant le formulaire de réservation. Vous recevrez une confirmation par email. Vous pouvez également nous contacter par téléphone au +225 07 59 62 76 03.',
    },
    {
      category: 'Réservation',
      question: 'Puis-je modifier ou annuler ma réservation ?',
      answer: 'Oui, vous pouvez modifier ou annuler votre réservation jusqu\'à 24 heures avant la date de prise en charge. Les modifications peuvent être effectuées depuis votre espace client ou en nous contactant. Les annulations tardives peuvent entraîner des frais.',
    },
    {
      category: 'Réservation',
      question: 'Dois-je verser un acompte ?',
      answer: 'Cela dépend du mode de paiement choisi. Pour le paiement en ligne, un acompte de 30% peut être demandé. Pour le paiement à la livraison, aucun acompte n\'est nécessaire, mais une caution peut être requise.',
    },
    {
      category: 'Réservation',
      question: 'Combien de temps à l\'avance dois-je réserver ?',
      answer: 'Nous recommandons de réserver au moins 48 heures à l\'avance pour garantir la disponibilité du véhicule souhaité. Cependant, nous acceptons également les réservations de dernière minute selon les disponibilités.',
    },

    // Paiement
    {
      category: 'Paiement',
      question: 'Quels modes de paiement acceptez-vous ?',
      answer: 'Nous acceptons les paiements par carte bancaire, Mobile Money (Orange Money, MTN Money, Moov Money), virement bancaire et paiement en espèces à la livraison. Le paiement en ligne est sécurisé et crypté.',
    },
    {
      category: 'Paiement',
      question: 'Le paiement à la livraison est-il disponible ?',
      answer: 'Oui, nous offrons la possibilité de payer en espèces lors de la remise du véhicule. Ce service est disponible dans toutes les villes où nous opérons.',
    },
    {
      category: 'Paiement',
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Non, nous pratiquons une politique de transparence totale. Le prix affiché inclut l\'assurance de base et les taxes. Les frais additionnels (chauffeur, carburant supplémentaire, etc.) sont clairement indiqués lors de la réservation.',
    },
    {
      category: 'Paiement',
      question: 'Proposez-vous des réductions pour les longues durées ?',
      answer: 'Oui, nous offrons des tarifs dégressifs pour les locations de longue durée (7 jours ou plus). Contactez-nous pour obtenir un devis personnalisé adapté à vos besoins.',
    },

    // Documents & Conditions
    {
      category: 'Documents',
      question: 'Quels documents dois-je fournir pour louer un véhicule ?',
      answer: 'Vous devez présenter : 1) Une pièce d\'identité valide (CNI, passeport ou permis de conduire), 2) Un permis de conduire valide (catégorie B minimum, ayant plus de 2 ans), 3) Un justificatif de domicile de moins de 3 mois.',
    },
    {
      category: 'Documents',
      question: 'Acceptez-vous les permis de conduire internationaux ?',
      answer: 'Oui, nous acceptons les permis de conduire internationaux accompagnés du permis national. Les ressortissants de la CEDEAO peuvent utiliser leur permis national sans formalité supplémentaire.',
    },
    {
      category: 'Documents',
      question: 'Quel est l\'âge minimum pour louer ?',
      answer: 'L\'âge minimum requis est de 21 ans avec au moins 2 ans de permis de conduire. Pour certaines catégories de véhicules (luxe, 4x4), l\'âge minimum peut être de 25 ans.',
    },
    {
      category: 'Documents',
      question: 'Puis-je louer un véhicule pour quelqu\'un d\'autre ?',
      answer: 'Oui, mais le conducteur principal doit être présent lors de la remise du véhicule avec ses documents. Vous pouvez également ajouter des conducteurs supplémentaires moyennant des frais additionnels.',
    },

    // Véhicules
    {
      category: 'Véhicules',
      question: 'Les véhicules sont-ils assurés ?',
      answer: 'Oui, tous nos véhicules sont couverts par une assurance tous risques. Cette assurance de base est incluse dans le prix de location et couvre les dommages matériels et corporels selon les conditions du contrat.',
    },
    {
      category: 'Véhicules',
      question: 'Puis-je choisir la couleur du véhicule ?',
      answer: 'La disponibilité des couleurs dépend du stock. Vous pouvez indiquer votre préférence lors de la réservation, et nous ferons de notre mieux pour vous satisfaire, mais nous ne pouvons pas garantir une couleur spécifique.',
    },
    {
      category: 'Véhicules',
      question: 'Les véhicules sont-ils équipés de climatisation ?',
      answer: 'Oui, tous nos véhicules sont équipés de climatisation fonctionnelle. Nous vérifions régulièrement l\'état de tous les équipements pour garantir votre confort.',
    },
    {
      category: 'Véhicules',
      question: 'Que se passe-t-il en cas de panne ?',
      answer: 'En cas de panne, contactez immédiatement notre service d\'assistance 24/7. Nous interviendrons rapidement pour une réparation sur place ou un remplacement du véhicule sans frais supplémentaires si la panne n\'est pas due à une mauvaise utilisation.',
    },

    // Chauffeur
    {
      category: 'Chauffeur',
      question: 'Comment fonctionne la location avec chauffeur ?',
      answer: 'Notre service avec chauffeur inclut un chauffeur professionnel expérimenté et courtois. Les frais de chauffeur sont calculés par jour ou par heure selon vos besoins. Le carburant et les péages sont généralement à votre charge.',
    },
    {
      category: 'Chauffeur',
      question: 'Les chauffeurs parlent-ils français/anglais ?',
      answer: 'Tous nos chauffeurs parlent français couramment. Nous disposons également de chauffeurs anglophones sur demande. Merci de préciser cette exigence lors de votre réservation.',
    },
    {
      category: 'Chauffeur',
      question: 'Puis-je avoir le même chauffeur pour toute la durée ?',
      answer: 'Oui, si vous louez avec chauffeur pour plusieurs jours, le même chauffeur vous sera attribué pour toute la durée de la location, sauf circonstances exceptionnelles.',
    },

    // Utilisation
    {
      category: 'Utilisation',
      question: 'Y a-t-il un kilométrage limité ?',
      answer: 'Nos locations incluent un kilométrage illimité pour les locations en ville. Pour les trajets interurbains, des conditions spécifiques peuvent s\'appliquer. Consultez les détails lors de votre réservation.',
    },
    {
      category: 'Utilisation',
      question: 'Puis-je sortir d\'Abidjan avec le véhicule ?',
      answer: 'Oui, vous pouvez circuler librement sur tout le territoire ivoirien. Pour les sorties du pays, une autorisation préalable est nécessaire et des frais supplémentaires peuvent s\'appliquer.',
    },
    {
      category: 'Utilisation',
      question: 'Le carburant est-il inclus ?',
      answer: 'Le véhicule vous est remis avec un plein de carburant. Vous devez le restituer avec le même niveau. Si ce n\'est pas le cas, des frais de carburant majorés seront appliqués.',
    },
    {
      category: 'Utilisation',
      question: 'Que faire en cas d\'accident ?',
      answer: 'En cas d\'accident : 1) Assurez votre sécurité et celle des autres, 2) Contactez la police et notre service d\'urgence, 3) Remplissez un constat amiable si possible, 4) Ne reconnaissez jamais votre responsabilité sur place. Notre équipe vous guidera dans toutes les démarches.',
    },
  ];

  const categories = ['Toutes', 'Réservation', 'Paiement', 'Documents', 'Véhicules', 'Chauffeur', 'Utilisation'];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'Toutes' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-h1 font-heading font-bold mb-6">
              Questions Fréquentes (FAQ)
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>

            {/* Recherche */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="card p-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Aucune question trouvée pour votre recherche.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('Toutes');
                  }}
                  className="btn btn-outline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="card overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                          {faq.category}
                        </span>
                        <h3 className="font-heading font-semibold text-lg">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                          activeIndex === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeIndex === index && (
                      <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section bg-white">
        <div className="container">
          <div className="card p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-h2 font-heading font-bold mb-4">
                Vous n'avez pas trouvé votre réponse ?
              </h2>
              <p className="text-gray-600 mb-8">
                Notre équipe est disponible 24/7 pour répondre à toutes vos questions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="tel:+2250759627603" className="card p-6 hover:shadow-lg transition-shadow">
                  <Phone className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Téléphone</h4>
                  <p className="text-sm text-gray-600">+225 07 59 62 76 03</p>
                </a>
                <a href="mailto:contact@dcmgroupe.ci" className="card p-6 hover:shadow-lg transition-shadow">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-sm text-gray-600">contact@dcmgroupe.ci</p>
                </a>
                <a href="/contact" className="card p-6 hover:shadow-lg transition-shadow">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Chat en ligne</h4>
                  <p className="text-sm text-gray-600">Support instantané</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
