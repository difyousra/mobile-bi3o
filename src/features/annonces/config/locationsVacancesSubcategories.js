/**
 * Configuration des formulaires fils — catégorie Locations et vacances.
 * Aligné sur le nouveau front web.
 */

const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const select = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "combobox",
  preferTaxoAttrId: true,
  ...options,
});

const multiSelect = (name, label, options = {}) =>
  select(name, label, {
    control: "multi-dropdown",
    multi: true,
    ...options,
  });

const locSelect = (name, label, staticOptions, options = {}) =>
  select(name, label, {
    staticOptions,
    preferStaticOptions: true,
    ...options,
  });

const locMulti = (name, label, staticOptions, options = {}) =>
  multiSelect(name, label, {
    staticOptions,
    preferStaticOptions: true,
    ...options,
  });

const BOOL_OUI_NON = {
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  checkedValue: "Oui",
  uncheckedValue: "Non",
};

const TYPE_RESIDENCE = ["Secondaire", "Principale", "Non résidentiel"];
const NATURE_LOGEMENT = [
  "Location ou Gîte",
  "Chambre d'hôtes",
  "Camping",
  "Hébergement insolite",
];
const TYPE_LOGEMENT = [
  "Appartement",
  "Bateau",
  "Bungalow",
  "Bus",
  "Cabane",
  "Caravane",
  "Chalet",
  "Chambre",
  "Château",
  "Emplacement de camping",
  "Ferme",
  "Gîte",
  "Grange aménagée",
  "Maison",
  "Maison bulle",
  "Mobil-home",
  "Moulin",
  "Phare",
  "Roulotte",
  "Studio",
  "Tente",
  "Tipi",
  "Train",
  "Van",
  "Villa",
  "Yourte",
  "Autre",
];
const NOMBRE_ETOILES = [
  "Non classé",
  "En attente de classement",
  "1 étoile",
  "2 étoiles",
  "3 étoiles",
  "4 étoiles",
  "5 étoiles",
];
const CAPACITE = [
  "1 personne",
  "2 personnes",
  "3 personnes",
  "4 personnes",
  "5 personnes",
  "6 personnes",
  "7 personnes",
  "8 personnes",
  "9 personnes",
  "10 personnes",
  "11 personnes",
  "12 personnes et plus",
];
const NOMBRE_CHAMBRES = ["0", "1", "2", "3", "4", "5", "6", "7", "8 et plus"];
const HORAIRES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];
const EQUIPEMENTS = [
  "Wifi gratuit",
  "Télévision",
  "Lave-vaisselle",
  "Cuisine",
  "Lave-linge",
  "Sèche-linge",
  "Chauffage",
  "Climatisation",
  "Draps & linge inclus",
  "Savon & shampoing",
  "Barbecue / grill",
  "Planche à repasser",
  "Chaise haute pour bébé",
];
const EXTERIEUR = ["Patio / Véranda", "Jardin", "Balcon", "Sauna", "Jacuzzi", "Hammam"];
const SERVICES_ACCESSIBILITE = [
  "Parking gratuit",
  "Parking payant",
  "Ménage inclus",
  "Accessible en fauteuil roulant",
  "Ascenseur",
];

const locationsSaisonnieres = {
  id: 40,
  slug: "locations-saisonnieres",
  label: "Locations saisonnières",
  fields: [
    {
      name: "type_residence",
      label: "Type de résidence",
      type: T.TEXT,
      control: "choice-chips",
      attrId: 205,
      required: true,
      preferTaxoAttrId: true,
      staticOptions: TYPE_RESIDENCE,
      preferStaticOptions: true,
    },
    locSelect("nature_logement", "Nature du logement", NATURE_LOGEMENT, {
      attrId: 206,
      required: true,
    }),
    locSelect("type_logement", "Type de logement", TYPE_LOGEMENT, { attrId: 207 }),
    locSelect("nombre_etoiles", "Nombre d'étoiles", NOMBRE_ETOILES, { attrId: 208 }),
    locSelect("capacite", "Capacité", CAPACITE, { attrId: 209, required: true }),
    locSelect("nombre_chambres", "Nombre de chambres", NOMBRE_CHAMBRES, { attrId: 210 }),
    locSelect("horaire_arrivee", "Horaire d'arrivée", HORAIRES, { attrId: 211 }),
    locSelect("horaire_depart", "Horaire de départ", HORAIRES, { attrId: 212 }),
    locMulti("equipements", "Équipements", EQUIPEMENTS, { attrId: 213 }),
    locMulti("exterieur", "Extérieur", EXTERIEUR, { attrId: 214 }),
    locMulti(
      "services_accessibilite",
      "Services et accessibilité",
      SERVICES_ACCESSIBILITE,
      { attrId: 215 }
    ),
    { name: "location_avec_piscine", label: "Location avec piscine", ...BOOL_OUI_NON },
    { name: "animaux_acceptes", label: "Animaux acceptés", ...BOOL_OUI_NON },
    { name: "fumeurs_acceptes", label: "Fumeurs acceptés", ...BOOL_OUI_NON },
  ],
};

