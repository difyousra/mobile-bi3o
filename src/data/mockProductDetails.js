export const DEFAULT_SPECS = [
  { id: "display", icon: "phone-portrait-outline", label: "Display", value: "6.9” Super Retina XDR" },
  { id: "os", icon: "logo-apple", label: "OS", value: "OS 18 with AI features" },
  { id: "camera", icon: "camera-outline", label: "Camera", value: "Triple 48MP + Ultra-Wide" },
  { id: "battery", icon: "battery-full-outline", label: "Battery", value: "Up to 30h playback" },
  { id: "chip", icon: "hardware-chip-outline", label: "Chipset", value: "A18 Bionic" },
  { id: "connect", icon: "wifi-outline", label: "Connectivity", value: "USB-C, 5G, Wi-Fi 6E" },
];

export const DEFAULT_COLORS = [
  { id: "natural", label: "Natural", hex: "#C4B7A6" },
  { id: "midnight", label: "Midnight", hex: "#1C1C1E" },
  { id: "white", label: "White", hex: "#F5F5F7" },
  { id: "blue", label: "Blue", hex: "#4A6FA5" },
];

export const DEFAULT_STORAGE = ["128 GB", "256 GB", "512 GB", "1 TB"];

export const MOCK_REVIEWS = [
  {
    id: "rev-1",
    author: "Randy Vetrovs",
    rating: 4.6,
    likes: 314,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    variant: "iPhone 16 Pro Max",
    storage: "256 GB",
    color: "Natural Titanium",
    text:
      "Camera quality is next level. The titanium body feels super premium in hand. Battery easily lasts me all day even with heavy use.",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9b10ca588fa5?w=200&q=80",
    ],
  },
  {
    id: "rev-2",
    author: "Clara Annisa",
    rating: 5.0,
    likes: 198,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    variant: "iPhone 16 Pro Max",
    storage: "256 GB",
    color: "Midnight",
    text:
      "Fast shipping! Everything's sealed and original. Upgraded from iPhone 14 and the performance jump is amazing.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb69488622f?w=200&q=80",
    ],
  },
  {
    id: "rev-3",
    author: "Felix Tan",
    rating: 4.8,
    likes: 56,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    variant: "iPhone 16 Pro Max",
    storage: "512 GB",
    color: "Blue Titanium",
    text:
      "Excellent seller, product as described. Face ID is faster and the display is gorgeous in sunlight.",
    images: [],
  },
];

export function enrichProduct(product) {
  const images =
    product.images?.length > 0
      ? product.images
      : [
          product.image,
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
        ].filter(Boolean);

  return {
    ...product,
    images,
    colors: product.colors ?? DEFAULT_COLORS,
    storageOptions: product.storageOptions ?? DEFAULT_STORAGE,
    specs: product.specs ?? DEFAULT_SPECS,
    reviewsList: product.reviewsList ?? MOCK_REVIEWS,
    promo: product.promo ?? {
      title: "Update About Popular Product",
      subtitle: "Stay update with out popular & high quality product",
    },
  };
}
