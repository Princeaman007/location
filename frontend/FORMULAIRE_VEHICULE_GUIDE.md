# Guide du Formulaire d'Ajout de Véhicule

## 🎯 Structure du Formulaire en 4 Étapes

Le formulaire d'ajout/modification de véhicule est organisé en **4 étapes claires** pour faciliter la saisie :

### **Étape 1 : Infos de base** ℹ️
Informations générales sur le véhicule
- Marque, Modèle, Année
- Immatriculation
- Catégorie (économique, standard, premium, luxe, SUV, van)
- Description

### **Étape 2 : Specs** 🔧
Spécifications techniques
- Transmission (manuelle/automatique)
- Carburant (essence, diesel, hybride, électrique)
- Nombre de places et de portes
- Couleur
- Équipements (climatisation, GPS, Bluetooth, caméra, etc.)

### **Étape 3 : Prix** 💰 **← LES PRIX SONT ICI**
Tarification et disponibilité
- **Prix journalier (FCFA)** * - **OBLIGATOIRE**
- Prix hebdomadaire (FCFA) - Optionnel (calcul auto : -10% sur 7 jours)
- Prix mensuel (FCFA) - Optionnel (calcul auto : -30% sur 30 jours)
- Supplément chauffeur (FCFA) - Par défaut : 15 000 FCFA

**+ Section Disponibilité :**
- Statut (disponible, loué, maintenance, hors-service)
- Villes disponibles
- Options (chauffeur disponible, véhicule vedette)

### **Étape 4 : Photos** 📸
Images et récapitulatif
- **Récapitulatif complet** avec tous les détails (y compris les prix)
- Uploader jusqu'à 10 images (max 5MB chacune)
- La première image devient l'image principale

---

## 📍 Comment Accéder aux Champs de Prix

1. **Ouvrir le modal** : Cliquez sur "Ajouter un véhicule" dans l'AdminDashboard
2. **Naviguer vers l'étape 3** : 
   - Remplissez l'étape 1 (infos de base)
   - Cliquez sur "Suivant"
   - Remplissez l'étape 2 (spécifications)
   - Cliquez sur "Suivant"
3. **Vous êtes à l'étape 3 "Prix"** 💰

---

## 💡 Système de Tarification Dégressive

### Calcul Automatique
Si vous ne renseignez que le **prix journalier**, le système calcule automatiquement :
- **Prix hebdomadaire** = Prix journalier × 7 × 0.9 (-10%)
- **Prix mensuel** = Prix journalier × 30 × 0.7 (-30%)

### Réductions Appliquées aux Locations
Les clients bénéficient automatiquement de réductions dégressives :

| Durée de location | Réduction | Exemple (50 000 FCFA/jour) |
|-------------------|-----------|---------------------------|
| 1-2 jours         | **0%**    | 50 000 FCFA/jour         |
| 3-6 jours         | **5%**    | 47 500 FCFA/jour         |
| 7-13 jours        | **10%**   | 45 000 FCFA/jour         |
| 14-20 jours       | **15%**   | 42 500 FCFA/jour         |
| 21-29 jours       | **20%**   | 40 000 FCFA/jour         |
| 30+ jours         | **30%**   | 35 000 FCFA/jour         |

---

## ✅ Validation des Prix

### Champs Obligatoires
- ✅ **Prix journalier** : DOIT être renseigné (valeur > 0)

### Champs Optionnels
- ⚪ Prix hebdomadaire : Si vide, sera calculé automatiquement
- ⚪ Prix mensuel : Si vide, sera calculé automatiquement
- ⚪ Supplément chauffeur : Défaut = 15 000 FCFA

---

## 📊 Récapitulatif à l'Étape 4

Avant de soumettre le formulaire, l'**étape 4 affiche un récapitulatif complet** :

```
📋 Récapitulatif
├─ Véhicule : Toyota Land Cruiser (2024)
├─ Catégorie : SUV
├─ Prix journalier : 50 000 FCFA ← VISIBLE ICI
├─ Supplément chauffeur : 15 000 FCFA/jour
├─ Places : 7 places
└─ Transmission : Automatique
```

---

## 🔍 Affichage des Prix dans le Tableau

Une fois le véhicule créé, il apparaît dans le tableau des véhicules avec :
- **Colonne "Prix/jour"** : Affiche le prix journalier formaté (ex: 50 000 F)

---

## 🎨 Améliorations Visuelles

### Indicateurs d'Étapes
- Cercles numérotés colorés en bleu quand actifs
- Labels sous chaque étape : "Infos", "Specs", "Prix", "Photos"
- Barre de progression entre les étapes

### Aide Contextuelle
- **Encadré bleu** à l'étape 3 expliquant le système de réductions
- **Placeholders** dans les champs : "Auto: -10% sur 7 jours"
- **Textes d'aide** sous chaque champ de prix
- **Indicateur rouge** "Obligatoire" sur le prix journalier

---

## 🚀 Navigation

- **Bouton "Suivant"** : Passe à l'étape suivante (étapes 1-3)
- **Bouton "Précédent"** : Retourne à l'étape précédente (étapes 2-4)
- **Bouton "Créer/Mettre à jour"** : Soumet le formulaire (étape 4 uniquement)
- **Bouton "Annuler"** : Ferme le modal sans sauvegarder

---

## ❓ FAQ

### Q : Je ne vois pas les champs de prix !
**R :** Ils sont à l'**étape 3**. Cliquez deux fois sur "Suivant" depuis l'étape 1.

### Q : Dois-je renseigner les prix hebdomadaire et mensuel ?
**R :** Non, seul le **prix journalier est obligatoire**. Les autres sont calculés automatiquement.

### Q : Comment modifier le prix d'un véhicule existant ?
**R :** 
1. Cliquez sur "Modifier" dans le tableau
2. Naviguez jusqu'à l'étape 3 avec "Suivant"
3. Modifiez les prix
4. Allez jusqu'à l'étape 4 et cliquez sur "Mettre à jour"

### Q : Pourquoi mes prix ne s'affichent pas dans le tableau ?
**R :** Vérifiez que vous avez bien renseigné le **prix journalier** (obligatoire). Si le véhicule a été créé avant la mise à jour, modifiez-le pour ajouter les prix.

---

## 🎉 Résumé

✅ **Les champs de prix sont à l'étape 3 "Prix"**  
✅ **Seul le prix journalier est obligatoire**  
✅ **Les autres prix sont calculés automatiquement**  
✅ **Un récapitulatif complet est affiché à l'étape 4**  
✅ **Les prix s'affichent dans la colonne "Prix/jour" du tableau**

---

**Besoin d'aide ?** Contactez le support technique.
