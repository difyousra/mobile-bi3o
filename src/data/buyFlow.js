export const DELIVERY_METHODS = [
  {
    id: "instant",
    label: "Instant Delivery",
    eta: "1 Day estimation",
    fee: 80000,
  },
  {
    id: "fast",
    label: "Fast Delivery",
    eta: "2-3 Day estimation",
    fee: 4000,
  },
  {
    id: "regular",
    label: "Regular Delivery",
    eta: "3-4 Day estimation",
    fee: 2000,
  },
];

export const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Destination",
    detail: "Pay cash upon arrival at destination.",
    icon: "cash-outline",
  },
  {
    id: "transfer",
    label: "Bank Transfer",
    detail: "Transfer funds directly from your bank.",
    icon: "swap-horizontal-outline",
  },
  {
    id: "wallet",
    label: "Bi3oo Wallet",
    detail: "Pay instantly with your digital wallet.",
    icon: "wallet-outline",
  },
  {
    id: "edahabia",
    label: "Edahabbia Card",
    detail: "Use your card for secure payments.",
    icon: "card-outline",
  },
];

export const DEFAULT_ADDRESSES = [
  {
    id: "addr-1",
    label: "My Home",
    line: "No. 24, Blossom Street, Lavender",
    isDefault: true,
    icon: "home-outline",
  },
  {
    id: "addr-2",
    label: "My Home 2",
    line: "Unit 9, Maple Residence",
    icon: "home-outline",
  },
  {
    id: "addr-3",
    label: "My Office",
    line: "Level 8, Tower Sigma",
    icon: "business-outline",
  },
];

export const VOUCHER_CODES = {
  BI3OO10: { label: "10%OFF", percent: 10 },
};
