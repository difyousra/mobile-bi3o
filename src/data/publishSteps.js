export const PUBLISH_TOTAL_STEPS = 9;

export const PHOTO_SLOTS = [
  { id: "primary", label: "Ajouter une photo", required: true },
  { id: "front", label: "3/4 avant gauche" },
  { id: "rear", label: "3/4 arrière droit" },
  { id: "interior", label: "Intérieur conducteur" },
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
