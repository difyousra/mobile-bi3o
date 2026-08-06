#!/usr/bin/env node
/**
 * Sync + merge des locales web (bi3oo_front_new_design) → mobile.
 * Produit fr.json / en.json / ar.json prêts pour i18next.
 *
 * Usage: node scripts/sync-web-locales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEB_LOCALES =
  process.env.WEB_I18N_LOCALES ||
  "/var/www/preprod-bi3oo/bi3oo_front_new_design/src/i18n/locales";
const OUT_DIR = path.join(ROOT, "src/i18n/locales");

function load(name) {
  const p = path.join(WEB_LOCALES, name);
  if (!fs.existsSync(p)) {
    console.warn(`[sync-web-locales] missing: ${name}`);
    return {};
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function mergeLocaleExtras(base, extra) {
  const out = { ...base };
  for (const [key, value] of Object.entries(extra || {})) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object"
    ) {
      out[key] = { ...out[key], ...value };
    } else {
      out[key] = value;
    }
  }
  return out;
}

const SUBFORMS = [
  "voitures",
  "utilitaires",
  "camion",
  "moto",
  "caravanes",
  "nautismes",
  "equipementsPieces",
  "allService",
  "offreEmploi",
  "offreFormation",
  "offreCandidature",
  "equipementsBebe",
  "mobiliersEnfant",
  "vetementsBebe",
  "vetements",
  "chaussures",
  "accessoiresBagagerie",
  "montresBijoux",
  "maisonJardin",
  "locationsSaisonnieres",
  "agencesDeVoyage",
  "visas",
  "antiquites",
  "collection",
  "cdMusique",
  "dvdFilms",
  "livres",
  "instrumentsMusique",
  "modelisme",
  "jeuxJouets",
  "loisirsCreatifs",
  "sportPleinAir",
  "velos",
  "equipementsVelos",
  "platsGastronomie",
  "ordinateurs",
  "accessoiresInformatiques",
  "tablettesLiseuses",
  "photoAudioVideo",
  "telephonesObjetsConnectes",
  "accessoiresTelephone",
  "consoles",
  "jeuxVideo",
  "tracteur",
  "autreMateriel",
  "animaux",
  "accessoiresAnimaux",
  "venteImmobiliere",
  "locationsImmobilier",
  "colocations",
  "bureauCommercial",
];

function subformFile(id, lng) {
  const pascal = id.charAt(0).toUpperCase() + id.slice(1);
  return load(`subform${pascal}.${lng}.json`);
}

function buildDeposit(lng) {
  const subforms = {};
  for (const id of SUBFORMS) {
    subforms[id] = subformFile(id, lng);
  }
  return {
    ...load(`depositFormUI.${lng}.json`),
    photoTips: load(`depositPhotoTips.${lng}.json`),
    subforms,
  };
}

function buildKeyInfo(lng) {
  const attrs =
    lng === "en"
      ? load("keyInfoAttrs.fr.json")
      : load(`keyInfoAttrs.${lng === "ar" ? "ar" : "fr"}.json`);
  const titles = {
    fr: {
      title: "Les informations clés",
      attributeFallback: "Détail {{id}} :",
      boolYes: "Oui",
      boolNo: "Non",
      kmValue: "{{value}} km",
    },
    en: {
      title: "Key information",
      attributeFallback: "Detail {{id}}:",
      boolYes: "Yes",
      boolNo: "No",
      kmValue: "{{value}} km",
    },
    ar: {
      title: "المعلومات الأساسية",
      attributeFallback: "خاصية {{id}} :",
      boolYes: "نعم",
      boolNo: "لا",
      kmValue: "{{value}} كم",
    },
  };
  return { ...titles[lng], attrs };
}

function buildLang(lng) {
  const base = load(`${lng}.json`);
  const deposit = buildDeposit(lng);
  let out = {
    ...base,
    forms: {
      ...(base.forms || {}),
      deposit,
    },
    keyInfo: buildKeyInfo(lng),
  };

  if (lng === "en" || lng === "ar") {
    out = {
      ...out,
      subcategoryNames: {
        ...(typeof out.subcategoryNames === "object" && out.subcategoryNames
          ? out.subcategoryNames
          : {}),
        ...load(`subcategoryNames.${lng}.json`),
      },
      menuShortcuts: {
        ...(typeof out.menuShortcuts === "object" && out.menuShortcuts
          ? out.menuShortcuts
          : {}),
        ...load(`menuShortcuts.${lng}.json`),
      },
    };
  }

  const newDesign = load(`newDesign.${lng}.json`);
  return mergeLocaleExtras(out, newDesign);
}

if (!fs.existsSync(WEB_LOCALES)) {
  console.error(`[sync-web-locales] Web locales introuvables: ${WEB_LOCALES}`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const lng of ["fr", "en", "ar"]) {
  const merged = buildLang(lng);
  const outPath = path.join(OUT_DIR, `${lng}.json`);
  fs.writeFileSync(outPath, JSON.stringify(merged));
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`✓ ${lng}.json (${kb} KB)`);
}

console.log(`Synced from ${WEB_LOCALES} → ${OUT_DIR}`);