const agencesDeVoyage = {
  id: 90,
  slug: "agences-de-voyage",
  label: "Agences de voyage",
  fields: [
    select("type_agence", "Type d'agence", {
      staticOptions: [
        "Agence de voyage générale",
        "Agence de tourisme local",
        "Agence de tourisme international",
        "Agence Omra",
        "Agence Hajj",
        "Agence billetterie",
        "Agence visa",
        "Agence B2B",
        "Agence réceptive",
        "Autre",
      ],
    }),
    multiSelect("services_proposes", "Services proposés", {
      staticOptions: [
        "Billets d'avion",
        "Réservation hôtel",
        "Omra",
        "Hajj",
        "Visa",
        "Voyage organisé",
        "Circuit touristique",
        "Excursions",
        "Assurance voyage",
        "Transfert aéroport",
        "Location voiture",
        "Séjour balnéaire",
        "Séjour familial",
        "Autre",
      ],
    }),
    multiSelect("destinations_principales", "Destinations principales", {
      staticOptions: [
        "Algérie",
        "Tunisie",
        "Turquie",
        "France",
        "Espagne",
        "Italie",
        "Dubai / UAE",
        "Arabie Saoudite",
        "Égypte",
        "Maroc",
        "Europe",
        "Asie",
        "Afrique",
        "Autre",
      ],
    }),
    select("wilaya", "Wilaya"),
    select("type_client", "Type de client", {
      staticOptions: [
        "Particulier",
        "Famille",
        "Couple",
        "Groupe",
        "Entreprise",
        "Étudiant",
        "Agence partenaire",
        "Autre",
      ],
    }),
    select("agrement", "Agrément", {
      staticOptions: ["Avec agrément", "Sans agrément", "En cours", "Non renseigné"],
    }),
  ],
};

const visas = {
  id: 91,
  slug: "visas",
  label: "Visas",
  fields: [
    select("pays_destination", "Pays de destination", {
      staticOptions: [
        "France",
        "Espagne",
        "Italie",
        "Allemagne",
        "Grèce",
        "Portugal",
        "Belgique",
        "Pays-Bas",
        "Suisse",
        "Turquie",
        "UAE / Dubai",
        "Arabie Saoudite",
        "Canada",
        "UK",
        "USA",
        "Chine",
        "Égypte",
        "Tunisie",
        "Maroc",
        "Autre",
      ],
    }),
    select("type_visa", "Type de visa", {
      staticOptions: [
        "Touristique",
        "Affaires",
        "Études",
        "Travail",
        "Transit",
        "Familial",
        "Médical",
        "Omra",
        "Hajj",
        "Schengen",
        "Autre",
      ],
    }),
    multiSelect("type_service", "Type de service", {
      staticOptions: [
        "Constitution dossier",
        "Prise de rendez-vous",
        "Assurance voyage",
        "Réservation hôtel",
        "Réservation billet d'avion",
        "Lettre d'invitation",
        "Traduction documents",
        "Formulaire visa",
        "Suivi dossier",
        "Conseil et orientation",
        "Service complet",
        "Autre",
      ],
    }),
    select("centre_demande", "Centre de demande", {
      staticOptions: [
        "TLScontact",
        "VFS Global",
        "BLS",
        "Ambassade",
        "Consulat",
        "E-visa",
        "Non requis",
        "Selon pays",
      ],
    }),
    select("delai_traitement", "Délai de traitement", {
      staticOptions: [
        "Express",
        "24h à 48h",
        "3 à 5 jours",
        "1 semaine",
        "2 semaines",
        "Plus de 2 semaines",
        "Selon ambassade",
        "Non renseigné",
      ],
    }),
    multiSelect("documents_requis", "Documents requis", {
      staticOptions: [
        "Passeport",
        "Photo",
        "Assurance voyage",
        "Réservation hôtel",
        "Billet d'avion",
        "Relevé bancaire",
        "Attestation de travail",
        "Registre de commerce",
        "Invitation",
        "Formulaire visa",
        "Dossier complet",
        "Selon pays",
      ],
    }),
    select("type_demandeur", "Type de demandeur", {
      staticOptions: [
        "Salarié",
        "Commerçant",
        "Étudiant",
        "Retraité",
        "Sans emploi",
        "Profession libérale",
        "Famille",
        "Mineur",
        "Entreprise",
        "Autre",
      ],
    }),
  ],
};

export const LOCATIONS_VACANCES_SUBCATEGORIES = {
  40: locationsSaisonnieres,
  90: agencesDeVoyage,
  91: visas,
};

export function getLocationsVacancesSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return LOCATIONS_VACANCES_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isLocationsVacancesSubcategory(sousCategorieId) {
  return Boolean(getLocationsVacancesSubcategoryConfig(sousCategorieId));
}
