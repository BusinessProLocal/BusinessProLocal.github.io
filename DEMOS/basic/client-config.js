window.SHOP_CONFIG = {
  demo: { id: "demo-main-street-bakery", tier: "basic", label: "Basic" },
  shop: {
    name: "Bakers Way Bakery", pageTitle: "Bakers Way Bakery | Basic DEMO",
    heroTitle: "Fresh from the oven. Made for your day.",
    heroSubtitle: "Small-batch bread, pastries, and sweet treats. Stop in or call to order.",
    addressLine1: "13 Bakers Way", addressLine2: "Portland, Maine",
    phoneDisplay: "207-4BAKERY", email: "hello@bakersway.example",
    hours: [{ days: "Tuesday - Friday", hours: "7:00 AM - 4:00 PM" }, { days: "Saturday - Sunday", hours: "8:00 AM - 2:00 PM" }, { days: "Monday", hours: "Closed" }]
  },
  services: [],
  menu: [
    { name: "Pastries", items: [
      { text: "Butter croissant $3.75", photo: "../assets/bakery/croissant.jpg" },
      { text: "Cinnamon roll with icing $4.25", photo: "../assets/bakery/cinnamon-roll.jpg" },
      { text: "Blueberry muffin $3.50", photo: "../assets/bakery/blueberry-muffin.jpg" },
      { text: "Cherry danish $3.95", photo: "../assets/bakery/cherry-danish.jpg" }
    ] },
    { name: "Cupcakes", items: [
      { text: "Vanilla, chocolate or strawberry $3.50 each / $19 half dozen", photo: "../assets/bakery/cupcakes.jpg" }
    ] },
    { name: "Cookies", items: [
      { text: "Chocolate chip $2.25", photo: "../assets/bakery/chocolate-chip-cookie.jpg" },
      { text: "Oatmeal raisin $2.25", photo: "../assets/bakery/oatmeal-cookie.jpg" },
      { text: "Candy-coated chocolate $2.50", photo: "../assets/bakery/candy-cookie.jpg" }
    ] },
    { name: "Donuts", items: [
      { text: "Glazed $1.75", photo: "../assets/bakery/glazed-donut.jpg" },
      { text: "Chocolate frosted $2.25", photo: "../assets/bakery/chocolate-donut.jpg" },
      { text: "Strawberry sprinkle $2.25", photo: "../assets/bakery/strawberry-donut.jpg" },
      { text: "Powdered sugar $1.95", photo: "../assets/bakery/powdered-donut.jpg" },
      { text: "Dozen, mixed $18.00", photo: "../assets/bakery/mixed-donuts.jpg" }
    ] },
    { name: "Breads", items: [
      { text: "Sourdough loaf $7.50", photo: "../assets/bakery/sourdough.jpg" },
      { text: "French baguette $4.50", photo: "../assets/bakery/baguette.jpg" },
      { text: "Dinner rolls, half dozen $5.00", photo: "../assets/bakery/dinner-rolls.jpg" }
    ] }
  ],
  photos: [{ src: "../assets/bakery-case.jpg", alt: "Fresh bakery treats in the display case" }],
  barbers: []
};
