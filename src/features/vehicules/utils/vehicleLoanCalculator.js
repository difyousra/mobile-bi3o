/** Taux indicatif crédit auto (non contractuel). — exporté depuis le web */
export const DEFAULT_VEHICLE_RATE = 7;
export const RECOMMENDED_VEHICLE_APPORT_PCT = 20;
export const MIN_VEHICLE_DURATION_MONTHS = 12;
export const MAX_VEHICLE_DURATION_MONTHS = 60;
export const DEFAULT_VEHICLE_DURATION_MONTHS = 60;
export const VEHICLE_DURATION_STEP = 6;

export function calcVehicleMonthlyPayment(amount, annualRate, months) {
  if (!amount || !months || amount <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return amount / months;
  return (
    (amount * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1)
  );
}

export function fmtVehicleDA(value) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 DA";
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Math.round(value))} DA`;
}

export function recommendedVehicleApport(prix, pct = RECOMMENDED_VEHICLE_APPORT_PCT) {
  const amount = Number(prix) || 0;
  if (!amount) return 0;
  return Math.round((amount * pct) / 100);
}

export function computeVehicleFinancing({
  prix = 0,
  apport = 0,
  dureeMois = DEFAULT_VEHICLE_DURATION_MONTHS,
  tauxAnnuel = DEFAULT_VEHICLE_RATE,
} = {}) {
  const price = Number(prix) || 0;
  const downPayment = Number(apport) || 0;
  const duration = Number(dureeMois) || 0;
  const loanAmount = Math.max(0, price - downPayment);
  const monthlyPayment = calcVehicleMonthlyPayment(loanAmount, tauxAnnuel, duration);
  const totalRepayment = monthlyPayment * duration;
  const creditCost = Math.max(0, totalRepayment - loanAmount);
  const downPaymentPct = price > 0 ? Math.round((downPayment / price) * 100) : 0;

  return {
    loanAmount,
    monthlyPayment,
    creditCost,
    totalRepayment,
    downPaymentPct,
    apportExceedsPrice: downPayment > price && price > 0,
  };
}
