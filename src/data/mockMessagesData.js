export const PRODUCT_CONTEXT = {
  id: "product-1",
  title: "Renault Clio 1.0 TCe 90ch Intens",
  status: "Annonce supprimée",
  price: "14 990 dt",
  image:
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=200&q=80",
};

export const CONVERSATIONS = [
  {
    id: "conv-1",
    sellerName: "Via Shopping",
    sellerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    lastSeen: "Last seen 1 minute ago",
    product: PRODUCT_CONTEXT,
    headerVariant: "seller",
    messages: [],
  },
  {
    id: "conv-2",
    sellerName: "Bi3oo Support",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    lastSeen: "En ligne",
    product: PRODUCT_CONTEXT,
    headerVariant: "logo",
    messages: [],
  },
  {
    id: "conv-3",
    sellerName: "Via Shopping",
    sellerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    lastSeen: "Last seen 1 minute ago",
    product: PRODUCT_CONTEXT,
    headerVariant: "seller",
    messages: [
      { id: "m1", type: "text", text: "Hi, I received my order today, but the color of the shirt is different from what I chose. I ordered beige, but I got navy.", sender: "me", time: "12:12", read: true },
      { id: "m2", type: "text", text: "Hi! Thank you for reaching out and sorry for the inconvenience 🙏. Could you please share a photo of the item you received?", sender: "them", time: "12:14" },
      { id: "m3", type: "image", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", sender: "me", time: "12:14", read: true },
      { id: "m4", type: "text", text: "Thanks! We've verified that it's the wrong variant. Would you prefer to exchange it or request a refund?", sender: "them", time: "12:15" },
      { id: "m5", type: "text", text: "I'd prefer a refund, please.", sender: "me", time: "12:19", read: true },
    ],
  },
];

export function getConversation(id) {
  return CONVERSATIONS.find((c) => c.id === id);
}

export function filterConversations(query) {
  if (!query.trim()) return CONVERSATIONS;
  const q = query.toLowerCase();
  return CONVERSATIONS.filter(
    (c) =>
      c.sellerName.toLowerCase().includes(q) ||
      c.product.title.toLowerCase().includes(q)
  );
}
