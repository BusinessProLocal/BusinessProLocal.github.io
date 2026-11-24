window.SHOP_CONFIG = {
  // 11/22 (Tom): "Here's yours" mockup for The Village Barber, on the real barbershop engine (Classic look)
  // in his own sign colors: cream, black and his sign's blue. Unlisted pitch page, not linked from the site.
  siteStyle: "classic",
  demo: { id: "demo-village-barber", tier: "professional", label: "Professional Plus", staffHeading: "Meet the Barber", staffLabel: "the barber" },
  ownerTabs: [
    // 11/23 (Tom): Dashboard ▾ 1 · 2 · 3 — each opens just that part of the day
    { id: "dashboard", label: "Dashboard", live: true, children: [
      { id: "dash-1", label: "1 Finish These First", live: true },
      { id: "dash-2", label: "2 Today's Appointments", live: true },
      { id: "dash-3", label: "3 Done Today & Money", live: true }
    ] },
    { id: "business-status", label: "Open / Close" },
    { id: "appointments", label: "Appointments", live: true, children: [
      { id: "appointments", label: "Appointment Calendar", live: true },
      { id: "cancellations", label: "Cancellations" },
      { id: "completed", label: "Completed Appointments" },
      { id: "uncompleted", label: "Uncompleted Appointments" }
    ] },
    { id: "schedule", label: "Schedule" },
    { id: "services", label: "Services" },
    { id: "employees", label: "Employees", children: [
      { id: "performance", label: "Performance" },
      { id: "employee-book", label: "Owner View - All Appointments" },
      { id: "employee-owner", label: "Appointment Book", staffId: "owner" }
    ] },
    // 11/23 (Tom): Financials ▾ Summary · Income · Expenses — each its own page
    { id: "financials", label: "Financials", children: [{ id: "financials", label: "Summary" }, { id: "fin-income", label: "Income" }, { id: "fin-expenses", label: "Expenses" }] },
    { id: "photos", label: "Photos" },
    { id: "announcements", label: "Announcements" },
    { id: "business", label: "Business Info" },
    { id: "customers", label: "Customers" },
    { id: "sales-reports", label: "Sales Reports" },
    { id: "settings", label: "Settings" }
  ],
  shop: {
    logo: "images/logo.png", heroImage: "images/park-place.jpg",
    // 11/22 (Tom): no "Classic Grooming Is Timeless" — his own words go here once he tells us
    classicHero: false,
    name: "The Village Barber", pageTitle: "The Village Barber | Your new website (preview)",
    heroTitle: "Good cuts. Fair prices. Right here on Main Street.",
    heroSubtitle: "This is a preview of your new website. Book an appointment like your customer would, then see what you'd see as the owner.",
    addressLine1: "751 Main St (Park Place)", addressLine2: "Sanford, Maine",
    phoneDisplay: "(207) 849-0126", phoneLink: "2078490126", email: "",
    hours: [{ days: "Tuesday - Saturday", hours: "9:00 AM - 5:00 PM" }, { days: "Sunday - Monday", hours: "Closed" }]
  },
  services: [
    { id: "mens-haircut", name: "Men's Haircut", price: 20, description: "A classic cut, finished clean." },
    { id: "hair-beard", name: "Hair / Beard", price: 24, description: "Haircut plus a beard trim." },
    { id: "buzz-cut", name: "Buzz Cut", price: 18, description: "One length all over, quick and clean." },
    { id: "buzz-beard", name: "Buzz / Beard", price: 22, description: "Buzz cut plus a beard trim." },
    { id: "beard", name: "Beard", price: 7, description: "Beard trim and tidy edges." }
  ],
  booking: { appointmentLengthMinutes: 30 },
  barbers: [
    { id: "owner", name: "Barber", photo: "images/barber.jpg", cardSpecialty: "Owner", bio: "Your own words about you and your shop go here.",
      serviceIds: ["mens-haircut", "hair-beard", "buzz-cut", "buzz-beard", "beard"], schedule: { workingDays: [2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" } }
  ],
  photos: [
    { src: "images/shop-inside.jpg", alt: "Inside The Village Barber" },
    { src: "images/sign.jpg", alt: "The Village Barber sign" },
    { src: "images/tools.jpg", alt: "Scissors and clippers at The Village Barber" }
  ]
};
