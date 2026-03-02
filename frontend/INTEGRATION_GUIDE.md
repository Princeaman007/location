# 🚗 Système de Tarification Dégressive - Guide d'Intégration

Ce guide explique comment utiliser le système de prix dégressifs dans votre application de location de véhicules.

---

## 📦 Composants Créés

### 1. **Utilitaire de Calcul** (`utils/priceCalculator.ts`)
Fonctions pour calculer les prix avec réductions automatiques.

### 2. **PriceCalculator** (`components/booking/PriceCalculator.tsx`)
Composant de récapitulatif des prix avec suggestions d'optimisation.

### 3. **VehicleCard** (`components/vehicles/VehicleCard.tsx`)
Card de véhicule pour le catalogue avec prix "À partir de".

### 4. **VehiclePricingSection** (`components/vehicles/VehiclePricingSection.tsx`)
Section détaillée des tarifs avec tableau comparatif.

---

## 🔧 Utilisation

### Dans le Catalogue de Véhicules

```tsx
// frontend/src/pages/VehicleCatalog.tsx
import VehicleCard from '../components/vehicles/VehicleCard';

const VehicleCatalog = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Charger les véhicules depuis l'API
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Véhicules</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle._id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
};
```

### Dans la Page de Détail Véhicule

```tsx
// frontend/src/pages/VehicleDetail.tsx
import { useState } from 'react';
import VehiclePricingSection from '../components/vehicles/VehiclePricingSection';
import PriceCalculator from '../components/booking/PriceCalculator';

const VehicleDetail = () => {
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [withDriver, setWithDriver] = useState(false);
  const [options, setOptions] = useState([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          {/* Images et infos du véhicule */}
          
          {/* Section tarification détaillée */}
          <VehiclePricingSection
            vehicleDailyRate={vehicle?.pricing.daily}
            chauffeurDailyRate={vehicle?.pricing.chauffeurSupplement}
            className="mt-8"
          />
        </div>

        {/* Sidebar - Calculateur de prix */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <input
              type="date"
              value={startDate?.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <input
              type="date"
              value={endDate?.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={withDriver}
                onChange={(e) => setWithDriver(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Avec chauffeur</span>
            </label>
          </div>

          <PriceCalculator
            vehicle={vehicle}
            startDate={startDate}
            endDate={endDate}
            withDriver={withDriver}
            options={options}
          />
        </div>
      </div>
    </div>
  );
};
```

### Dans le Processus de Réservation

```tsx
// frontend/src/pages/BookingProcess.tsx
import PriceCalculator from '../components/booking/PriceCalculator';

const BookingProcess = () => {
  const [bookingData, setBookingData] = useState({
    vehicle: null,
    startDate: null,
    endDate: null,
    withDriver: false,
    options: []
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de réservation */}
        <div className="lg:col-span-2">
          {/* Étapes de réservation */}
        </div>

        {/* Récapitulatif prix sticky */}
        <div className="lg:col-span-1">
          <PriceCalculator
            vehicle={bookingData.vehicle}
            startDate={bookingData.startDate}
            endDate={bookingData.endDate}
            withDriver={bookingData.withDriver}
            options={bookingData.options}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 Personnalisation des Couleurs

Les composants utilisent les couleurs suivantes (définies dans `tailwind.config.js`) :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2C3E50',  // Bleu foncé principal
          700: '#1a252f',  // Bleu plus foncé au hover
        },
        orange: '#FF8C42',  // Orange pour les prix
      },
    },
  },
};
```

---

## 📊 Grille Tarifaire

| Durée | Réduction | Exemple (50,000 FCFA/jour) |
|-------|-----------|----------------------------|
| 1-2 jours | 0% | 50,000 FCFA/jour |
| 3-6 jours | -5% | 47,500 FCFA/jour |
| 7-13 jours | -10% | 45,000 FCFA/jour |
| 14-20 jours | -15% | 42,500 FCFA/jour |
| 21-29 jours | -20% | 40,000 FCFA/jour |
| 30+ jours | -30% | 35,000 FCFA/jour |

---

## ✅ Fonctionnalités Implémentées

- ✅ Calcul automatique des réductions selon la durée
- ✅ Affichage "À partir de" dans le catalogue
- ✅ Récapitulatif détaillé avec économies
- ✅ Suggestions d'optimisation intelligentes
- ✅ Réductions appliquées au service chauffeur
- ✅ Support des options supplémentaires
- ✅ Tableau comparatif des tarifs
- ✅ Interface responsive et moderne

---

## 🔄 Prochaines Étapes

1. **Intégrer** les composants dans vos pages existantes
2. **Tester** avec différentes durées de location
3. **Ajuster** les couleurs selon votre charte graphique
4. **Personnaliser** les textes et messages
5. **Ajouter** des animations si souhaité

---

## 💡 Conseils

- Les réductions s'appliquent automatiquement, pas d'action manuelle
- Le prix "À partir de" utilise la réduction maximale (30%)
- Les suggestions d'optimisation encouragent les locations plus longues
- Le composant PriceCalculator est "sticky" pour rester visible au scroll

---

## 🐛 Support

En cas de problème ou question, vérifiez :
1. Les types TypeScript sont correctement importés
2. Les dates sont des objets Date valides
3. vehicle.pricing.daily existe et est un nombre
4. Tailwind CSS est correctement configuré
