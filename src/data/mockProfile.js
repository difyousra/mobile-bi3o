export const PROFILE_USER = {
  name: "Mounir",
  greeting: "Ready to shop again?",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  balanceUpdated: "8 May 2025, 10:00 AM",
};

export const MOCK_PROMOTIONS = [
  {
    id: "promo-1",
    title: "Shopivia Welcome Voucher",
    description: "Get Da 10 OFF on your first order!",
    validUntil: "May 31, 2025",
    code: "WELCOME10",
  },
  {
    id: "promo-2",
    title: "Bi3oo Summer Sale",
    description: "Get Da 15 OFF on fashion items!",
    validUntil: "June 30, 2025",
    code: "SUMMER15",
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    type: "Rewards",
    label: "Cashback from Order #INV-2106",
    date: "May 11",
    amount: 4,
  },
  {
    id: "tx-2",
    type: "Purchase",
    label: "Order (Nike Air Max 270)",
    date: "May 10",
    amount: -139,
  },
  {
    id: "tx-3",
    type: "Refunds",
    label: "Refund for Order #INV-2083",
    date: "May 08",
    amount: 89,
  },
  {
    id: "tx-4",
    type: "Top Up",
    label: "Top Up via Credit Card",
    date: "May 05",
    amount: 200,
  },
  {
    id: "tx-5",
    type: "Purchase",
    label: "Order #Laneige Water Cream",
    date: "May 03",
    amount: -35,
  },
];

export const TRANSACTION_FILTERS = [
  "All Transaction",
  "Top Up",
  "Purchase",
  "Refunds",
];

export const TOP_UP_PRESETS = [
  100, 200, 300, 400, 500, 600, 700, 800,
];

export const MOCK_LISTINGS = [
  {
    id: "listing-1",
    title: "iPhone 16 Pro Max 256GB",
    price: 289000,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1592899677977-9b10ca588fa5?w=400&q=80",
    views: 124,
    messages: 8,
  },
  {
    id: "listing-2",
    title: "Canapé 3 places gris",
    price: 45000,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1555041467-a586c61e9bc7?w=400&q=80",
    views: 56,
    messages: 3,
  },
  {
    id: "listing-3",
    title: "Vélo électrique",
    price: 120000,
    status: "inactive",
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77891?w=400&q=80",
    views: 12,
    messages: 0,
  },
];

export const LISTING_TABS = [
  { id: "active", label: "Actives" },
  { id: "inactive", label: "Inactives" },
  { id: "sold", label: "Vendues" },
];
