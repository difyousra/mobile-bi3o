export const PUBLISH_TOTAL_STEPS = 9;

export const PHOTO_SLOTS = [
  { id: "primary", label: "Ajouter une photo", required: true },
  { id: "front", label: "3/4 avant gauche" },
  { id: "rear", label: "3/4 arrière droit" },
  { id: "interior", label: "Intérieur conducteur" },
];

/** Flux dépôt Immobilier (41–44) : essentiel → photos → détails taxo → lieu → prix → aperçu. */
export const IMMOBILIER_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent 7 fois plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "immobilier-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de votre bien immobilier.",
    type: "immobilierFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const VEHICLE_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent 7 fois plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "vehicle-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de votre véhicule.",
    type: "vehicleFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const ELECTRONIQUE_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent 7 fois plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "electronique-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de l'appareil.",
    type: "electroniqueFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const MODE_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "mode-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de l'article de mode.",
    type: "modeFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const LOISIRS_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "loisirs-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de votre article de loisirs.",
    type: "loisirsFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const ANIMAUX_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "animaux-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de l'animal ou de l'accessoire.",
    type: "animauxFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const MAISON_JARDIN_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "maison-jardin-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de votre article maison ou jardin.",
    type: "maisonJardinFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const SERVICE_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "service-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Décrivez précisément votre service.",
    type: "serviceFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Indiquez votre tarif ou prix de prestation.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const LOCATIONS_VACANCES_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "locations-vacances-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les détails de votre offre de location ou voyage.",
    type: "locationsVacancesFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Indiquez votre tarif ou budget.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const MATERIEL_PROFESSIONNEL_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "materiel-professionnel-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques du matériel professionnel.",
    type: "materielProfessionnelFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Indiquez le prix ou tarif du matériel.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const EMPLOI_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Ajoutez des visuels si vous le souhaitez pour renforcer votre annonce.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "emploi-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les informations de votre annonce emploi.",
    type: "emploiFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Rémunération / prix",
    subtitle: "Indiquez un prix si cette sous-catégorie le permet.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const FAMILLE_PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "famille-details",
    stepLabel: "Détails",
    title: "Dites-nous en plus",
    subtitle: "Renseignez les caractéristiques de l'article.",
    type: "familleFields",
  },
  {
    id: 4,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 5,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 6,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
];

export const PUBLISH_STEPS = [
  {
    id: 1,
    figmaNodeId: "1:26140",
    stepLabel: "L'essentiel",
    title: "Commençons par l'essentiel !",
    type: "essentials",
  },
  {
    id: 2,
    figmaNodeId: "103:6263",
    stepLabel: "Photos",
    title: "Ajoutez des photos",
    subtitle:
      "Les annonces avec de belles photos reçoivent 7 fois plus de contacts.",
    type: "photos",
  },
  {
    id: 3,
    figmaNodeId: "103:6388",
    stepLabel: "Détails emploi",
    title: "Dites-nous en plus",
    subtitle: "Mettez en valeur votre annonce !",
    type: "jobFields",
    fields: [
      { key: "contractType", label: "Type de contrat", placeholder: "CDD", picker: true },
      { key: "sector", label: "Secteur d'activité", placeholder: "Agriculture", picker: true },
      { key: "job", label: "Métier", placeholder: "Sélectionner un métier", picker: true },
      { key: "experience", label: "Expérience", placeholder: "0 à 2 ans", picker: true },
      { key: "education", label: "Niveau d'études", placeholder: "Bac +2", picker: true },
    ],
  },
  {
    id: 4,
    figmaNodeId: "103:6507",
    stepLabel: "Location",
    title: "Dites-nous en plus",
    subtitle: "Mettez en valeur votre recherche !",
    type: "propertyFields",
    fields: [
      { key: "rentType", label: "Type de location", placeholder: "Appartement", picker: true },
      { key: "capacity", label: "Capacité d'accueil", placeholder: "4", counter: true },
      { key: "rooms", label: "Nombre de chambres", placeholder: "2", counter: true },
      { key: "beds", label: "Nombre de lits", placeholder: "2", counter: true },
    ],
    tip: "Les annonces avec piscine et WiFi reçoivent 3x plus de demandes.",
  },
  {
    id: 5,
    figmaNodeId: "103:6617",
    stepLabel: "Localisation",
    title: "Où vous situez-vous ?",
    subtitle:
      "Pour des raisons de confidentialité, votre adresse exacte n'apparaîtra jamais sur votre annonce.",
    type: "location",
    fields: [
      { key: "city", label: "Ville", placeholder: "Lyon" },
      { key: "postalCode", label: "Code postal", placeholder: "69002" },
      { key: "address", label: "Adresse (privée)", placeholder: "12 rue de la République" },
    ],
  },
  {
    id: 6,
    figmaNodeId: "103:6780",
    stepLabel: "Caractéristiques",
    title: "Dites-nous en plus",
    subtitle: "Mettez en valeur votre recherche !",
    type: "assetFields",
    fields: [
      { key: "assetType", label: "Type de bien", placeholder: "Choisir un type", picker: true },
      { key: "surface", label: "Surface habitable (m²)", placeholder: "85" },
      { key: "roomsCount", label: "Nombre de pièces", placeholder: "4" },
      { key: "mileage", label: "Kilométrage", placeholder: "45 000 km" },
      { key: "condition", label: "État du véhicule", placeholder: "Très bon état", picker: true },
    ],
  },
  {
    id: 7,
    figmaNodeId: "103:6919",
    stepLabel: "Prix",
    title: "Fixez votre prix",
    subtitle: "Comparez avec des objets similaires pour vendre plus vite.",
    type: "price",
  },
  {
    id: 8,
    figmaNodeId: "103:7087",
    stepLabel: "Aperçu",
    title: "Vérifiez votre annonce",
    subtitle: "Relisez les informations avant publication.",
    type: "preview",
  },
  {
    id: 9,
    figmaNodeId: "103:7228",
    stepLabel: "Publication",
    title: "Annonce publiée !",
    subtitle: "Votre annonce est en ligne sur Bi3oo.",
    type: "success",
  },
];

