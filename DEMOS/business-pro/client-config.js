window.SHOP_CONFIG = {
  demo: { id: "demo-coastal-gift-shop", tier: "business-pro", label: "Business Pro" },
  // 11/19 (Tom): Model Gift Shop look (layout B)
  siteStyle: "gift",
  ownerTabs: [
    { id: "dashboard", label: "Dashboard", live: true },
    { id: "business-status", label: "Open / Close" },
    { id: "products", label: "Products" },
    { id: "inventory", label: "Inventory", children: [
      { id: "receiving", label: "Receiving" },
      { id: "outgoing", label: "Outgoing" },
      { id: "low-stock", label: "Low-stock alerts" }
    ] },
    { id: "orders", label: "Orders", live: true },
    { id: "shipping", label: "Shipping" },
    { id: "schedule", label: "Schedule" },
    { id: "employees", label: "Employees" },
    { id: "financials", label: "Financials", children: [{ id: "financials", label: "Financial Overview" }] },
    { id: "photos", label: "Photos" },
    { id: "announcements", label: "Announcements" },
    { id: "business", label: "Business Info" },
    { id: "customers", label: "Customers" },
    { id: "sales-reports", label: "Sales Reports" },
    { id: "settings", label: "Settings" }
  ],
  shop: {
    name: "Coastal Gift Shop", pageTitle: "Coastal Gift Shop | Business Pro DEMO",
    heroTitle: "Bring a little coast home.", heroImage: "../assets/gift-shop.jpg",
    storeTitle: "Shop Coastal Favorites", collectionsLine: "Gifts that bring a little coast home.",
    perks: [["Maine Made", "Small-batch goods from Maine makers"], ["Ships Anywhere", "Packed with care, tracked to your door"], ["Free Pickup", "Order online, grab it at the shop"]],
    heroSubtitle: "Thoughtful coastal gifts. Browse our demo store and try a no-charge checkout.",
    addressLine1: "8 Harbor Road", addressLine2: "Kennebunkport, Maine",
    phoneDisplay: "207-COASTAL", email: "hello@coastalgifts.example",
    hours: [{ days: "Monday - Saturday", hours: "10:00 AM - 6:00 PM" }, { days: "Sunday", hours: "Closed" }]
  },
  services: [],
  barbers: [],
  photos: [{ src: "../assets/gift-shop.jpg", alt: "Coastal gifts on display" }],
  products: [
    { id: "coastal-mug", category: "Kitchen & Table", name: "Lobster Coffee Mug", priceCents: 1800, photo: "../assets/products/mug.jpg", description: "14 oz ceramic mug with a hand-drawn Maine lobster. Dishwasher safe.", weight: 1, box: [6, 6, 6], fragile: true, stock: 30 },
    { id: "lighthouse", category: "Home Decor", name: "Lighthouse Figurine", priceCents: 2600, photo: "../assets/products/lighthouse.jpg", description: "Hand-painted resin lighthouse, about 8 inches tall.", weight: 1.5, box: [6, 6, 10], fragile: true, stock: 3 },
    { id: "jam", category: "Maine Made Treats", name: "Wild Maine Blueberry Jam", priceCents: 900, photo: "../assets/products/jam.jpg", description: "10 oz jar made with small wild Maine blueberries.", weight: 1, box: [4, 4, 6], fragile: true, stock: 30 },
    { id: "syrup", category: "Maine Made Treats", name: "Pure Maine Maple Syrup", priceCents: 1600, photo: "../assets/products/syrup.jpg", description: "8.5 oz glass bottle, Grade A amber.", weight: 1.25, box: [4, 4, 8], fragile: true, stock: 30 },
    { id: "sea-breeze-candle", category: "Home Decor", name: "Lighthouse Scented Candle", priceCents: 2400, photo: "../assets/products/candle.jpg", description: "12 oz soy candle, balsam and sea salt, about 60 hours burn time.", weight: 1.5, box: [5, 5, 6], fragile: true, stock: 30 },
    { id: "canvas-tote", category: "Bags & Gifts", name: "Lighthouse Canvas Tote", priceCents: 2200, photo: "../assets/products/tote.jpg", description: "Heavy cotton canvas tote with a lighthouse print.", weight: 0.5, box: [10, 12, 2], fragile: false, stock: 0 }
  ]
};
