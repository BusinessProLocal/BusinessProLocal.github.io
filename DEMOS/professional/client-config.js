window.SHOP_CONFIG = {
  demo: { id: "demo-classic-cuts", tier: "professional", label: "Professional", staffHeading: "Meet the Barbers", staffLabel: "a barber" },
  ownerTabs: [
    { id: "dashboard", label: "Dashboard", live: true },
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
      { id: "employee-book", label: "Owner View - All Appointments" },
      { id: "employee-riley", label: "Appointment Book", staffId: "riley" },
      { id: "employee-casey", label: "Appointment Book", staffId: "casey" }
    ] },
    { id: "financials", label: "Financials", children: [{ id: "financials", label: "Financial Overview" }] },
    { id: "photos", label: "Photos" },
    { id: "announcements", label: "Announcements" },
    { id: "business", label: "Business Info" },
    { id: "customers", label: "Customers" },
    { id: "sales-reports", label: "Sales Reports" },
    { id: "settings", label: "Settings" }
  ],
  shop: {
    name: "Classic Cuts Barbershop", pageTitle: "Classic Cuts Barbershop | Professional DEMO",
    heroTitle: "A fresh cut. A classic experience.",
    heroSubtitle: "Precision cuts and easy scheduling. Try a booking without sending a text or making a payment.",
    addressLine1: "7 Clipper Lane", addressLine2: "Sanford, Maine",
    phoneDisplay: "207-4BARBER", email: "book@classiccuts.example",
    hours: [{ days: "Monday - Saturday", hours: "9:00 AM - 5:00 PM" }, { days: "Sunday", hours: "Closed" }]
  },
  services: [
    { id: "classic-cut", name: "Classic Cut", price: 28, description: "A tailored haircut with a clean finish." },
    { id: "beard-shape", name: "Beard Shape", price: 16, description: "Careful shaping and tidy edges." },
    { id: "cut-and-shape", name: "Cut & Beard Shape", price: 40, description: "The complete classic refresh." },
    { id: "kids-cut", name: "Kids Cut", price: 20, description: "A quick, comfortable cut for kids 12 and under." }
  ],
  booking: { appointmentLengthMinutes: 30 },
  barbers: [
    { id: "riley", name: "Mike Dalton", cardSpecialty: "Classic cuts & tidy tapers", bio: "Sharp cuts and good conversation.",
      serviceIds: ["classic-cut", "beard-shape", "cut-and-shape", "kids-cut"], schedule: { workingDays: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "17:00" } },
    { id: "casey", name: "Casey Brooks", cardSpecialty: "Beard shaping & modern cuts", bio: "A fresh perspective on timeless styles.",
      serviceIds: ["classic-cut", "beard-shape", "cut-and-shape", "kids-cut"], schedule: { workingDays: [1, 2, 3, 4, 5, 6], startTime: "10:00", endTime: "17:00" } }
  ],
  photos: [{ src: "../../CUSTOMER/images/barber-shop-hero.jpg", alt: "Inside Classic Cuts Barbershop" }]
};
