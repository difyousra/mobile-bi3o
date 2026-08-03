/** Taux indicatif type banque algérienne (non contractuel). — exporté depuis le web */
export const DEFAULT_MORTGAGE_RATE = 5.75;
export const DEFAULT_FRAIS_DOSSIER_PCT = 1;
export const RECOMMENDED_APPORT_PCT = 20;
export const MIN_LOAN_DURATION = 5;
export const MAX_LOAN_DURATION = 25;
export const DEFAULT_LOAN_DURATION = 20;

export function calcMensualite(montant, tauxAnnuel, dureeAns) {
  if (!montant || !dureeAns || montant <= 0 || dureeAns <= 0) return 0;
  const r = tauxAnnuel / 100 / 12;
  const n = dureeAns * 12;
  if (r === 0) return montant / n;
  return (montant * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

export function fmtMortgageDA(value) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 DA";
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Math.round(value))} DA`;
}

export function recommendedApport(prix, pct = RECOMMENDED_APPORT_PCT) {
  const amount = Number(prix) || 0;
  if (!amount) return 0;
  return Math.round((amount * pct) / 100);
}

export function apportPercentage(prix, apport) {
  const p = Number(prix) || 0;
  const a = Number(apport) || 0;
  if (!p || !a) return 0;
  return Math.round((a / p) * 100);
}

export function computeMortgageSimulation({
  prix = 0,
  apport = 0,
  duree = DEFAULT_LOAN_DURATION,
  tauxAnnuel = DEFAULT_MORTGAGE_RATE,
  fraisDossierPct = DEFAULT_FRAIS_DOSSIER_PCT,
} = {}) {
  const price = Number(prix) || 0;
  const downPayment = Number(apport) || 0;
  const duration = Number(duree) || 0;
  const montantEmprunte = Math.max(0, price - downPayment);
  const mensualite = calcMensualite(montantEmprunte, tauxAnnuel, duration);
  const coutTotalMensualites = mensualite * duration * 12;
  const coutInterets = Math.max(0, coutTotalMensualites - montantEmprunte);
  const fraisDossier = Math.round((montantEmprunte * fraisDossierPct) / 100);
  const coutGlobal = coutTotalMensualites + fraisDossier;
  const apportPct = apportPercentage(price, downPayment);
  const apportExceedsPrice = downPayment > price && price > 0;

  return {
    montantEmprunte,
    mensualite,
    coutInterets,
    fraisDossier,
    coutGlobal,
    apportPct,
    apportExceedsPrice,
  };
}