/**
 * Retourne la liste d'étapes (hors boost) selon la sous-catégorie.
 * Immobilier 41–44 → flux dédié ; sinon flux générique Figma.
 */
export function resolvePublishSteps(sousCategorieId) {
  const id = Number(sousCategorieId);
  if ([45, 46].includes(id)) {
    return MATERIEL_PROFESSIONNEL_PUBLISH_STEPS;
  }
  if ([40, 90, 91].includes(id)) {
    return LOCATIONS_VACANCES_PUBLISH_STEPS;
  }
  if ([50].includes(id)) {
    return SERVICE_PUBLISH_STEPS;
  }
  if ([53, 54, 55, 56, 57, 58, 59, 60].includes(id)) {
    return MAISON_JARDIN_PUBLISH_STEPS;
  }
  if ([61, 62].includes(id)) {
    return ANIMAUX_PUBLISH_STEPS;
  }
  if ([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 89].includes(id)) {
    return LOISIRS_PUBLISH_STEPS;
  }
  if ([16, 17, 18, 19].includes(id)) {
    return MODE_PUBLISH_STEPS;
  }
  if ([32, 33, 34, 35, 36, 37, 38, 39].includes(id)) {
    return ELECTRONIQUE_PUBLISH_STEPS;
  }
  if ([1, 2, 7, 8, 9, 51, 52, 63, 64, 65].includes(id)) {
    if (id === 64) {
      return VEHICLE_PUBLISH_STEPS.filter((step) => step.type !== "vehicleFields");
    }
    return VEHICLE_PUBLISH_STEPS;
  }
  if ([10, 11, 12].includes(id)) {
    if (id === 12) {
      return EMPLOI_PUBLISH_STEPS.filter((step) => step.type !== "price");
    }
    return EMPLOI_PUBLISH_STEPS;
  }
  if ([13, 14, 15].includes(id)) {
    return FAMILLE_PUBLISH_STEPS;
  }
  if ([41, 42, 43, 44].includes(id)) {
    return IMMOBILIER_PUBLISH_STEPS;
  }
  return PUBLISH_STEPS.filter((s) => s.type !== "success");
}

export function resolvePublishTotalSteps(sousCategorieId) {
  return resolvePublishSteps(sousCategorieId).length;
}

export const BOOST_OPTIONS = [
  {
    id: "highlight",
    icon: "trending-up-outline",
    title: "Mise en avant",
    description:
      "Votre annonce remonte en tête des résultats pendant 7 jours.",
    price: "12,90€",
  },
  {
    id: "performance",
    icon: "rocket-outline",
    title: "Pack Performance",
    description:
      "Mise en avant + badge urgent + statistiques détaillées.",
    price: "24,90€",
    popular: true,
  },
  {
    id: "urgent",
    icon: "flash-outline",
    title: "Logo Urgent",
    description: "Badge « Urgent » visible sur votre annonce pendant 14 jours.",
    price: "8,90€",
  },
];

export const PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";
