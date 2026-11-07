// TEST 2 — card first, then PAY NOW or PAY AT STORE, with manage links
document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // BUSINESS PRO BARBER TEMPLATE
  // CUSTOMER WEBSITE ENGINE
  // ============================================================

  const config = window.SHOP_CONFIG;

  if (!config) {
    console.error(
      "SHOP_CONFIG was not found. Make sure shop-config.js loads before script.js."
    );
    return;
  }

  const shop = config.shop || {};
  const services = Array.isArray(config.services)
    ? config.services
    : [];
  const profiles = Array.isArray(config.barbers)
    ? config.barbers
    : [];
  const bookingSettings = config.booking || {};
  // 11/2 (Tom): tier switches (lib/tierFeatures.js) — which parts of the engine this
  // shop's plan has. No features from the server = everything on (demos, previews).
  const tierFeatures = config.features || {};
  const BOOKING_ON = tierFeatures.booking !== false;
  const STORE_ON = tierFeatures.store !== false;
  const BUSINESS_ID = new URLSearchParams(window.location.search).get("businessId") || bookingSettings.businessId || "business-001";
  let sharedAvailability = [];
  let ownBookings = [];
  let availabilityReady = false;
  const smsSettings = config.sms || {};
  const announcementSettings = config.announcements || {};
  const ANNOUNCEMENT_STORAGE_KEY =
    announcementSettings.storageKey ||
    "businessProProfessionalBarberTemplateAnnouncements";

  // 11/1 (Tom): what this shop calls its people — Barbers, Stylists, Artists, Techs... (Site Builder sets it)
  const STAFF_ONE = String(config.staffWord || "Barber");
  const STAFF_MANY = String(config.staffPlural || (STAFF_ONE === "Staff" ? "Team" : STAFF_ONE + "s"));
  const staffLower = STAFF_ONE.toLowerCase();
  // gold line icons (phone, map pin, clock, Facebook, Instagram) for the luxury look
  const LUX_ICONS = {
    phone: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>',
    pin: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    clock: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    facebook: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7.5H16l.5-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.6V4.3A21 21 0 0 0 14.4 4c-2.4 0-4 1.5-4 4.1v2.4H8v3h2.4V21z" fill="currentColor"/></svg>',
    instagram: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
    x: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4.6l3.9 5.4L17 4h2.6l-5.9 6.9L20.5 20h-4.6l-4.2-5.8L6.6 20H4l6.4-7.4z" fill="currentColor"/></svg>',
    tiktok: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3h3a4.5 4.5 0 0 0 3.5 3.6v3a7.4 7.4 0 0 1-3.5-1.1v6.3a5.8 5.8 0 1 1-5.8-5.8h.6v3.1a2.8 2.8 0 1 0 2.2 2.7z" fill="currentColor"/></svg>',
    mail: '<svg class="lux-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 7l8.5 6 8.5-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  };
  // 11/2 (Tom): the shop email customers see (footer, Stylists, Contact) — "" when none
  const SHOP_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shop.email || "").trim()) ? String(shop.email).trim() : "";

  // 11/2 (Tom): the luxury look (salons) calls the last page "Contact", like Bot's designs
  const CONTACT_LABEL = String(config.contactLabel || (String(config.siteStyle || "").toLowerCase() === "luxury" ? "Contact" : "Location & Hours"));
  document.querySelectorAll('nav a[href="#contact"]').forEach(link => { link.textContent = CONTACT_LABEL; });
  const aStaff = (/^[aeiou]/i.test(STAFF_ONE) ? "an " : "a ") + staffLower;
  (function applyStaffWords() {
    const heading = document.querySelector("#barbers h2");
    if (heading) heading.textContent = `Meet Our ${STAFF_MANY}`;
    document.querySelectorAll('a[href="#barbers"], a[href="index.html#barbers"]').forEach(link => { link.textContent = STAFF_MANY; });
    const label = document.querySelector('label[for="barber-select"]');
    if (label) label.textContent = `Choose Your ${STAFF_ONE}`;
  })();

  const bookableBarbers = profiles.filter(
    profile =>
      profile.profileType !== "business-pro-local" &&
      Array.isArray(profile.serviceIds) &&
      profile.serviceIds.length > 0
  );

  const APPOINTMENT_LENGTH =
    Number(bookingSettings.appointmentLengthMinutes) || 30;

  const DAYS_AVAILABLE =
    Number(bookingSettings.daysAvailableInAdvance) || 365;

  // How long the picked service takes (the time set on the owner's Services page);
  // services with no time set use the shop's standard appointment length.
  function serviceMinutes(serviceId) {
    const id = serviceId !== undefined
      ? serviceId
      : (serviceSelect ? serviceSelect.value : "");
    const found = services.find(item => item && item.id === id);
    const minutes = Number(found && found.durationMinutes);
    return Number.isInteger(minutes) && minutes >= 5 && minutes <= 480 ? minutes : APPOINTMENT_LENGTH;
  }

  const STORAGE_KEY =
    bookingSettings.storageKey ||
    "businessProProfessionalBarberTemplateBookings";

  // Shared with the Business Pro Professional Owner Interface.
  const TIME_OFF_STORAGE_KEY =
    "businessProProfessionalBarberTemplateTimeOff";

  const BUSINESS_STATUS_URL =
    "https://business-pro-local.onrender.com/business-status";

  let businessIsOpen = true;
  let businessClosures = [];
  const SMS_SERVER_URL =
    smsSettings.serverUrl || "";

  const APPOINTMENT_CHECKOUT_URL =
    "https://business-pro-local.onrender.com/create-appointment-checkout-session";

  const APPOINTMENT_STATUS_URL =
    "https://business-pro-local.onrender.com/appointment-checkout-status";

  const APPOINTMENT_NOTIFICATION_URL =
    "https://business-pro-local.onrender.com/send-paid-appointment-notifications";

  // 11/1 (Tom): "sorry we canceled" discount on a rebooking from the cancel text's link
  const RESCHEDULE_OFFER_URL =
    "https://business-pro-local.onrender.com/api/reschedule-offer";



  // ============================================================
  // PAGE ELEMENTS
  // ============================================================

  const shopName =
    document.getElementById("shop-name");

  const hero =
    document.getElementById("home");

  const heroTitle =
    document.getElementById("hero-title");

  const heroSubtitle =
    document.getElementById("hero-subtitle");

  const shopLogo =
    document.getElementById("shop-logo");

  const heroLogo =
    document.getElementById("hero-logo");

  const shopPhotosSection =
    document.getElementById("shop-photos");

  const shopPhotosGrid =
    document.getElementById("shop-photos-grid");

  const shopLinks =
    document.getElementById("shop-links");

  const servicesList =
    document.getElementById("services-list");

  const barberSelector =
    document.getElementById("barber-selector");

  const shopAddressLine1 =
    document.getElementById("shop-address-line1");

  const shopAddressLine2 =
    document.getElementById("shop-address-line2");

  const shopPhoneLink =
    document.getElementById("shop-phone-link");

  const shopHours =
    document.getElementById("shop-hours");

  const footerShopName =
    document.getElementById("footer-shop-name");

  const profileModal =
    document.getElementById("barber-profile-modal");

  const profileContent =
    document.getElementById("barber-profile-content");

  const closeProfileButton =
    document.getElementById("close-barber-profile");

  const bookingModal =
    document.getElementById("booking-modal");

  const closeBookingButton =
    document.getElementById("close-booking");

  const barberSelect =
    document.getElementById("barber-select");

  const barberSelectLabel =
    document.querySelector('label[for="barber-select"]');

  const selectedBarberDisplay =
    document.getElementById("selected-barber");

  const serviceSelect =
    document.getElementById("service");

  const dateInput =
    document.getElementById("appointment-date");

  const bookingDateCalendar =
    document.getElementById("booking-date-calendar");

  const bookingDateGrid =
    document.getElementById("booking-date-grid");

  const bookingDateMonthLabel =
    document.getElementById("booking-date-month-label");

  const bookingDatePrev =
    document.getElementById("booking-date-prev");

  const bookingDateNext =
    document.getElementById("booking-date-next");

  const bookingDateNote =
    document.getElementById("booking-date-note");

  const timeSelect =
    document.getElementById("appointment-time");

  const nameInput =
    document.getElementById("customer-name");

  const phoneInput =
    document.getElementById("customer-phone");

  // Dashes go in by themselves as the 10-digit number is typed: 2074087983 → 207-408-7983 (Tom 10/28).
  function formatPhoneDashes(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", event => {
      // Backspacing over a dash just removes the dash — don't put it right back.
      if (event.inputType === "deleteContentBackward" && /-$/.test(phoneInput.value)) return;
      const formatted = formatPhoneDashes(phoneInput.value);
      if (formatted !== phoneInput.value) phoneInput.value = formatted;
    });
  }

  const smsConsent =
    document.getElementById("sms-consent");

  const confirmButton =
    document.getElementById("confirm-booking");

  const confirmationMessage =
    document.getElementById("confirmation-message");

  const smsPolicyLinks =
    document.getElementById("sms-policy-links");

  const privacyPolicyLink =
    document.getElementById("privacy-policy-link");

  const termsPolicyLink =
    document.getElementById("terms-policy-link");

  const ctaButton =
    document.querySelector(".get-this-website-button");


  let selectedBarberId = "";
  let requestedServiceId = "";
  let bookingCalendarMonth = new Date();
  bookingCalendarMonth.setDate(1);
  bookingCalendarMonth.setHours(0, 0, 0, 0);


  // ============================================================
  // START WEBSITE
  // ============================================================

  buildShopInformation();
  buildCustomerAnnouncements();
  buildServices();
  buildProfileCards();
  buildBarberSelect();
  configureBookingCalendar();
  configurePolicyLinks();
  attachGeneralBookingButtons();
  configureCtaScrollGlow();
  applySiteStyle();
  buildHeroTeam();
  setUpSitePages();
  openBookingFromUrl();


  // ============================================================
  // 11/1 (Tom): WEBSITE STYLE — "luxury" = the dark + gold look (Group 3),
  // real gold metal finish. Hair salons get it by default (Site Builder / server set it).
  // ============================================================
  function applySiteStyle() {
    const style = String(config.siteStyle || "").toLowerCase();
    if (style === "luxury") document.body.classList.add("style-luxury");
    buildHeaderPhotos();
    buildLuxuryStylists();
    buildLuxuryServices();
    buildGallery();
    buildLuxuryReviews();
    buildLuxuryContact();
    buildPageBanners();
    buildLuxuryFooter();
    buildFooterDirections();
    buildLuxuryLogo();
    buildLetsConnect();
  }

  // ============================================================
  // 11/1 (Tom): STYLISTS PAGE — matched to Bot's Stylists design.
  // Each stylist gets a big card: photo on the left fading into the black, her name in gold,
  // her specialty in gold italics, a thin gold line, her bio, then "Book with Dana" and
  // "See Her Work".
  // ============================================================
  function buildLuxuryStylists() {
    if (!document.body.classList.contains("style-luxury") || !barberSelector) return;
    const team = profiles.filter(profile => profile.profileType !== "business-pro-local");
    if (!team.length) return;
    const section = document.getElementById("barbers");
    const heading = section && section.querySelector("h2");
    if (heading && !section.querySelector(".section-intro")) {
      const intro = document.createElement("p");
      intro.className = "section-intro";
      intro.textContent = `A talented team, each with her own style and specialty, here to bring your vision to life.`;
      heading.insertAdjacentElement("afterend", intro);
    }
    barberSelector.innerHTML = "";
    barberSelector.classList.add("stylist-cards");
    team.forEach(profile => {
      const card = document.createElement("article");
      card.className = "stylist-card";
      card.dataset.barberId = profile.id;
      const first = String(profile.name || "").split(" ")[0];
      const photo = safeImageUrl(profile.profilePhoto);
      card.innerHTML = `
        <div class="stylist-card-photo">${photo ? `<img src="${escapeAttribute(photo)}" alt="${escapeAttribute(profile.name)}">` : `<span>${escapeHTML(first.charAt(0))}</span>`}</div>
        <div class="stylist-card-info">
          <h3>${escapeHTML(profile.name)}</h3>
          ${profile.cardSpecialty ? `<p class="stylist-card-specialty">${escapeHTML(profile.cardSpecialty)}</p>` : ""}
          ${profile.bio ? `<p class="stylist-card-bio">${escapeHTML(profile.bio)}</p>` : ""}
          <div class="stylist-card-buttons">
            <button type="button" class="book-button stylist-book">Book with ${escapeHTML(first)}</button>
            <button type="button" class="stylist-work">See Her Work</button>
          </div>
        </div>
      `;
      card.querySelector(".stylist-book").addEventListener("click", () => openBookingModal(profile.id));
      card.querySelector(".stylist-work").addEventListener("click", () => openProfile(profile.id));
      card.querySelector(".stylist-card-photo").addEventListener("click", () => openProfile(profile.id));
      barberSelector.appendChild(card);
    });
    // 11/2 (Tom): the Stylists page ends with the cards (the "who to book with" box is gone)
  }

  // ============================================================
  // 11/1 (Tom): SERVICES & PRICES — matched to Bot's design: a luxury menu in one gold-edged
  // panel. Each line: service name, how long it takes (italic, under the name), a dotted gold
  // line to the price, and a gold Book button. Filled from the same Services list the
  // Site Builder and owner portal edit (name, price, time) — nothing extra to keep up.
  // ============================================================
  function serviceTimeText(minutes) {
    const total = Number(minutes) || 0;
    if (total <= 0) return "";
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return [hours ? `${hours} hr` : "", mins ? `${mins} min` : ""].filter(Boolean).join(" ");
  }

  function buildLuxuryServices() {
    if (!document.body.classList.contains("style-luxury") || !servicesList || !services.length) return;
    const section = document.getElementById("services");
    const heading = section && section.querySelector("h2");
    if (heading && !section.querySelector(".section-intro")) {
      const intro = document.createElement("p");
      intro.className = "section-intro";
      intro.textContent = `Every service includes a consultation with your ${staffLower}.`;
      heading.insertAdjacentElement("afterend", intro);
    }
    servicesList.innerHTML = "";
    servicesList.classList.add("price-menu");
    services.forEach(service => {
      const row = document.createElement("div");
      row.className = "price-row";
      const time = serviceTimeText(service.durationMinutes);
      row.innerHTML = `
        <div class="price-name">
          <strong>${escapeHTML(service.name)}</strong>
          ${time ? `<em>${escapeHTML(time)}</em>` : ""}
        </div>
        <span class="price-dots" aria-hidden="true"></span>
        <span class="price-amount">${formatPrice(service.price)}</span>
        <button type="button" class="price-book" aria-label="Book ${escapeAttribute(service.name)}">Book</button>
      `;
      row.querySelector(".price-book").addEventListener("click", () => openBookingModal("", service.id));
      servicesList.appendChild(row);
    });
  }

  // ============================================================
  // 11/1 (Tom): GALLERY ("Our Work") — matched to Bot's Gallery design. Every work photo
  // the stylists already have (their gallery) in one grid, filter pills by stylist, and a
  // "Book This Look" button on each photo that books with the stylist who did it.
  // Nothing new to edit: stylists add photos the same way they always have.
  // ============================================================
  function buildGallery() {
    const section = document.getElementById("gallery");
    const grid = document.getElementById("gallery-grid");
    const filters = document.getElementById("gallery-filters");
    const navGallery = document.getElementById("nav-gallery");
    if (!section || !grid || !filters) return;
    const team = profiles.filter(profile => profile.profileType !== "business-pro-local");
    const items = [];
    team.forEach(profile => {
      (Array.isArray(profile.gallery) ? profile.gallery : []).forEach(photo => {
        const src = safeImageUrl(photo && photo.image);
        if (src) items.push({ src, caption: String((photo && photo.caption) || ""), profile });
      });
    });
    section.hidden = items.length === 0;
    if (navGallery) navGallery.hidden = items.length === 0;
    if (!items.length) return;
    const intro = document.createElement("p");
    intro.className = "section-intro";
    intro.textContent = `Real looks from our ${STAFF_MANY.toLowerCase()}' chairs.`;
    section.querySelector("h2").insertAdjacentElement("afterend", intro);

    const withPhotos = team.filter(profile => items.some(item => item.profile === profile));
    const draw = who => {
      grid.innerHTML = "";
      items.filter(item => !who || item.profile.id === who).forEach(item => {
        const first = String(item.profile.name || "").split(" ")[0];
        const figure = document.createElement("figure");
        figure.className = "gallery-tile";
        // 11/2 (Tom): name and picture always together — her circle photo next to "by Dana"
        const face = safeImageUrl(item.profile.profilePhoto);
        figure.innerHTML = `
          <img src="${escapeAttribute(item.src)}" alt="${escapeAttribute(item.caption || `Work by ${item.profile.name}`)}" loading="lazy">
          <figcaption>
            <span class="gallery-by">${face ? `<img class="mini-face" src="${escapeAttribute(face)}" alt="${escapeAttribute(first)}">` : ""}${escapeHTML(item.caption ? `${item.caption} · by ${first}` : `by ${first}`)}</span>
            <button type="button" class="book-button gallery-book">Book This Look</button>
          </figcaption>
        `;
        figure.querySelector(".gallery-book").addEventListener("click", () => openBookingModal(item.profile.id));
        grid.appendChild(figure);
      });
      filters.querySelectorAll("button").forEach(button => button.classList.toggle("is-on", button.dataset.who === (who || "")));
    };
    filters.innerHTML = "";
    [{ id: "", name: "All" }, ...withPhotos].forEach(profile => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.who = profile.id;
      // 11/2 (Tom): each stylist's button has her circle headshot above her name
      const face = profile.id ? safeImageUrl(profile.profilePhoto) : "";
      if (face) {
        button.classList.add("has-face");
        button.innerHTML = `<img class="filter-face" src="${escapeAttribute(face)}" alt="${escapeAttribute(profile.name || "")}"><span>${escapeHTML(String(profile.name || "").split(" ")[0])}</span>`;
      } else if (!profile.id && withPhotos.some(person => safeImageUrl(person.profilePhoto))) {
        // "All" = a gold circle the same size as the faces
        button.classList.add("has-face");
        button.innerHTML = `<span class="filter-face filter-all">All</span><span>All Work</span>`;
      } else {
        button.textContent = String(profile.name || "").split(" ")[0];
      }
      button.addEventListener("click", () => draw(profile.id));
      filters.appendChild(button);
    });
    filters.hidden = withPhotos.length < 2;
    draw("");
  }

  // ============================================================
  // 11/1 (Tom): REVIEWS — matched to Bot's Reviews design. Real reviews live on Google (we never
  // put made-up reviews on a shop's site): big gold stars, "Read Our Google Reviews" and
  // "Leave a Review", plus a QR code to leave one in 30 seconds. Shows when the shop has a Google link.
  // ============================================================
  function buildLuxuryReviews() {
    if (!document.body.classList.contains("style-luxury")) return;
    const section = document.getElementById("reviews");
    const read = document.getElementById("reviews-read");
    if (!section || section.hidden || !read || section.querySelector(".review-panel")) return;
    const links = shop.links || {};
    const readUrl = read.href;
    let writeUrl = readUrl;
    try {
      const custom = new URL(String(links.googleReview || ""));
      if (/^https?:$/.test(custom.protocol)) writeUrl = custom.href;
    } catch (error) { /* no separate review link: same Google page */ }
    [...section.children].forEach(child => { if (child.tagName !== "H2") child.remove(); });
    const intro = document.createElement("p");
    intro.className = "section-intro";
    intro.textContent = "Loved your visit? We'd love to hear about it.";
    const panel = document.createElement("div");
    panel.className = "review-panel";
    panel.innerHTML = `
      <div class="review-stars" aria-label="5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <p class="review-lead">See what our clients are saying on Google</p>
      <div class="match-panel-buttons">
        <a class="book-button" href="${escapeAttribute(readUrl)}" target="_blank" rel="noopener">Read Our Google Reviews</a>
        <a class="match-services" href="${escapeAttribute(writeUrl)}" target="_blank" rel="noopener">Leave a Review</a>
      </div>
    `;
    const quick = document.createElement("div");
    quick.className = "review-quick";
    quick.innerHTML = `
      <a class="review-qr" href="${escapeAttribute(writeUrl)}" target="_blank" rel="noopener" aria-label="Leave a review">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(writeUrl)}" alt="QR code to leave a review" loading="lazy">
      </a>
      <div class="review-steps">
        <h3>Leave a review in 30 seconds</h3>
        <ol>
          <li>Scan the code or tap Leave a Review</li>
          <li>Tap the stars</li>
          <li>Tell us about your visit</li>
        </ol>
      </div>
    `;
    section.append(intro, panel, quick);
  }

  // Page banners: a wide picture across the top of each section page (Bot pictures, set per shop
  // in shop.pageBanners: { stylists: "...", services: "...", ... }). No picture = no banner.
  function buildPageBanners() {
    if (!document.body.classList.contains("style-luxury")) return;
    const banners = shop.pageBanners && typeof shop.pageBanners === "object" ? shop.pageBanners : {};
    const sections = { barbers: "stylists", services: "services", gallery: "gallery", "shop-photos": "photos", reviews: "reviews", contact: "contact" };
    Object.entries(sections).forEach(([id, key]) => {
      const src = safeImageUrl(banners[key] || (key === "stylists" ? banners.team : ""));
      const section = document.getElementById(id);
      if (!src || !section || section.querySelector(".page-banner")) return;
      const banner = document.createElement("div");
      banner.className = "page-banner";
      banner.style.backgroundImage = `url("${escapeCssUrl(src)}")`;
      section.insertBefore(banner, section.firstChild);
    });
  }

  // 11/3 (Tom): tap the pin at the bottom → Google Maps opens with directions to the shop
  // (on phones it opens the Google Maps app). Only when the shop has an address.
  function directionsUrl() {
    const address = [shop.addressLine1, shop.addressLine2].filter(Boolean);
    if (!address.length) return "";
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([shop.name, ...address].filter(Boolean).join(", "))}`;
  }

  // the plain look's footer gets the same pin + Get Directions (the luxury look builds its own)
  function buildFooterDirections() {
    if (document.body.classList.contains("style-luxury")) return;
    const footer = document.querySelector("footer");
    const url = directionsUrl();
    if (!footer || !url || footer.querySelector(".footer-directions")) return;
    const address = [shop.addressLine1, shop.addressLine2].filter(Boolean).join(", ");
    const line = document.createElement("p");
    line.className = "footer-directions";
    line.innerHTML = `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener" aria-label="Get directions to ${escapeAttribute(shop.name || "the shop")} on Google Maps">${LUX_ICONS.pin}<span>${escapeHTML(address)}</span><strong>Get Directions</strong></a>`;
    const name = document.getElementById("footer-shop-name");
    if (name && name.nextSibling) footer.insertBefore(line, name.nextSibling); else footer.appendChild(line);
  }

  // 11/2 (Tom): footer matched to Bot's designs — gold swoop line across the top, the shop's
  // logo (or name) on the left, then phone | address | Facebook + Instagram in one row.
  function buildLuxuryFooter() {
    if (!document.body.classList.contains("style-luxury")) return;
    const footer = document.querySelector("footer");
    if (!footer || footer.querySelector(".lux-footer")) return;
    const digits = String(shop.phoneDisplay || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    const phone = digits.length === 10 ? formatPhoneDashes(digits) : (shop.phoneDisplay || "");
    const address = [shop.addressLine1, shop.addressLine2].filter(Boolean).join(", ");
    const logo = safeImageUrl(shop.logo);
    const socials = socialIconLinks();
    const box = document.createElement("div");
    box.className = "lux-footer";
    box.innerHTML = `
      ${logo
        ? `<p class="lux-footer-name has-logo"><img src="${escapeAttribute(logo)}" alt="${escapeAttribute(shop.name || "")}"></p>`
        : `<p class="lux-footer-name">${escapeHTML(shop.name || "")}</p>`}
      ${phone ? `<a class="lux-footer-item" href="${shop.phoneLink ? `tel:${escapeAttribute(shop.phoneLink)}` : "#"}">${LUX_ICONS.phone}<span>${escapeHTML(phone)}</span></a>` : ""}
      ${SHOP_EMAIL ? `<span class="lux-footer-item lux-footer-email"><a href="mailto:${escapeAttribute(SHOP_EMAIL)}">${LUX_ICONS.mail}<span>${escapeHTML(SHOP_EMAIL)}</span></a><button type="button" class="copy-email" aria-label="Copy the email address">Copy</button></span>` : ""}
      ${address ? `<a class="lux-footer-item lux-footer-directions" href="${escapeAttribute(directionsUrl())}" target="_blank" rel="noopener" aria-label="Get directions to ${escapeAttribute(shop.name || "the shop")} on Google Maps"><span class="dir-line">${LUX_ICONS.pin}<span>${escapeHTML(address)}</span></span><small>Get Directions</small></a>` : ""}
      ${socials ? `<span class="lux-footer-item lux-footer-social">${socials}</span>` : ""}
      <div class="lux-footer-menu" role="navigation" aria-label="Footer menu" hidden></div>
    `;
    footer.insertBefore(box, footer.firstChild);
    // 11/2 (Tom): one tap copies the email (easy on a computer); tapping the address opens their email app
    const copy = box.querySelector(".copy-email");
    if (copy) copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(SHOP_EMAIL); copy.textContent = "Copied ✓"; }
      catch (error) { window.prompt("Copy the email:", SHOP_EMAIL); }
      setTimeout(() => { copy.textContent = "Copy"; }, 2000);
    });
    const name = document.getElementById("footer-shop-name");
    if (name) name.hidden = true;
  }

  // the shop's Facebook / Instagram as gold square icons ("" when the shop has neither)
  function socialIconLinks() {
    const links = shop.links || {};
    // 11/2 (Tom): Facebook, Instagram, X, TikTok — only the ones the shop has
    const names = { facebook: "Facebook", instagram: "Instagram", x: "X", tiktok: "TikTok" };
    return Object.keys(names).map(key => {
      let url;
      try { url = new URL(String(links[key] || "")); } catch (error) { return ""; }
      if (!/^https?:$/.test(url.protocol)) return "";
      const label = names[key];
      return `<a class="lux-social" href="${escapeAttribute(url.href)}" target="_blank" rel="noopener" aria-label="${label}">${LUX_ICONS[key]}</a>`;
    }).join("");
  }

  // 11/2 (Tom): the swoop is part of the shop's logo — when the shop has a logo picture,
  // the top bar shows the logo where the name goes (the name stays in the page for Google).
  function buildLuxuryLogo() {
    if (!document.body.classList.contains("style-luxury")) return;
    const logo = document.getElementById("shop-logo");
    if (!logo || logo.hidden || !logo.getAttribute("src")) return;
    document.body.classList.add("header-logo-only");
  }

  // 11/2 (Tom): "Let's Connect" with Facebook + Instagram at the bottom of the Stylists and
  // Contact pages (Bot's designs). Only when the shop has at least one of them.
  function buildLetsConnect() {
    if (!document.body.classList.contains("style-luxury")) return;
    const icons = socialIconLinks();
    if (!icons) return;
    ["barbers", "contact"].forEach(id => {
      const section = document.getElementById(id);
      if (!section || section.querySelector(".lets-connect")) return;
      const box = document.createElement("div");
      box.className = "lets-connect";
      box.innerHTML = `<p class="lets-connect-title">Let's Connect</p><div class="lets-connect-icons">${icons}</div>`;
      section.appendChild(box);
    });
  }

  // 11/2 (Tom): CONTACT page matched to Bot's Contact design. Left: Call Us, Visit Us,
  // Our Hours (gold circle icons) and a Book button. Right: "Send Us a Message" — ONLY when the shop
  // has an email: it opens the visitor's email to the shop, already filled in (11/2 Tom: no texting
  // from the website — that needs our server, which ProGo doesn't have). No email = no message box.
  function buildLuxuryContact() {
    if (!document.body.classList.contains("style-luxury")) return;
    const section = document.getElementById("contact");
    if (!section || section.querySelector(".contact-layout")) return;
    const digits = String(shop.phoneDisplay || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    const phone = digits.length === 10 ? formatPhoneDashes(digits) : (shop.phoneDisplay || "");
    const phoneLink = shop.phoneLink || (digits.length === 10 ? `+1${digits}` : "");
    const address = [shop.addressLine1, shop.addressLine2].filter(Boolean);
    const shortDays = text => String(text || "")
      .replace(/Monday/g, "Mon").replace(/Tuesday/g, "Tue").replace(/Wednesday/g, "Wed")
      .replace(/Thursday/g, "Thu").replace(/Friday/g, "Fri").replace(/Saturday/g, "Sat").replace(/Sunday/g, "Sun")
      .replace(/\s+-\s+/g, "\u2013");
    const hours = (Array.isArray(shop.hours) ? shop.hours : []).filter(row => row && (row.days || row.hours));
    // 11/3 (Tom): Visit Us = Google Maps directions to the shop (their Google listing link only when there's no address)
    let mapUrl = directionsUrl();
    if (!mapUrl) {
      try {
        const google = new URL(String((shop.links || {}).google || ""));
        if (/^https?:$/.test(google.protocol)) mapUrl = google.href;
      } catch (error) { mapUrl = ""; }
    }

    const heading = section.querySelector("h2");
    if (heading) heading.textContent = "Contact Us";
    [...section.children].forEach(child => { if (child !== heading) child.hidden = true; });
    const intro = document.createElement("p");
    intro.className = "section-intro";
    intro.textContent = "We're here to help. Get in touch today.";
    const shopEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shop.email || "").trim()) ? String(shop.email).trim() : "";
    const layout = document.createElement("div");
    layout.className = shopEmail ? "contact-layout" : "contact-layout no-form";
    layout.innerHTML = `
      <div class="contact-info">
        ${phone ? `
        <a class="contact-row" href="${phoneLink ? `tel:${escapeAttribute(phoneLink)}` : "#"}">
          <span class="contact-icon">${LUX_ICONS.phone}</span>
          <span><strong>Call Us</strong><span>${escapeHTML(phone)}</span></span>
        </a>` : ""}
        ${address.length ? `
        <a class="contact-row" href="${escapeAttribute(mapUrl)}" target="_blank" rel="noopener">
          <span class="contact-icon">${LUX_ICONS.pin}</span>
          <span><strong>Visit Us</strong>${address.map(line => `<span>${escapeHTML(line)}</span>`).join("")}</span>
        </a>` : ""}
        ${hours.length ? `
        <div class="contact-row">
          <span class="contact-icon">${LUX_ICONS.clock}</span>
          <span><strong>Our Hours</strong>
            <span class="contact-hours">${hours.map(row => `<span>${escapeHTML(shortDays(row.days))}</span><span>${escapeHTML(row.hours || "")}</span>`).join("")}</span>
          </span>
        </div>` : ""}
        ${BOOKING_ON ? `<button type="button" class="book-button contact-book">Book Appointment</button>` : ""}
      </div>
      ${shopEmail ? `
      <form class="contact-form" novalidate>
        <h3>Send Us a Message</h3>
        <input name="name" type="text" placeholder="Your Name" autocomplete="name" required>
        <input name="email" type="email" placeholder="Your Email" autocomplete="email">
        <input name="phone" type="tel" placeholder="Phone Number" autocomplete="tel">
        <textarea name="message" rows="4" placeholder="Your Message" required></textarea>
        <button type="submit" class="book-button">Send Message</button>
        <p class="contact-form-note" hidden></p>
      </form>
      ` : ""}
    `;
    section.append(intro, layout);
    const book = layout.querySelector(".contact-book");
    if (book) book.addEventListener("click", () => openBookingModal("", ""));
    const form = layout.querySelector(".contact-form");
    if (form) form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const note = form.querySelector(".contact-form-note");
      const name = String(data.get("name") || "").trim();
      const message = String(data.get("message") || "").trim();
      if (!name || !message) {
        note.textContent = "Please add your name and a message.";
        note.hidden = false;
        return;
      }
      const lines = [message, "", `- ${name}`, String(data.get("phone") || "").trim(), String(data.get("email") || "").trim()].filter((line, index) => index < 3 || line);
      const body = lines.join("\n");
      const to = `mailto:${encodeURIComponent(shopEmail)}?subject=${encodeURIComponent(`Message from ${name}`)}&body=${encodeURIComponent(body)}`;
      window.location.href = to;
      note.textContent = "Opening your email...";
      note.hidden = false;
    });
  }

  // 11/1 (Tom): hairstyle samples in the top bar — 2 women on each side of the shop name,
  // blending into the black (no circles, no outlines). Luxury look only; computers and tablets.
  function buildHeaderPhotos() {
    if (!document.body.classList.contains("style-luxury")) return;
    const photos = (Array.isArray(shop.headerPhotos) ? shop.headerPhotos : []).map(safeImageUrl).filter(Boolean).slice(0, 4);
    const brand = document.querySelector("header .brand-line");
    const name = document.getElementById("shop-name");
    if (photos.length < 2 || !brand || !name) return;
    const half = Math.ceil(photos.length / 2);
    const side = (list, where) => {
      const box = document.createElement("div");
      box.className = `header-photos header-photos-${where}`;
      box.setAttribute("aria-hidden", "true");
      list.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.loading = "eager";
        box.appendChild(img);
      });
      return box;
    };
    brand.insertBefore(side(photos.slice(0, half), "left"), brand.firstChild);
    brand.appendChild(side(photos.slice(half), "right"));
    document.body.classList.add("header-has-photos");
  }


  // ============================================================
  // 11/1 (Tom): the stylists sit right under the Book Appointment button on the
  // front picture (luxury look). Tap a face to open her profile and work.
  // ============================================================
  function buildHeroTeam() {
    if (!document.body.classList.contains("style-luxury")) return;
    const content = document.querySelector("#home .hero-content");
    const team = profiles.filter(profile => profile.profileType !== "business-pro-local" && profile.profilePhoto).slice(0, 6);
    if (!content || team.length === 0) return;
    const row = document.createElement("div");
    row.className = "hero-team";
    row.setAttribute("aria-label", `Our ${STAFF_MANY.toLowerCase()}`);
    team.forEach(profile => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "hero-team-member";
      button.setAttribute("aria-label", `${profile.name}: see her profile and work`);
      button.innerHTML = `
        <img src="${escapeAttribute(profile.profilePhoto)}" alt="${escapeAttribute(profile.name)}">
        <span>${escapeHTML(profile.name)}</span>
      `;
      button.addEventListener("click", () => openProfile(profile.id));
      row.appendChild(button);
    });
    // the faces + "Meet Your Stylist" centered as one block under the Book button
    const wrap = document.createElement("div");
    wrap.className = "hero-team-wrap";
    wrap.appendChild(row);
    content.appendChild(wrap);
    // 11/1 (Tom): "Meet Your Stylist" right below the faces (opens the Stylists page)
    const caption = document.createElement("a");
    caption.className = "hero-team-caption";
    caption.href = "#barbers";
    caption.textContent = `Meet Your ${STAFF_ONE}`;
    caption.addEventListener("click", event => {
      event.preventDefault();
      if (typeof showPage === "function") showPage(staffPageKey(), { push: true });
    });
    wrap.appendChild(caption);
  }


  // ============================================================
  // 11/1 (Tom): SECTION PAGES — every menu item is its own page with its own web address
  //   /book/<shop>            Home: the full scroll (everything)
  //   /book/<shop>/stylists   Meet Our Stylists only (word follows the business type)
  //   /book/<shop>/services   Services & Prices only
  //   /book/<shop>/photos     Inside the Shop only
  //   /book/<shop>/reviews    Reviews only
  //   /book/<shop>/contact    Location & Hours only
  //   /book/<shop>/book       Home with the booking window open
  // Every section page ends with a big Book button. In the Site Builder preview the
  // menu switches pages in place (same look, no web address change).
  // ============================================================
  function staffPageKey() {
    return String(STAFF_MANY || "team").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "team";
  }

  function sitePages() {
    return [
      { key: "home", section: "home", label: "Home", anchor: "#home" },
      { key: staffPageKey(), section: "barbers", label: `Meet Our ${STAFF_MANY}`, anchor: "#barbers" },
      { key: "services", section: "services", label: "Services & Prices", anchor: "#services" },
      { key: "gallery", section: "gallery", label: "Our Work", anchor: "#gallery" },
      { key: "photos", section: "shop-photos", label: "Inside the Shop", anchor: "#shop-photos" },
      { key: "reviews", section: "reviews", label: "Reviews", anchor: "#reviews" },
      { key: "contact", section: "contact", label: CONTACT_LABEL === "Contact" ? "Contact Us" : CONTACT_LABEL, anchor: "#contact" }
    ];
  }

  // The shop's own address (/book/<shop>) when the server sent this page; none in previews.
  function siteHome() {
    const home = typeof window.SITE_HOME === "string" ? window.SITE_HOME : "";
    return /^\/book\/[a-z0-9][a-z0-9-]{0,80}$/i.test(home) ? home : "";
  }

  // 11/3 (Tom): a handed-off ProGo site (no server) — every page is its own folder: services/, stylists/...
  // (paths are from the site's top folder; sub-pages carry <base href="../">)
  function siteStatic() { return window.SITE_STATIC === true; }

  function pageUrl(key) {
    if (siteStatic()) return key === "home" ? "./" : `${key}/`;
    const home = siteHome();
    if (!home) return key === "home" ? "#home" : `#${key}`;
    return key === "home" ? home : `${home}/${key}`;
  }

  function pageFromAddress() {
    const pages = sitePages();
    const keys = pages.map(page => page.key).concat("book");
    // back/forward: the page this history step was on
    const fromHistory = String((history.state && history.state.page) || "").toLowerCase();
    if (keys.includes(fromHistory)) return fromHistory;
    const fromServer = String(window.SITE_PAGE || "").toLowerCase();
    if (keys.includes(fromServer)) return fromServer;
    const home = siteHome();
    if (home && location.pathname.indexOf(home + "/") === 0) {
      const rest = location.pathname.slice(home.length + 1).replace(/\/$/, "").toLowerCase();
      if (keys.includes(rest)) return rest;
    }
    const query = String(new URLSearchParams(location.search).get("page") || "").toLowerCase();
    if (keys.includes(query)) return query;
    return "home";
  }

  function sectionShows(id) {
    const section = document.getElementById(id);
    return Boolean(section) && !section.hidden;
  }

  function showPage(key, { push = false, scroll = true } = {}) {
    const pages = sitePages();
    let page = pages.find(row => row.key === key);
    const wantsBooking = key === "book";
    // a page with nothing on it (no shop photos, no Google link) = Home
    if (!page || (page.key !== "home" && !sectionShows(page.section))) page = pages[0];

    const main = document.querySelector("main");
    const sections = main ? [...main.querySelectorAll(":scope > section")] : [];
    // 11/2 (Tom): luxury look = Bot's designs: Home is just the front picture; every other part lives
    // on its own page (its own web address for Google) — click a tab, don't scroll
    const homeOnlyHero = document.body.classList.contains("style-luxury");
    sections.forEach(section => {
      const off = page.key === "home"
        ? homeOnlyHero && section.id !== "home"
        : section.id !== page.section;
      section.classList.toggle("page-off", off);
    });
    document.body.dataset.page = page.key;
    document.body.classList.toggle("section-page", page.key !== "home");
    showMenuPage(page.key);

    const cta = document.getElementById("page-book-cta");
    // luxury look: Stylists + Contact end with their own Book buttons and Let's Connect (Bot's designs)
    if (cta) cta.hidden = page.key === "home" || (document.body.classList.contains("style-luxury") && (page.section === "barbers" || page.section === "contact"));

    // menu: the page you're on is marked
    document.querySelectorAll("nav a[data-page]").forEach(link => {
      const on = link.dataset.page === page.key;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    // Google: each page has its own title and description
    const shopTitle = shop.name || "Our Shop";
    document.title = page.key === "home"
      ? (shop.pageTitle || shopTitle)
      : `${page.label} | ${shopTitle}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (!meta.dataset.homeDescription) meta.dataset.homeDescription = meta.content;
      const where = shop.addressLine2 ? ` in ${shop.addressLine2}` : "";
      const words = {
        services: `${shopTitle} services and prices${where}. Book online in seconds.`,
        contact: `${shopTitle} location, phone number and hours${where}.`,
        photos: `Take a look inside ${shopTitle}${where}.`,
        gallery: `See real hairstyles by the ${STAFF_MANY.toLowerCase()} at ${shopTitle}${where}.`,
        reviews: `Read and leave reviews for ${shopTitle}${where}.`
      };
      words[staffPageKey()] = `Meet the ${STAFF_MANY.toLowerCase()} at ${shopTitle}${where} and see their work.`;
      meta.content = page.key === "home" ? meta.dataset.homeDescription : (words[page.key] || meta.dataset.homeDescription);
    }

    if (push && (siteHome() || siteStatic())) {
      const url = wantsBooking ? pageUrl("book") : pageUrl(page.key);
      try { history.pushState({ page: wantsBooking ? "book" : page.key }, "", url + location.search.replace(/([?&])(booking|page)=[^&]*/g, "$1").replace(/[?&]+$/, "")); } catch (error) { /* preview frames can't change the address */ }
    }
    if (scroll) {
      try { window.scrollTo({ top: 0, behavior: "auto" }); } catch (error) { window.scrollTo(0, 0); }
    }
    if (wantsBooking && !(bookingModal && bookingModal.classList.contains("open"))) openBookingModal("", "");
  }

  // 11/3 (Tom): every website gets a ☰ menu on phones (rule from 11/2). The menu button shows the
  // page you're on ("☰ Menu · Services & Prices"); tap it to open the page list, picking a page closes it.
  function setUpPhoneMenu() {
    const header = document.querySelector("header");
    const nav = header && header.querySelector("nav");
    if (!nav || header.querySelector(".site-menu-toggle")) return;
    if (!nav.id) nav.id = "site-nav";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-menu-toggle";
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span class="site-menu-icon" aria-hidden="true">☰</span><span class="site-menu-label">Menu</span><span class="site-menu-page"></span>';
    nav.parentNode.insertBefore(toggle, nav);
    header.classList.add("has-site-menu");
    const setOpen = open => {
      header.classList.toggle("site-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!header.classList.contains("site-menu-open")));
    nav.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
  }

  function showMenuPage(key) {
    const label = document.querySelector("header .site-menu-page");
    if (!label) return;
    const link = document.querySelector(`header nav a[data-page="${key}"]`);
    const words = link ? link.textContent.trim() : "";
    label.textContent = words ? `· ${words}` : "";
  }

  function setUpSitePages() {
    setUpPhoneMenu();
    const pages = sitePages();

    // menu links: real web addresses, switched in place
    document.querySelectorAll("nav a").forEach(link => {
      const href = link.getAttribute("href") || "";
      // 11/1 (Tom): the booking tab — last on the right, solid gold so it stands out.
      // Hair salons (luxury look) call it "Treat Yourself"; the Site Builder can set its own words.
      if (link.classList.contains("open-booking")) {
        if (!BOOKING_ON) {
          link.remove();
          return;
        }
        const style = String(config.siteStyle || "").toLowerCase();
        link.textContent = String(config.bookTabLabel || (style === "luxury" ? "Treat Yourself" : "Book Now"));
        link.classList.add("nav-book");
        link.dataset.page = "book";
        link.setAttribute("href", pageUrl("book"));
        link.parentNode.appendChild(link);
        link.addEventListener("click", event => {
          event.preventDefault();
          if (siteHome()) { try { history.pushState({ page: "book" }, "", pageUrl("book")); } catch (error) { /* preview */ } }
        });
        return;
      }
      const page = pages.find(row => row.anchor === href || href === `index.html${row.anchor}`);
      if (!page) return;
      link.dataset.page = page.key;
      link.setAttribute("href", pageUrl(page.key));
      link.addEventListener("click", event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return; // new tab still works
        event.preventDefault();
        showPage(page.key, { push: true });
      });
    });

    // Book button at the bottom of every section page
    const main = document.querySelector("main");
    if (BOOKING_ON && main && !document.getElementById("page-book-cta")) {
      const cta = document.createElement("div");
      cta.id = "page-book-cta";
      cta.className = "page-book-cta";
      cta.hidden = true;
      cta.innerHTML = `
        <p>Ready for your next look?</p>
        <button type="button" class="book-button page-book-button">Book Appointment</button>
      `;
      main.appendChild(cta);
      if (document.body.classList.contains("style-luxury")) {
        cta.querySelector("button").textContent = String(config.bookTabLabel || "Treat Yourself");
      }
      cta.querySelector("button").addEventListener("click", () => openBookingModal("", ""));
    }

    // footer menu = the same pages as the top menu
    const footerMenu = document.querySelector(".lux-footer-menu");
    if (footerMenu && !footerMenu.children.length) {
      document.querySelectorAll("header nav a[data-page]").forEach(link => {
        if (link.hidden) return;
        const copy = document.createElement("a");
        copy.href = link.getAttribute("href");
        copy.textContent = link.textContent;
        copy.addEventListener("click", event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
          event.preventDefault();
          if (link.dataset.page === "book") { openBookingModal("", ""); if (siteHome()) { try { history.pushState({ page: "book" }, "", pageUrl("book")); } catch (error) { /* preview */ } } return; }
          showPage(link.dataset.page, { push: true });
        });
        footerMenu.appendChild(copy);
      });
    }

    window.addEventListener("popstate", () => showPage(pageFromAddress(), { push: false }));

    const first = pageFromAddress();
    showPage(first, { push: false, scroll: first !== "home" });
    applyTierFeatures();
    // 11/2 (Tom): the Site Builder keeps the preview on the tab you're editing
    // (Services & Prices while you change prices, Stylists while you edit stylists...)
    window.__bpShowSection = id => {
      const want = id === "top" ? "home" : id;
      const row = sitePages().find(page => page.section === want);
      if (row) showPage(row.key, { push: false, scroll: false });
      return document.body.dataset.page || "home";
    };
  }

  // 11/2 (Tom): tier switches — hide what this shop's plan doesn't have.
  // The server refuses the same features too; this only keeps the page honest.
  function applyTierFeatures() {
    if (!BOOKING_ON) {
      // 11/2 (Tom): no online booking (ProGo) — the big Book buttons become Call Now
      callTextButtons();
      document.querySelectorAll(".price-book").forEach(element => element.remove());
      document.querySelectorAll(
        '.open-booking, .book-button, .nav-book, #page-book-cta, [data-feature="booking"]'
      ).forEach(element => element.remove());
      if (bookingModal) bookingModal.remove();
    }
    if (!STORE_ON) {
      document.querySelectorAll(
        '.open-store, .store-section, .cart-button, #store, #cart, a[href="#store"], a[href="#cart"], [data-feature="store"]'
      ).forEach(element => element.remove());
    }
  }

  function isPhoneScreen() {
    return window.matchMedia("(max-width: 760px), (hover: none) and (pointer: coarse)").matches;
  }

  function callNowGoesToContact(link) {
    link.addEventListener("click", event => {
      if (isPhoneScreen()) return; // phone: the dialer opens with the shop's number
      if (document.body.dataset.page === "contact") return;
      event.preventDefault();
      showPage("contact", { push: true });
    });
  }

  function callTextButtons() {
    const digits = String(shop.phoneLink || shop.phoneDisplay || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    if (digits.length !== 10) return;
    const tel = `+1${digits}`;
    // 11/2 (Tom): every Call Now — on a phone it dials the shop; on a computer it opens the Contact page
    const make = cls => {
      const wrap = document.createElement("span");
      wrap.className = `call-text-buttons ${cls}`;
      wrap.innerHTML = `<a class="call-button" href="tel:${tel}">Call Now</a>`;
      callNowGoesToContact(wrap.querySelector("a"));
      return wrap;
    };
    const swap = (selector, cls, both) => {
      document.querySelectorAll(selector).forEach(button => button.replaceWith(make(cls, both)));
    };
    // 11/2 (Tom): Call Now only — no texting (that needs our server)
    swap("header > .book-button", "header-call", false);
    swap("#home .hero-content .book-button", "hero-call", false);
    swap(".contact-info .contact-book", "contact-call", false);
    // 11/2 (Tom): Stylists page box — "Not sure who to book with?" with Call Now (opens the Contact
    // page), View Services (opens Services & Prices) and Email Us when the shop has an email (no texting)
    const team = document.getElementById("barbers");
    if (team && document.body.classList.contains("style-luxury") && !team.querySelector(".match-panel")) {
      const panel = document.createElement("div");
      panel.className = "match-panel";
      panel.innerHTML = `
        <h3>Not sure who to book with?</h3>
        <p>Tell us the look you want and we'll match you with the right ${escapeHTML(staffLower)}.</p>
        <div class="match-panel-buttons"></div>
      `;
      const buttons = panel.querySelector(".match-panel-buttons");
      const goTo = (label, key, solid) => {
        const link = document.createElement("a");
        link.className = solid ? "call-button" : "call-button call-button-alt";
        link.href = pageUrl(key);
        link.textContent = label;
        link.addEventListener("click", event => { event.preventDefault(); showPage(key, { push: true }); });
        buttons.appendChild(link);
      };
      const call = document.createElement("a");
      call.className = "call-button";
      call.href = `tel:${tel}`;
      call.textContent = "Call Now";
      callNowGoesToContact(call);
      buttons.appendChild(call);
      goTo("View Services", "services", false);
      if (SHOP_EMAIL) {
        const mail = document.createElement("a");
        mail.className = "call-button call-button-alt";
        mail.href = `mailto:${SHOP_EMAIL}`;
        mail.textContent = "Email Us";
        buttons.appendChild(mail);
      }
      team.insertBefore(panel, team.querySelector(".lets-connect") || null);
    }
  }

  function openBookingFromUrl() {
    // Tier switch: no online booking on this shop's plan (checked off SHOP_CONFIG
    // itself so reschedule links keep working in older embeds and tests).
    if (window.SHOP_CONFIG && window.SHOP_CONFIG.features && window.SHOP_CONFIG.features.booking === false) {
      return;
    }

    const params =
      new URLSearchParams(window.location.search);

    const shouldOpenBooking =
      params.get("booking") === "open" ||
      params.get("reschedule") === "1";

    if (!shouldOpenBooking) {
      return;
    }

    // a reschedule link from a shop/barber cancel: ask the server whether a discount comes with it
    const rescheduleId = params.get("reschedule") || "";
    if (rescheduleId && rescheduleId !== "1" && /^[a-zA-Z0-9_-]{1,120}$/.test(rescheduleId) && typeof fetch === "function") {
      fetch(`${RESCHEDULE_OFFER_URL}/${encodeURIComponent(BUSINESS_ID)}/${encodeURIComponent(rescheduleId)}`, { cache: "no-store" })
        .then(response => response.json())
        .then(result => {
          const percent = Number(result && result.percent) || 0;
          if (percent > 0) {
            window.__bpRescheduleOffer = { bookingId: rescheduleId, percent };
            updateRescheduleDiscountNote();
          }
        })
        .catch(() => { /* no discount shown; booking still works */ });
    }

    openBookingModal(
      params.get("barber") || "",
      params.get("service") || ""
    );
  }

   // Refresh booking availability from the shared Business Pro server.
  async function loadBusinessStatusFromServer() {
    try {
      const response =
        await fetch(
          BUSINESS_STATUS_URL,
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      if (
        response.ok &&
        result.success &&
        typeof result.isOpen === "boolean"
      ) {
        businessIsOpen =
          result.isOpen;

        businessClosures =
          Array.isArray(result.closures)
            ? result.closures
            : [];
      }
    } catch (error) {
      console.error(
        "Business status check error:",
        error
      );
    }
  }

  async function refreshBookingAvailability() {
    // 11/3 (Tom): a ProGo site never calls our server
    if (window.SITE_STATIC === true) { availabilityReady = true; return; }
    try {
      const response = await fetch(
        `https://business-pro-local.onrender.com/api/appointment-availability/${encodeURIComponent(BUSINESS_ID)}`,
        { cache: "no-store" }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Appointment availability could not be loaded.");
      sharedAvailability = result.appointments;
      // 11/1 (Tom): the server's list now includes what this page booked, so let go of the page's own copies —
      // otherwise a time the shop reopened ("Reopen this time slot") stays blocked until the page is reloaded
      ownBookings = [];
      availabilityReady = true;
      await loadBusinessStatusFromServer();
      renderBookingDateCalendar();
      updateAvailableTimes();
    } catch (error) {
      availabilityReady = false;
      console.error("Shared appointment availability failed:", error);
      showBookingError("Cannot load current appointment availability. Please refresh before booking.");
    }
  }

  window.addEventListener("storage", event => {
    if (
      event.key === STORAGE_KEY ||
      event.key === TIME_OFF_STORAGE_KEY
    ) {
      refreshBookingAvailability();
    }
  });
  // Re-check for newly taken times every 15 seconds (once; it used to stack up a new timer per change).
  setInterval(refreshBookingAvailability, 15000);

  window.addEventListener(
    "focus",
    refreshBookingAvailability
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (!document.hidden) {
        refreshBookingAvailability();
      }
    }
  );

  refreshBookingAvailability();

  window.addEventListener("storage", event => {
    if (event.key === ANNOUNCEMENT_STORAGE_KEY) {
      buildCustomerAnnouncements();
      if (profileModal?.classList.contains("open") && selectedBarberId) {
        const barber = getProfileById(selectedBarberId);
        if (barber) buildBarberProfile(barber);
      }
    }
  });

  function getApprovedCustomerAnnouncements() {
    let items = [];
    try {
      const stored = JSON.parse(localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) || "[]");
      items = Array.isArray(stored) ? stored : [];
    } catch {
      items = [];
    }

    const now = Date.now();
    return items.filter(item => {
      if (String(item.status || "").toUpperCase() !== "APPROVED") return false;
      if (!item.expires) return true;
      const expiresAt = new Date(item.expires).getTime();
      return Number.isFinite(expiresAt) && expiresAt > now;
    });
  }

  function buildAnnouncementMarkup(items) {
    return items.map(item => `
      <article class="customer-announcement">
        <h3>${escapeHTML(item.title || (item.type === "promotion" ? "Promotion" : "Announcement"))}</h3>
        <p>${escapeHTML(item.message || "")}</p>
        <small class="customer-announcement-meta">
          ${item.type === "promotion" ? "Promotion" : "Shop update"}${item.expires ? ` • Available until ${escapeHTML(formatAnnouncementDate(item.expires))}` : ""}
        </small>
      </article>
    `).join("");
  }

  function formatAnnouncementDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function buildCustomerAnnouncements() {
    const section = document.getElementById("customer-announcements");
    const list = document.getElementById("customer-announcements-list");
    if (!section || !list) return;

    const shopWideItems = getApprovedCustomerAnnouncements().filter(
      item => item.scope !== "barber"
    );
    list.innerHTML = buildAnnouncementMarkup(shopWideItems);
    section.hidden = shopWideItems.length === 0;
  }


  // ============================================================
  // SHOP INFORMATION
  // ============================================================

  // ============================================================
  // THEME (colors chosen in the Business Pro site builder)
  // Optional: shop-config.js may include a "theme" block. Anything
  // left out keeps the template's default colors from style.css.
  // ============================================================

  function applyTheme(theme) {
    if (!theme || typeof theme !== "object") return;

    const root = document.documentElement;
    const cssVars = {
      pageBg: "--page-bg",
      surface: "--surface",
      surfaceDark: "--surface-dark",
      surfaceSoft: "--surface-soft",
      text: "--text",
      textSoft: "--text-soft",
      textOnDark: "--text-on-dark",
      softText: "--soft-text",
      accent: "--accent",
      accentDark: "--accent-dark",
      accentLight: "--accent-light",
      onAccent: "--on-accent",
      border: "--border"
    };

    Object.entries(cssVars).forEach(([key, cssVar]) => {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    });

    const hex = String(theme.accent || "").match(/^#?([0-9a-f]{6})$/i);
    if (hex) {
      const value = parseInt(hex[1], 16);
      root.style.setProperty(
        "--accent-rgb",
        `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`
      );
    }
  }

  function buildShopInformation() {

    applyTheme(config.theme);

    document.title =
      shop.pageTitle ||
      shop.name ||
      "Business Pro Barber Demo";

    // 10/30 (Tom): the one-line description Google shows under the title
    const description = shop.metaDescription ||
      [shop.name, shop.addressLine2 ? `in ${shop.addressLine2}.` : ".", shop.heroSubtitle || "Book your appointment online."].join(" ").replace(" .", ".");
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // 11/3 (Tom): what Facebook shows when someone shares the site — the shop's name, that line and a picture
    // (storefront photo, else the logo). A page that already has these (the server or a ProGo export) keeps its own.
    const shareMeta = (property, value) => {
      if (!value || document.querySelector(`meta[property="${property}"]`)) return;
      const tag = document.createElement("meta");
      tag.setAttribute("property", property);
      tag.content = value;
      document.head.appendChild(tag);
    };
    let shareImage = "";
    try { const src = shop.heroImage || shop.logo || ""; shareImage = src ? new URL(src, document.baseURI).href : ""; } catch (error) { shareImage = ""; }
    shareMeta("og:title", shop.name || "");
    shareMeta("og:description", description);
    shareMeta("og:image", shareImage);

    if (shopName) {
      shopName.textContent =
        shop.name || "BARBER SHOP";
    }

    if (heroTitle) {
      heroTitle.textContent =
        shop.heroTitle ||
        "LOOK SHARP. FEEL SHARP.";
    }

    if (heroSubtitle) {
      heroSubtitle.textContent =
        shop.heroSubtitle || "";
    }

    if (hero) {

      if (shop.heroImage) {
        hero.classList.add("hero-photo");
        // 11/1 (Tom): a group photo (people on the right, dark on the left) shows whole, sitting on the right
        if (String(shop.heroFit || "") === "group") hero.classList.add("hero-fit-group");
        // 11/1 (Tom): luxury look — dark on the left for the words, the photo shows clear on the right
        const shade = String(config.siteStyle || "").toLowerCase() === "luxury"
          ? "linear-gradient(90deg, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.55) 38%, rgba(0, 0, 0, 0) 62%)"
          : "linear-gradient(rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.42))";
        hero.style.backgroundImage = `
          ${shade},
          url("${escapeCssUrl(shop.heroImage)}")
        `;
      } else if (safeImageUrl(shop.logo)) {
        // No storefront photo: their logo, big, on their own main color.
        hero.classList.add("hero-logo-mode");
      } else {
        hero.classList.add("hero-no-image");
      }

    }

    const logoUrl =
      safeImageUrl(shop.logo);

    if (shopLogo && logoUrl) {
      shopLogo.src = logoUrl;
      shopLogo.alt = `${shop.name || "Shop"} logo`;
      shopLogo.hidden = false;
    }

    if (heroLogo && logoUrl && !shop.heroImage) {
      heroLogo.src = logoUrl;
      heroLogo.alt = `${shop.name || "Shop"} logo`;
      heroLogo.hidden = false;
    }

    buildShopPhotos();
    buildShopLinks();

    if (shopAddressLine1) {
      shopAddressLine1.textContent =
        shop.addressLine1 || "";
    }

    if (shopAddressLine2) {
      shopAddressLine2.textContent =
        shop.addressLine2 || "";
    }

    if (shopPhoneLink) {
      // A 10-digit shop number always shows with dashes: 207-408-7983 (Tom 10/30).
      const shopDigits = String(shop.phoneDisplay || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
      shopPhoneLink.textContent =
        shopDigits.length === 10 ? formatPhoneDashes(shopDigits) : (shop.phoneDisplay || "");

      shopPhoneLink.href =
        shop.phoneLink
          ? `tel:${shop.phoneLink}`
          : "#";
    }

    if (footerShopName) {
      footerShopName.textContent =
        shop.name || "Barber Shop";
    }

    buildHours();

  }


  // Pictures from the setup form or the builder: photo data, web links,
  // or site paths only (never javascript: or other odd addresses).
  function safeImageUrl(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    if (/^data:image\/(jpeg|png|webp|gif);base64,/i.test(text)) return text;
    try {
      // 11/2 (Tom): document.baseURI, not location.href — in the Site Builder preview the page is
      // "about:srcdoc", which made every /booking/... picture (logo, top-bar women, gallery) vanish
      const url = new URL(text, document.baseURI || location.href);
      return /^(https?|file):$/.test(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }


  // "Inside the Shop": up to 4 shop photos. An odd count puts the first
  // one full width on top so the rows always come out even.
  function buildShopPhotos() {

    if (!shopPhotosSection || !shopPhotosGrid) {
      return;
    }

    const photos =
      (Array.isArray(shop.photos) ? shop.photos : [])
        .map(safeImageUrl)
        .filter(Boolean)
        .slice(0, 4);

    shopPhotosGrid.innerHTML = "";
    shopPhotosGrid.classList.toggle("odd", photos.length % 2 === 1);
    shopPhotosSection.hidden = photos.length === 0;
    const navShopPhotos = document.getElementById("nav-shop-photos");
    if (navShopPhotos) navShopPhotos.hidden = photos.length === 0;

    photos.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Inside ${shop.name || "the shop"}, photo ${index + 1}`;
      img.loading = "lazy";
      shopPhotosGrid.appendChild(img);
    });

  }


  // Google / Facebook / Instagram buttons under the phone number.
  function buildShopLinks() {

    if (!shopLinks) {
      return;
    }

    const links =
      shop.links || {};

    shopLinks.innerHTML = "";

    [["google", "Find us on Google"], ["facebook", "Facebook"], ["instagram", "Instagram"], ["x", "X"], ["tiktok", "TikTok"]]
      .forEach(([key, label]) => {
        let url;
        try {
          url = new URL(String(links[key] || ""));
        } catch (error) {
          return;
        }
        if (!/^https?:$/.test(url.protocol)) return;
        const a = document.createElement("a");
        a.href = url.href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = label;
        shopLinks.appendChild(a);
      });

    shopLinks.hidden = shopLinks.children.length === 0;

    // Reviews section + menu item: only when the shop has a Google link.
    const reviews = document.getElementById("reviews");
    let google = null;
    try { google = new URL(String(links.google || "")); } catch (error) { google = null; }
    const hasGoogle = Boolean(google && /^https?:$/.test(google.protocol));
    if (reviews) reviews.hidden = !hasGoogle;
    const navReviews = document.getElementById("nav-reviews");
    if (navReviews) navReviews.hidden = !hasGoogle;
    if (hasGoogle) {
      document.getElementById("reviews-read").href = google.href;
      document.getElementById("reviews-write").href = google.href;
    }

  }


  function buildHours() {

    if (!shopHours) {
      return;
    }

    shopHours.innerHTML = "";

    if (
      !Array.isArray(shop.hours) ||
      shop.hours.length === 0
    ) {
      return;
    }

    const heading =
      document.createElement("h3");

    heading.textContent =
      "Hours";

    shopHours.appendChild(heading);

    shop.hours.forEach(item => {

      const row =
        document.createElement("p");

      row.innerHTML = `
        <strong>${escapeHTML(item.days)}</strong>:
        ${escapeHTML(item.hours)}
      `;

      shopHours.appendChild(row);

    });

  }


  // ============================================================
  // CLICKABLE SERVICE CARDS
  // ============================================================

  function buildServices() {

    if (!servicesList) {
      return;
    }

    servicesList.innerHTML = "";

    services.forEach(service => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "service-card";

      card.setAttribute(
        "aria-label",
        `Book ${service.name} for ${formatPrice(service.price)}`
      );

          card.innerHTML = `
        <div class="service-card-icon" data-service-icon="${escapeAttribute(service.id)}"></div>

        <h3>
          ${escapeHTML(service.name)}
        </h3>

        <p>
          ${formatPrice(service.price)}
        </p>

        <span class="service-card-arrow" aria-hidden="true">
          ›
        </span>
      `;

      card.addEventListener(
        "click",
        () => {
          openBookingModal(
            "",
            service.id
          );
        }
      );

      servicesList.appendChild(card);

    });

  }


  // ============================================================
  // PROFILE CARDS
  // ============================================================

  function buildProfileCards() {

    if (!barberSelector) {
      return;
    }

    barberSelector.innerHTML = "";

    if (profiles.length === 0) {
      barberSelector.innerHTML =
        "<p>No profiles have been added yet.</p>";
      return;
    }

    profiles.forEach(profile => {

      const card =
        document.createElement("button");

      card.type =
        "button";

      card.className =
        "barber-selector-card";

      if (
        profile.profileType ===
        "business-pro-local"
      ) {
        card.classList.add(
          "business-pro-profile-card"
        );
      }

      card.dataset.barberId =
        profile.id;

      const specialty =
        profile.cardSpecialty
          ? `
              <p class="barber-card-specialty">
                ${escapeHTML(profile.cardSpecialty)}
              </p>
            `
          : "";

      card.innerHTML = `
        ${buildProfilePhoto(profile, "small")}

        <h3>
          ${escapeHTML(profile.name)}
        </h3>

        ${specialty}
      `;

      card.addEventListener(
        "click",
        () => {
          openProfile(profile.id);
        }
      );

      barberSelector.appendChild(card);

    });

  }


  // ============================================================
  // OPEN PROFILE
  // ============================================================

  function openProfile(profileId) {

    const profile =
      getProfileById(profileId);

    if (!profile || !profileModal || !profileContent) {
      return;
    }

    if (
      profile.profileType ===
      "business-pro-local"
    ) {
      buildBusinessProProfile(profile);
    } else {
      buildBarberProfile(profile);
    }

    profileModal.classList.add("open");
    document.body.style.overflow = "hidden";

  }


  function buildBarberProfile(barber) {

    const specialties =
      Array.isArray(barber.specialties)
        ? barber.specialties.join(" • ")
        : "";

    const barberAnnouncements =
      getApprovedCustomerAnnouncements().filter(item =>
        item.scope === "barber" && String(item.barberId) === String(barber.id)
      );

    profileContent.innerHTML = `
      <div class="barber-popup-profile">

        <div class="barber-popup-header">

          <div class="barber-popup-action">

            ${buildProfilePhoto(barber, "large")}

            <button
              type="button"
              class="book-button barber-popup-book-button"
              id="barber-popup-book-button"
            >
              Schedule Appointment
            </button>

          </div>

          <div class="barber-popup-info">

            <h2>
              ${escapeHTML(barber.name)}
            </h2>

            ${
              barber.cardSpecialty
                ? `
                    <p class="barber-popup-tagline">
                      ${escapeHTML(barber.cardSpecialty)}
                    </p>
                  `
                : ""
            }

            ${
              specialties
                ? `
                    <p class="barber-popup-specialties">
                      ${escapeHTML(specialties)}
                    </p>
                  `
                : ""
            }

            ${
              barber.bio
                ? `
                    <p class="barber-popup-bio">
                      ${escapeHTML(barber.bio)}
                    </p>
                  `
                : ""
            }

          </div>

        </div>


        ${barberAnnouncements.length ? `
          <div class="barber-popup-announcements">
            <h3>${escapeHTML(barber.name)}'s Updates</h3>
            ${buildAnnouncementMarkup(barberAnnouncements)}
          </div>
        ` : ""}


        <div class="barber-popup-work">

          <h3>
            ${escapeHTML(barber.name)}'s Work
          </h3>

          <div
            class="barber-gallery"
            id="gallery-${escapeAttribute(barber.id)}"
          >
          </div>

        </div>

      </div>
    `;

    buildBarberGallery(barber);

    const bookButton =
      document.getElementById(
        "barber-popup-book-button"
      );

    if (bookButton) {
      bookButton.addEventListener(
        "click",
        () => {
          closeProfile(false);
          openBookingModal(barber.id);
        }
      );
    }

  }


  function buildBusinessProProfile(profile) {

    const specialties =
      Array.isArray(profile.specialties)
        ? profile.specialties
        : [];

    const action =
      profile.actionButton || {};

    const actionText =
      action.text || "Get This Website";

    const actionHref =
      action.href || "join.html";

    profileContent.innerHTML = `
      <div class="barber-popup-profile business-pro-popup-profile">

        <div class="barber-popup-header">

          <div class="barber-popup-action">
            ${buildProfilePhoto(profile, "large")}
          </div>

          <div class="barber-popup-info">

            <p class="business-pro-popup-eyebrow">
              BUSINESS PRO LOCAL
            </p>

            <h2>
              ${escapeHTML(profile.name)}
            </h2>

            ${
              profile.cardSpecialty
                ? `
                    <p class="barber-popup-tagline">
                      ${escapeHTML(profile.cardSpecialty)}
                    </p>
                  `
                : ""
            }

            ${
              profile.bio
                ? `
                    <p class="barber-popup-bio">
                      ${escapeHTML(profile.bio)}
                    </p>
                  `
                : ""
            }

          </div>

        </div>

        <div class="business-pro-services">

          <h3>
            Business Pro Services
          </h3>

          <ul>
            ${specialties
              .map(
                item => `
                  <li>
                    ${escapeHTML(item)}
                  </li>
                `
              )
              .join("")}
          </ul>

          <a
            class="get-this-website-button business-pro-popup-button"
            href="${escapeAttribute(actionHref)}"
          >
            ${escapeHTML(actionText)}
            <span aria-hidden="true">
              &rarr;
            </span>
          </a>

        </div>

      </div>
    `;

  }


  // ============================================================
  // BARBER HAIRCUT PHOTOS — display only (Tom 10/28: customers can't add,
  // replace or delete them on the website; the owner and barbers change them
  // in their portal's Photos page).
  // ============================================================

  function buildBarberGallery(barber) {

    const galleryElement =
      document.getElementById(
        `gallery-${barber.id}`
      );

    if (!galleryElement) {
      return;
    }

    const photos =
      (Array.isArray(barber.gallery)
        ? barber.gallery
        : []
      ).filter(photo =>
        photo &&
        typeof photo.image === "string" &&
        photo.image.trim()
      );

    if (!photos.length) {
      galleryElement.innerHTML = `
        <div class="gallery-empty">
          <p>
            Haircut photos will appear here.
          </p>
        </div>
      `;
      return;
    }

    galleryElement.innerHTML =
      photos.map((photo, index) => {
        const caption =
          photo.caption ||
          `${barber.name}'s haircut ${index + 1}`;
        return `
          <figure class="gallery-photo">
            <img
              src="${escapeAttribute(photo.image)}"
              alt="${escapeAttribute(caption)}"
              loading="lazy"
            >
            ${photo.caption
              ? `<figcaption>${escapeHTML(photo.caption)}</figcaption>`
              : ""}
          </figure>
        `;
      }).join("");

  }


  // ============================================================
  // CLOSE PROFILE
  // ============================================================

  if (closeProfileButton) {
    closeProfileButton.addEventListener(
      "click",
      () => {
        closeProfile();
      }
    );
  }

  if (profileModal) {
    profileModal.addEventListener(
      "click",
      event => {
        if (event.target === profileModal) {
          closeProfile();
        }
      }
    );
  }

  function closeProfile(
    restoreScroll = true
  ) {

    if (!profileModal) {
      return;
    }

    profileModal.classList.remove("open");

    if (restoreScroll) {
      document.body.style.overflow = "";
    }

  }


  // ============================================================
  // PROFILE PHOTO OR INITIALS
  // ============================================================

  function buildProfilePhoto(
    profile,
    size
  ) {

    const className =
      size === "small"
        ? "barber-card-photo"
        : "barber-popup-photo";

    if (profile.profilePhoto) {
      return `
        <img
          class="${className}"
          src="${escapeAttribute(profile.profilePhoto)}"
          alt="${escapeAttribute(profile.name)}"
        >
      `;
    }

    return `
      <div
        class="${className} barber-photo-placeholder"
        aria-label="${escapeAttribute(profile.name)}"
      >
        ${escapeHTML(
          getInitials(profile.name)
        )}
      </div>
    `;

  }


  // ============================================================
  // BOOKING DROPDOWN
  // ============================================================

  function buildBarberSelect() {

    if (!barberSelect) {
      return;
    }

    barberSelect.innerHTML = `
      <option value="">
        Select ${escapeHTML(aStaff)}
      </option>
    `;

    bookableBarbers.forEach(barber => {

      const option =
        document.createElement("option");

      option.value =
        barber.id;

      option.textContent =
        barber.name;

      barberSelect.appendChild(option);

    });

  }


  // ============================================================
  // GENERAL BOOKING BUTTONS
  // ============================================================

  function attachGeneralBookingButtons() {

    const buttons =
      document.querySelectorAll(
        ".open-booking"
      );

    buttons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openBookingModal(
            button.dataset.barber || ""
          );
        }
      );
    });

  }


  // ============================================================
  // OPEN BOOKING
  // ============================================================

  function openBookingModal(
    requestedBarberId = "",
    requestedService = ""
  ) {

    if (!BOOKING_ON) {
      return;
    }

    if (!bookingModal) {
      return;
    }

    if (smsConsent) smsConsent.checked = false;

    requestedServiceId =
      requestedService || "";

    confirmationMessage.innerHTML = "";

    const requestedBarber =
      requestedBarberId
        ? getBookableBarberById(
            requestedBarberId
          )
        : null;

    if (requestedBarber) {

      setBarberChoiceVisibility(false);
      selectBarber(requestedBarber.id);

    } else if (
      bookableBarbers.length === 1
    ) {

      setBarberChoiceVisibility(false);
      selectBarber(
        bookableBarbers[0].id
      );

    } else {

      setBarberChoiceVisibility(true);
      selectBarber("");

    }

    bookingModal.classList.add("open");
    document.body.style.overflow = "hidden";

  }


  function setBarberChoiceVisibility(
    showChoice
  ) {

    if (barberSelectLabel) {
      barberSelectLabel.hidden =
        !showChoice;
    }

    if (barberSelect) {
      barberSelect.hidden =
        !showChoice;
    }

  }


  // ============================================================
  // BARBER SELECTION
  // ============================================================

  if (barberSelect) {
    barberSelect.addEventListener(
      "change",
      () => {
        selectBarber(
          barberSelect.value
        );
      }
    );
  }

  function selectBarber(
    barberId
  ) {

    selectedBarberId =
      barberId;

    if (barberSelect) {
      barberSelect.value =
        barberId;
    }

    const barber =
      getBookableBarberById(
        barberId
      );

    if (!barber) {

      if (selectedBarberDisplay) {
        selectedBarberDisplay.textContent =
          `Select ${/^[aeiou]/i.test(STAFF_ONE) ? "an" : "a"} ${STAFF_ONE}`;
      }

      if (dateInput) {
        dateInput.value = "";
      }

      buildServiceSelect(null);
      resetTimeSelect();
      renderBookingDateCalendar();
      return;

    }

    if (selectedBarberDisplay) {
      selectedBarberDisplay.textContent =
        barber.name;
    }

    if (dateInput) {
      dateInput.value = "";
    }

    bookingCalendarMonth = new Date();
    bookingCalendarMonth.setDate(1);
    bookingCalendarMonth.setHours(0, 0, 0, 0);

    buildServiceSelect(barber);
    resetTimeSelect();
    renderBookingDateCalendar();

    if (
      requestedServiceId &&
      Array.from(serviceSelect.options).some(
        option =>
          option.value ===
          requestedServiceId
      )
    ) {
      serviceSelect.value =
        requestedServiceId;
    }

    updateAvailableTimes();

  }


  // ============================================================
  // BARBER SERVICES
  // ============================================================

  function buildServiceSelect(
    barber
  ) {

    if (!serviceSelect) {
      return;
    }

    serviceSelect.innerHTML = `
      <option value="">
        Select a service
      </option>
    `;

    if (!barber) {
      return;
    }

    const allowedIds =
      Array.isArray(barber.serviceIds)
        ? barber.serviceIds
        : [];

    services.forEach(service => {

      if (
        allowedIds.length > 0 &&
        !allowedIds.includes(service.id)
      ) {
        return;
      }

      const option =
        document.createElement("option");

      option.value =
        service.id;

      option.textContent =
        `${service.name} - ${formatPrice(service.price)}`;

      serviceSelect.appendChild(option);

    });

  }


  // ============================================================
  // CLOSE BOOKING
  // ============================================================

  if (closeBookingButton) {
    closeBookingButton.addEventListener(
      "click",
      closeBookingModal
    );
  }

  if (bookingModal) {
    bookingModal.addEventListener(
      "click",
      event => {
        if (event.target === bookingModal) {
          closeBookingModal();
        }
      }
    );
  }

  function closeBookingModal() {

    if (!bookingModal) {
      return;
    }

    bookingModal.classList.remove("open");
    document.body.style.overflow = "";

  }


  // ============================================================
  // ESCAPE KEY
  // ============================================================

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      if (
        bookingModal &&
        bookingModal.classList.contains("open")
      ) {
        closeBookingModal();
        return;
      }

      if (
        profileModal &&
        profileModal.classList.contains("open")
      ) {
        closeProfile();
      }

    }
  );


  // ============================================================
  // BOOKING CALENDAR
  // ============================================================

  function configureBookingCalendar() {

    if (!dateInput) {
      return;
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const maxDate =
      new Date(today);

    maxDate.setDate(
      maxDate.getDate() +
      DAYS_AVAILABLE
    );

    dateInput.min =
      toDateInputValue(today);

    dateInput.max =
      toDateInputValue(maxDate);

    bookingCalendarMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (bookingDatePrev) {
      bookingDatePrev.addEventListener(
        "click",
        () => {
          bookingCalendarMonth.setMonth(
            bookingCalendarMonth.getMonth() - 1
          );
          renderBookingDateCalendar();
        }
      );
    }

    if (bookingDateNext) {
      bookingDateNext.addEventListener(
        "click",
        () => {
          bookingCalendarMonth.setMonth(
            bookingCalendarMonth.getMonth() + 1
          );
          renderBookingDateCalendar();
        }
      );
    }

    renderBookingDateCalendar();

  }


  if (dateInput) {
    dateInput.addEventListener(
      "change",
      () => {
        renderBookingDateCalendar();
        updateAvailableTimes();
      }
    );
  }

  if (serviceSelect) {
    serviceSelect.addEventListener(
      "change",
      () => {
        renderBookingDateCalendar();
        updateAvailableTimes();
        updateRescheduleDiscountNote();
      }
    );
  }

  // 11/1 (Tom): show the discounted price under the service picker
  function rescheduleDiscountPrice(price) {
    const offer = window.__bpRescheduleOffer;
    return offer ? Math.round(Number(price || 0) * (100 - offer.percent)) / 100 : Number(price || 0);
  }
  function updateRescheduleDiscountNote() {
    const note = document.getElementById("reschedule-discount");
    const offer = window.__bpRescheduleOffer;
    if (!note) return;
    if (!offer) { note.hidden = true; return; }
    const service = serviceSelect && serviceSelect.value ? getServiceById(serviceSelect.value) : null;
    note.textContent = service
      ? `🎉 ${offer.percent}% off — sorry we had to cancel. Your price: $${rescheduleDiscountPrice(service.price).toFixed(2)} (was $${Number(service.price || 0).toFixed(2)}).`
      : `🎉 ${offer.percent}% off this booking — sorry we had to cancel.`;
    note.hidden = false;
  }


  function getDateAvailability(
    barber,
    dateKey
  ) {

    const selectedDate =
      parseDateInput(dateKey);

    if (!barber || !selectedDate) {
      return {
        available: false,
        status: "unavailable",
        label: "OFF",
        times: []
      };
    }


       const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      dateKey === toDateInputValue(today) &&
      businessIsOpen === false
    ) {
      return {
        available: false,
        status: "closed",
        label: "CLOSED",
        times: []
      };
    }

    const closuresForDate =
      businessClosures.filter(item =>
        item &&
        item.date === dateKey &&
        item.status === "closed"
      );

    if (
      closuresForDate.some(
        item => item.allDay !== false
      )
    ) {
      return {
        available: false,
        status: "closed",
        label: "CLOSED",
        times: []
      };
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + DAYS_AVAILABLE);

    // Holidays / days closed the owner tapped on their setup form.
    if (
      Array.isArray(shop.closedDates) &&
      shop.closedDates.includes(dateKey)
    ) {
      return {
        available: false,
        status: "closed",
        label: "CLOSED",
        times: []
      };
    }

    if (
      selectedDate < today ||
      selectedDate > maxDate
    ) {
      return {
        available: false,
        status: "outside-range",
        label: "",
        times: []
      };
    }

    // The shop's own hours for this weekday (from Visit Us → Hours).
    const shopDay =
      shopHoursByDay()[selectedDate.getDay()];

    if (shopDay === "closed") {
      return {
        available: false,
        status: "closed",
        label: "CLOSED",
        times: []
      };
    }

    const schedule =
      barber.schedule || {};

    // 10/28 (Tom): a barber works the shop's hours unless the owner gave them their own (schedule.custom).
    // When the shop's hours for that day are known, they ARE the barber's hours.
    const followsShop =
      schedule.custom !== true && Boolean(shopDay);

    const workingDays =
      Array.isArray(schedule.workingDays)
        ? schedule.workingDays
        : [];

    if (
      !followsShop &&
      !workingDays.includes(
        selectedDate.getDay()
      )
    ) {
      return {
        available: false,
        status: "off",
        label: "OFF",
        times: []
      };
    }

    const approvedRequests =
      getApprovedTimeOff().filter(request =>
        String(request.employee || "").toLowerCase() ===
          String(barber.name || "").toLowerCase() &&
        dateKey >= request.startDate &&
        dateKey <= request.endDate
      );

    if (
      approvedRequests.some(
        request => request.allDay
      )
    ) {
      return {
        available: false,
        status: "off",
        label: "OFF",
        times: []
      };
    }

    let startTime =
      followsShop ? shopDay.start : (schedule.startTime || "09:00");

    let endTime =
      followsShop ? shopDay.end : (schedule.endTime || "17:00");

    // A barber can't be booked outside the shop's hours that day
    // (a short Saturday stays short).
    if (shopDay) {
      if (clockMinutes(shopDay.start) > clockMinutes(startTime)) startTime = shopDay.start;
      if (clockMinutes(shopDay.end) < clockMinutes(endTime)) endTime = shopDay.end;
    }

    const breaks =
      Array.isArray(schedule.breaks)
        ? schedule.breaks
        : [];

    const bookings =
      getBookings();

    const times =
      generateTimeSlots(
        startTime,
        endTime,
        APPOINTMENT_LENGTH
      );

    const availableTimes =
      times.filter(time => {

        const slotStart = flexibleTimeToMinutes(time);
        const slotLength = serviceMinutes();

        // The whole service has to fit before closing.
        if (slotStart + slotLength > flexibleTimeToMinutes(endTime)) {
          return false;
        }

        const duringBreak =
          breaks.some(item =>
            timeFallsWithinRange(
              time,
              item.start,
              item.end
            ) ||
            (item.start && item.end &&
              slotStart < flexibleTimeToMinutes(item.end) &&
              slotStart + slotLength > flexibleTimeToMinutes(item.start))
          );

        if (duringBreak) {
          return false;
        }

        const alreadyBooked =
          bookings.some(booking =>
            booking.barberId === barber.id &&
            booking.date === dateKey &&
            flexibleTimeToMinutes(time) < flexibleTimeToMinutes(booking.time) + Number(booking.durationMinutes || APPOINTMENT_LENGTH) &&
            flexibleTimeToMinutes(time) + slotLength > flexibleTimeToMinutes(booking.time) &&
            bookingBlocksSlot(booking)
          );

        if (alreadyBooked) {
          return false;
        }

        if (
          isBlockedByApprovedTimeOff(
            barber.name,
            dateKey,
            time
          )
        ) {
          return false;
        }

        if (
          isPastTime(
            dateKey,
            time
          )
        ) {
          return false;
        }

        const blockedByBusinessClosure =
          closuresForDate.some(closure => {
            if (closure.allDay !== false) {
              return true;
            }

            const slotStart =
              flexibleTimeToMinutes(time);

            const closureStart =
              flexibleTimeToMinutes(
                closure.startTime
              );

            const closureEnd =
              flexibleTimeToMinutes(
                closure.endTime
              );

            if (
              Number.isNaN(slotStart) ||
              Number.isNaN(closureStart) ||
              Number.isNaN(closureEnd)
            ) {
              return false;
            }

            return (
              slotStart >= closureStart &&
              slotStart < closureEnd
            );
          });

        if (blockedByBusinessClosure) {
          return false;
        }

        return true;

      });

    if (availableTimes.length === 0) {
      return {
        available: false,
        status: "full",
        label: "FULL",
        times: []
      };
    }

    return {
      available: true,
      status: "available",
      label: "",
      times: availableTimes
    };

  }


  // Reads the shop's Hours rows ("Monday - Friday": "9:00 AM - 6:00 PM",
  // "Saturday": "9:00 AM - 1:00 PM", "Sunday": "Closed") into one entry per
  // weekday (0 = Sunday): { start, end } in 24-hour "HH:MM", or "closed".
  // Days no row mentions (or rows it can't read) are left out, so the
  // barber's own schedule decides those days.
  let shopHoursCache = null;

  function shopHoursByDay() {

    if (shopHoursCache) {
      return shopHoursCache;
    }

    shopHoursCache = {};

    (Array.isArray(shop.hours) ? shop.hours : []).forEach(row => {
      const days = parseHoursDays(row && row.days);
      const hours = parseHoursRange(row && row.hours);
      if (!days.length || !hours) return;
      days.forEach(day => { shopHoursCache[day] = hours; });
    });

    return shopHoursCache;

  }

  function parseHoursDays(text) {

    const value =
      String(text || "").toLowerCase();

    if (/\b(daily|every ?day|7 days)\b/.test(value)) return [0, 1, 2, 3, 4, 5, 6];
    if (/\bweekdays?\b/.test(value)) return [1, 2, 3, 4, 5];
    if (/\bweekends?\b/.test(value)) return [0, 6];

    const dayOf = word => ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(word.slice(0, 3));
    const days = new Set();

    value.split(/,|&|\/|\band\b/).forEach(part => {
      const words = part.match(/[a-z]+/g) || [];
      const named = words.map(dayOf).filter(day => day >= 0);
      if (!named.length) return;
      const isRange = named.length === 2 && /-|–|—|\bto\b|\bthru\b|\bthrough\b/.test(part);
      if (isRange) {
        for (let day = named[0], guard = 0; guard < 7; day = (day + 1) % 7, guard++) {
          days.add(day);
          if (day === named[1]) break;
        }
      } else {
        named.forEach(day => days.add(day));
      }
    });

    return [...days];

  }

  function parseHoursRange(text) {

    const value =
      String(text || "").toLowerCase();

    if (/closed/.test(value)) return "closed";

    const found =
      [...value.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m?\.?|p\.?m?\.?)?/g)]
        .filter(match => Number(match[1]) <= 24)
        .slice(0, 2);

    if (found.length < 2) return null;

    const toMinutes = (match, fallback) => {
      let hour = Number(match[1]) % 12;
      const minute = Number(match[2] || 0);
      const meridiem = (match[3] || fallback || "")[0];
      if (meridiem === "p") hour += 12;
      return hour * 60 + minute;
    };

    const start = toMinutes(found[0], "a");
    let end = toMinutes(found[1], found[0][3] || "p");
    if (end <= start) end += 12 * 60;
    if (end > 24 * 60 || end <= start) return null;

    const pad = minutes => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    return { start: pad(start), end: pad(end) };

  }

  function clockMinutes(value) {
    const match = /^(\d{1,2}):(\d{2})/.exec(String(value || ""));
    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  }


  function renderBookingDateCalendar() {

    if (
      !bookingDateCalendar ||
      !bookingDateGrid ||
      !bookingDateMonthLabel
    ) {
      return;
    }

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    bookingDateGrid.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + DAYS_AVAILABLE);

    const firstAllowedMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const lastAllowedMonth = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      1
    );

    if (bookingCalendarMonth < firstAllowedMonth) {
      bookingCalendarMonth = new Date(firstAllowedMonth);
    }

    if (bookingCalendarMonth > lastAllowedMonth) {
      bookingCalendarMonth = new Date(lastAllowedMonth);
    }

    bookingDateMonthLabel.textContent =
      bookingCalendarMonth.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric"
        }
      );

    if (bookingDatePrev) {
      bookingDatePrev.disabled =
        bookingCalendarMonth.getTime() ===
        firstAllowedMonth.getTime();
    }

    if (bookingDateNext) {
      bookingDateNext.disabled =
        bookingCalendarMonth.getTime() ===
        lastAllowedMonth.getTime();
    }

    const firstDay = new Date(
      bookingCalendarMonth.getFullYear(),
      bookingCalendarMonth.getMonth(),
      1
    );

    const daysInMonth = new Date(
      bookingCalendarMonth.getFullYear(),
      bookingCalendarMonth.getMonth() + 1,
      0
    ).getDate();

    const mondayOffset =
      (firstDay.getDay() + 6) % 7;

    for (
      let emptyIndex = 0;
      emptyIndex < mondayOffset;
      emptyIndex += 1
    ) {
      const empty = document.createElement("span");
      empty.className = "booking-date-empty";
      bookingDateGrid.appendChild(empty);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      const date = new Date(
        bookingCalendarMonth.getFullYear(),
        bookingCalendarMonth.getMonth(),
        day
      );

      date.setHours(0, 0, 0, 0);

      const dateKey =
        toDateInputValue(date);

      const outsideRange =
        date < today ||
        date > maxDate;

      const state =
        barber && !outsideRange
          ? getDateAvailability(
              barber,
              dateKey
            )
          : {
              available: false,
              status: "outside-range",
              label: "",
              times: []
            };

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "booking-date-day";
      button.dataset.date = dateKey;

      const number =
        document.createElement("span");
      number.className = "booking-date-number";
      number.textContent = String(day);
      button.appendChild(number);

      if (state.label) {
        const status =
          document.createElement("small");
        status.className = "booking-date-status";
        status.textContent = state.label;
        button.appendChild(status);
      }

      if (
        dateInput &&
        dateInput.value === dateKey
      ) {
        button.classList.add("is-selected");
      }

      if (!state.available) {
        button.disabled = true;
        button.classList.add("is-unavailable");

        if (state.status === "full") {
          button.classList.add("is-full");
        }

        if (state.status === "off") {
          button.classList.add("is-off");
        }
      } else {
        button.title =
          `${state.times.length} appointment time${state.times.length === 1 ? "" : "s"} available`;

        button.addEventListener(
          "click",
          () => {
            if (!dateInput) return;

            dateInput.value = dateKey;
            renderBookingDateCalendar();
            updateAvailableTimes();
          }
        );
      }

      bookingDateGrid.appendChild(button);
    }

    if (bookingDateNote) {
      bookingDateNote.textContent = barber
        ? "Gray OFF and FULL dates cannot be selected."
        : `Choose ${aStaff} to see available dates.`;
    }

    if (
      barber &&
      dateInput &&
      dateInput.value
    ) {
      const selectedState =
        getDateAvailability(
          barber,
          dateInput.value
        );

      if (!selectedState.available) {
        dateInput.value = "";
        resetTimeSelect();
      }
    }

  }


  // ============================================================
  // AVAILABLE TIMES
  // ============================================================

  function updateAvailableTimes() {

    // Keep the customer's picked time when the list refreshes (every 15 s, or when they click back
    // into the page); it only clears if that time was just taken. (10/28: "Please choose an
    // available time" after picking one.)
    const keepTime = timeSelect ? timeSelect.value : "";

    resetTimeSelect();

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    if (
      !barber ||
      !dateInput ||
      !dateInput.value
    ) {
      return;
    }

    const availability =
      getDateAvailability(
        barber,
        dateInput.value
      );

    if (!availability.available) {
      addTimeMessage(
        availability.status === "full"
          ? "This date is fully booked."
          : `This ${staffLower} is not available on that day.`
      );
      return;
    }

    availability.times.forEach(time => {

      const option =
        document.createElement("option");

      option.value =
        time;

      option.textContent =
        convertTo12Hour(time);

      timeSelect.appendChild(option);

    });

    if (keepTime && availability.times.includes(keepTime)) {
      timeSelect.value = keepTime;
    }

  }


  function bookingBlocksSlot(booking) {

    if (!booking) return false;

    const status =
      String(booking.ownerStatus || booking.status || "confirmed")
        .toLowerCase();

    if (status !== "canceled") {
      return true;
    }

    // A customer cancellation reopens the slot. An owner/employee
    // cancellation remains blocked until someone reopens it.
    return booking.slotBlocked === true;

  }


  function getApprovedTimeOff() {

    try {
      const requests = JSON.parse(
        localStorage.getItem(TIME_OFF_STORAGE_KEY) || "[]"
      );

      return Array.isArray(requests)
        ? requests.filter(request => request.status === "approved")
        : [];
    } catch {
      return [];
    }

  }


  function flexibleTimeToMinutes(value) {

    const raw = String(value || "").trim();
    const twentyFourHour = raw.match(/^(\d{1,2}):(\d{2})$/);

    if (twentyFourHour) {
      return Number(twentyFourHour[1]) * 60 + Number(twentyFourHour[2]);
    }

    const twelveHour = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!twelveHour) return NaN;

    let hour = Number(twelveHour[1]) % 12;
    const minute = Number(twelveHour[2]);

    if (twelveHour[3].toUpperCase() === "PM") hour += 12;
    return hour * 60 + minute;

  }


  function isBlockedByApprovedTimeOff(barberName, dateKey, time) {

    const slotStart = flexibleTimeToMinutes(time);

    return getApprovedTimeOff().some(request => {
      if (
        String(request.employee || "").toLowerCase() !==
        String(barberName || "").toLowerCase()
      ) return false;

      if (dateKey < request.startDate || dateKey > request.endDate) {
        return false;
      }

      if (request.allDay) return true;

      const blockedStart = flexibleTimeToMinutes(request.startTime);
      const blockedEnd = flexibleTimeToMinutes(request.endTime);

      if (
        Number.isNaN(slotStart) ||
        Number.isNaN(blockedStart) ||
        Number.isNaN(blockedEnd)
      ) return true;

      return slotStart < blockedEnd &&
        slotStart + serviceMinutes() > blockedStart;
    });

  }


  function resetTimeSelect() {

    if (!timeSelect) {
      return;
    }

    timeSelect.innerHTML = `
      <option value="">
        Select a time
      </option>
    `;

  }


  function addTimeMessage(
    message
  ) {

    if (!timeSelect) {
      return;
    }

    const option =
      document.createElement("option");

    option.value = "";
    option.disabled = true;
    option.textContent = message;

    timeSelect.appendChild(option);

  }


  function generateTimeSlots(
    startTime,
    endTime,
    intervalMinutes
  ) {

    const startMinutes =
      timeToMinutes(startTime);

    const endMinutes =
      timeToMinutes(endTime);

    const slots = [];

    for (
      let minutes = startMinutes;
      minutes + intervalMinutes <= endMinutes;
      minutes += intervalMinutes
    ) {
      slots.push(
        minutesToTime(minutes)
      );
    }

    return slots;

  }


  function timeFallsWithinRange(
    time,
    rangeStart,
    rangeEnd
  ) {

    if (
      !rangeStart ||
      !rangeEnd
    ) {
      return false;
    }

    const value =
      timeToMinutes(time);

    const start =
      timeToMinutes(rangeStart);

    const end =
      timeToMinutes(rangeEnd);

    return (
      value >= start &&
      value < end
    );

  }


  function isPastTime(
    dateValue,
    timeValue
  ) {

    const date =
      parseDateInput(dateValue);

    if (!date) {
      return false;
    }

    const [hours, minutes] =
      timeValue
        .split(":")
        .map(Number);

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return (
      date.getTime() <=
      Date.now()
    );

  }


  // ============================================================
  // CONFIRM BOOKING
  // ============================================================

  if (confirmButton) {
    confirmButton.addEventListener(
      "click",
      confirmBooking
    );
  }

  async function confirmBooking() {
    if (!availabilityReady) {
      showBookingError("Current appointment availability is unavailable. Please refresh before booking.");
      return;
    }

    const barber =
      getBookableBarberById(
        selectedBarberId
      );

    const service =
      getServiceById(
        serviceSelect
          ? serviceSelect.value
          : ""
      );

    const date =
      dateInput
        ? dateInput.value
        : "";

    const time =
      timeSelect
        ? timeSelect.value
        : "";

    const customerName =
      nameInput
        ? nameInput.value.trim()
        : "";

    const customerPhone =
      phoneInput
        ? phoneInput.value.trim()
        : "";

    if (!barber) {
      showBookingError(
        `Please choose ${aStaff}.`
      );
      return;
    }

    if (!service) {
      showBookingError(
        "Please choose a service."
      );
      return;
    }

    if (!date) {
      showBookingError(
        "Please choose a date."
      );
      return;
    }

    if (!time) {
      showBookingError(
        "Please choose an available time."
      );
      return;
    }

    if (!customerName) {
      showBookingError(
        "Please enter your name."
      );
      return;
    }

    const formattedPhone =
      formatUSPhone(customerPhone);

    if (!formattedPhone) {
      showBookingError(
        "Please enter a valid 10-digit mobile phone number."
      );
      return;
    }

    if (!smsConsent || !smsConsent.checked) {
      showBookingError(
        "Please agree to receive appointment texts before booking."
      );
      return;
    }

    const bookings =
      getBookings();

    const timeWasTaken =
      bookings.some(booking =>
        booking.barberId === barber.id &&
        booking.date === date &&
        booking.time === time &&
        bookingBlocksSlot(booking)
      );

    if (timeWasTaken) {
      showBookingError(
        "That appointment time was just taken. Please choose another time."
      );
      updateAvailableTimes();
      return;
    }

    const booking = {

      id:
        createBookingId(),

      shopName:
        shop.name ||
        "Barber Shop",

      barberId:
        barber.id,

      barberName:
        barber.name,

      serviceId:
        service.id,

      serviceName:
        service.name,

      servicePrice:
        (window.__bpRescheduleOffer ? Math.round(Number(service.price || 0) * (100 - window.__bpRescheduleOffer.percent)) / 100 : Number(service.price || 0)),

      date,
      time,
      customerName,

      phone:
        formattedPhone,

      smsConsent:
        Boolean(
          smsConsent &&
          smsConsent.checked
        ),
      businessId: BUSINESS_ID,
      durationMinutes: serviceMinutes(service.id),

      ownerStatus:
        "pending-payment-choice",

      paymentStatus:
        "pending",

      paymentChoice:
        "",

      cancellationSource:
        "",

      slotBlocked:
        false,

      createdAt:
        new Date().toISOString()

    };

    const paymentWindow =
      window.open(
        "about:blank",
        "_blank"
      );

    if (!paymentWindow) {
      showBookingError(
        "Please allow pop-ups for this page so the secure card page can open."
      );
      return;
    }

    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.textContent =
        "Opening Secure Card Page...";
    }

    if (confirmationMessage) {
      confirmationMessage.innerHTML = `
        <p class="sms-demo-message">
          Opening secure Stripe test card page...
        </p>
      `;
    }

    try {

      const checkoutResponse =
        await fetch(
          APPOINTMENT_CHECKOUT_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                bookingId:
                  booking.id,
                businessId: BUSINESS_ID,
                barberId: booking.barberId,
                serviceId: booking.serviceId,
                durationMinutes: Number(booking.durationMinutes) || serviceMinutes(booking.serviceId),
                shopName:
                  booking.shopName,
                barberName:
                  booking.barberName,
                serviceName:
                  booking.serviceName,
                servicePrice:
                  booking.servicePrice,
                customerName:
                  booking.customerName,
                phone:
                  booking.phone,
                appointmentDate:
                  booking.date,
                appointmentTime:
                  convertTo12Hour(
                    booking.time
                  ),
                appointmentTime24:
                  booking.time,
                smsConsent:
                  booking.smsConsent,
                // 11/1 (Tom): the canceled appointment this rebooking replaces — the server checks the discount itself
                rescheduleOf:
                  (window.__bpRescheduleOffer && window.__bpRescheduleOffer.bookingId) || ""
              })
          }
        );

      const checkoutResult =
        await checkoutResponse.json();

      if (
        !checkoutResponse.ok ||
        !checkoutResult.success ||
        !checkoutResult.url ||
        !checkoutResult.sessionId
      ) {
        throw new Error(
          checkoutResult.error ||
          "The secure card page could not be opened."
        );
      }

      booking.paymentReference =
        checkoutResult.sessionId;

      paymentWindow.location.href =
        checkoutResult.url;

      if (confirmationMessage) {
        confirmationMessage.innerHTML = `
          <p class="sms-demo-message">
            Enter the test card in Stripe. After the card is saved,
            choose PAY NOW BY CARD or PAY AT STORE.
          </p>
        `;
      }

      const finalStatus =
        await waitForAppointmentConfirmation(
          checkoutResult.sessionId,
          paymentWindow
        );

      if (!finalStatus.confirmed) {
        throw new Error(
          "The appointment was not confirmed."
        );
      }

      const latestBookings =
        getBookings();

      booking.ownerStatus =
        "confirmed";

      booking.paymentChoice =
        finalStatus.paymentChoice ||
        "";

      booking.paymentStatus =
        finalStatus.paid
          ? "paid"
          : "pay-at-store";

      booking.amountPaid =
        Number(
          finalStatus.amountTotal ||
          0
        ) / 100;

            booking.manageUrl =
        finalStatus.manageUrl ||
        "";

      if (finalStatus.appointmentNumber) booking.number = finalStatus.appointmentNumber;

      booking.confirmedAt =
        new Date().toISOString();

      ownBookings.push(booking);

      showConfirmation(booking);
      renderBookingDateCalendar();
      updateAvailableTimes();

      await sendPaidAppointmentNotifications(
        booking
      );

    } catch (error) {

      try {
        if (
          paymentWindow &&
          !paymentWindow.closed &&
          paymentWindow.location.href === "about:blank"
        ) {
          paymentWindow.close();
        }
      } catch {
        // Cross-origin Stripe window. Nothing to close here.
      }

      console.error(
        "Appointment confirmation error:",
        error
      );

      showBookingError(
        error.message ||
        "The appointment could not be completed."
      );

    } finally {

      if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent =
          "Confirm Appointment";
      }

    }

  }


  async function waitForAppointmentConfirmation(
    sessionId,
    paymentWindow
  ) {

    const startedAt =
      Date.now();

    const maximumWaitMs =
      10 * 60 * 1000;

    while (
      Date.now() - startedAt <
      maximumWaitMs
    ) {

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      try {

        const response =
          await fetch(
            `${APPOINTMENT_STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success &&
          result.confirmed
        ) {
          return result;
        }

      } catch (error) {
        console.error(
          "Appointment status check error:",
          error
        );
      }

      if (
        paymentWindow &&
        paymentWindow.closed
      ) {

        try {

          const finalResponse =
            await fetch(
              `${APPOINTMENT_STATUS_URL}?session_id=${encodeURIComponent(sessionId)}`
            );

          const finalResult =
            await finalResponse.json();

          if (
            finalResponse.ok &&
            finalResult.success &&
            finalResult.confirmed
          ) {
            return finalResult;
          }

        } catch {
          // The final status check failed.
        }

        return {
          confirmed: false
        };

      }

    }

    return {
      confirmed: false
    };

  }


  function showBookingError(
    message
  ) {

    if (!confirmationMessage) {
      return;
    }

    confirmationMessage.innerHTML = `
      <p class="booking-error">
        ${escapeHTML(message)}
      </p>
    `;

  }


  // ============================================================
  // CONFIRMATION
  // ============================================================

  function showConfirmation(
    booking
  ) {

    if (!confirmationMessage) {
      return;
    }

    const displayDate =
      formatDisplayDate(
        booking.date
      );

    const displayTime =
      convertTo12Hour(
        booking.time
      );

    const endTime =
      addMinutes(
        booking.time,
        Number(booking.durationMinutes) || APPOINTMENT_LENGTH
      );

    const paymentText =
      booking.paymentChoice ===
      "pay_at_store"
        ? "Pay at Store"
        : `Paid ${formatPrice(
            Number(
              booking.amountPaid ??
              booking.servicePrice
            )
          )}`;

    const manageLink =
      booking.manageUrl
        ? `
          <p>
            <a
              href="${escapeAttribute(booking.manageUrl)}"
              target="_blank"
              rel="noopener"
            >
              Cancel or Reschedule Appointment
            </a>
          </p>
        `
        : "";

    confirmationMessage.innerHTML = `
      <div class="booking-confirmed">

        <h3>
          Appointment Confirmed ✓
        </h3>

        <p>
          <strong>
            ${escapeHTML(booking.customerName)}
          </strong>,
          you're booked with
          <strong>
            ${escapeHTML(booking.barberName)}
          </strong>.
        </p>

        <p>
          <strong>Service:</strong>
          ${escapeHTML(booking.serviceName)}
          -
          ${formatPrice(booking.servicePrice)}
        </p>

        <p>
          <strong>Date:</strong>
          ${displayDate}
        </p>

        <p>
          <strong>Time:</strong>
          ${displayTime}
          -
          ${convertTo12Hour(endTime)}
        </p>

        <p>
          <strong>Payment:</strong>
          ${escapeHTML(paymentText)}
        </p>

        <p>
          <strong>Appointment #:</strong>
          ${escapeHTML(booking.number ? String(booking.number) : booking.id.slice(-6))}
        </p>

        <p
          class="sms-demo-message"
          id="notification-status-${escapeAttribute(booking.id)}"
        >
          Checking appointment notifications...
        </p>

        ${manageLink}

      </div>
    `;

  }


  // ============================================================
  // APPOINTMENT NOTIFICATIONS
  // ============================================================

  async function sendPaidAppointmentNotifications(
    booking
  ) {

    const status =
      document.getElementById(
        `notification-status-${booking.id}`
      );

    try {

      const response =
        await fetch(
          APPOINTMENT_NOTIFICATION_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify({
                sessionId:
                  booking.paymentReference
              })
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
          "Appointment notifications could not be sent."
        );
      }

      if (
        result.manageUrl &&
        !booking.manageUrl
      ) {
        booking.manageUrl =
          result.manageUrl;
      }

      const parts = [];

      // 11/1 (Tom): the Site Builder's practice website (nothing is saved) never sends texts or emails — say so
      // instead of "could not be sent"; the 🔴 LIVE TEST button sends real ones
      if (result.preview) {
        if (status) status.textContent = "Practice booking: no text or email is sent here. Use 🔴 LIVE TEST to get real texts.";
        return;
      }

      if (booking.smsConsent) {
        parts.push(
          result.smsSent
            ? "✓ Confirmation text accepted by the messaging provider; delivery is pending."
            : "Confirmation text could not be sent."
        );
      } else {
        parts.push(
          "SMS notifications were not selected."
        );
      }

      parts.push(
        result.emailSent
          ? "✓ Owner/barber email sent."
          : "Owner/barber email could not be sent."
      );

      if (status) {
        status.textContent =
          parts.join(" ");
      }

    } catch (error) {

      console.error(
        "Appointment notification error:",
        error
      );

      if (status) {
        status.textContent =
          "The appointment is confirmed, but the notification check failed.";
      }

    }

  }


  // ============================================================
  // CANCEL BOOKING
  // ============================================================

  function cancelAppointment(
    bookingId
  ) {

    const bookings =
      getBookings();

    const booking =
      bookings.find(
        item =>
          item.id === bookingId
      );
    if (!booking?.manageUrl) {
      showBookingError("Use the secure appointment link in your confirmation text to cancel.");
      return;
    }
    window.location.href = booking.manageUrl;
    return;

  }


  // ============================================================
  // STORAGE
  // ============================================================

  function getBookings() {
    return [...sharedAvailability, ...ownBookings];

  }


  // ============================================================
  // POLICY LINKS
  // ============================================================

  function configurePolicyLinks() {

    const hasPrivacy =
      Boolean(
        smsSettings.privacyUrl
      );

    const hasTerms =
      Boolean(
        smsSettings.termsUrl
      );

    if (
      privacyPolicyLink &&
      hasPrivacy
    ) {
      privacyPolicyLink.href =
        smsSettings.privacyUrl;
    }

    if (
      termsPolicyLink &&
      hasTerms
    ) {
      termsPolicyLink.href =
        smsSettings.termsUrl;
    }

    if (smsPolicyLinks) {
      smsPolicyLinks.hidden =
        !(hasPrivacy && hasTerms);
    }

  }


  // ============================================================
  // BUSINESS PRO CTA SCROLL GLOW
  // ============================================================

  function configureCtaScrollGlow() {

    if (!ctaButton) {
      return;
    }

    let glowRunning = false;

    const triggerGlow = () => {

      const rect =
        ctaButton.getBoundingClientRect();

      const visible =
        rect.top < window.innerHeight &&
        rect.bottom > 0;

      if (
        !visible ||
        glowRunning
      ) {
        return;
      }

      glowRunning = true;

      ctaButton.classList.add(
        "scroll-glow"
      );

      window.setTimeout(
        () => {
          ctaButton.classList.remove(
            "scroll-glow"
          );
          glowRunning = false;
        },
        900
      );

    };

    window.addEventListener(
      "scroll",
      triggerGlow,
      {
        passive: true
      }
    );

  }


  // ============================================================
  // LOOKUPS
  // ============================================================

  function getProfileById(
    profileId
  ) {

    return profiles.find(
      profile =>
        profile.id === profileId
    ) || null;

  }


  function getBookableBarberById(
    barberId
  ) {

    return bookableBarbers.find(
      barber =>
        barber.id === barberId
    ) || null;

  }


  function getServiceById(
    serviceId
  ) {

    return services.find(
      service =>
        service.id === serviceId
    ) || null;

  }


  // ============================================================
  // HELPERS
  // ============================================================

  function getInitials(
    name
  ) {

    return String(name || "")
      .trim()
      .split(/\s+/)
      .map(
        part =>
          part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  }


  function formatUSPhone(
    phone
  ) {

    let digits =
      String(phone || "")
        .replace(/\D/g, "");

    if (
      digits.length === 11 &&
      digits.startsWith("1")
    ) {
      digits =
        digits.slice(1);
    }

    if (digits.length !== 10) {
      return "";
    }

    return `+1${digits}`;

  }


  function formatPrice(
    value
  ) {

    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return "$0";
    }

    return number.toLocaleString(
      "en-US",
      {
        style:
          "currency",
        currency:
          "USD",
        minimumFractionDigits:
          Number.isInteger(number)
            ? 0
            : 2,
        maximumFractionDigits:
          2
      }
    );

  }


  function formatDisplayDate(
    dateValue
  ) {

    const date =
      parseDateInput(dateValue);

    if (!date) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        weekday:
          "long",
        month:
          "long",
        day:
          "numeric",
        year:
          "numeric"
      }
    );

  }


  function parseDateInput(
    value
  ) {

    if (!value) {
      return null;
    }

    const parts =
      value
        .split("-")
        .map(Number);

    if (
      parts.length !== 3 ||
      parts.some(
        part =>
          !Number.isFinite(part)
      )
    ) {
      return null;
    }

    const date =
      new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
      );

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;

  }


  function toDateInputValue(
    date
  ) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;

  }


  function convertTo12Hour(
    time
  ) {

    if (!time) {
      return "";
    }

    const [hourValue, minuteValue] =
      time
        .split(":")
        .map(Number);

    if (
      !Number.isFinite(hourValue) ||
      !Number.isFinite(minuteValue)
    ) {
      return time;
    }

    const period =
      hourValue >= 12
        ? "PM"
        : "AM";

    const hour =
      hourValue % 12 || 12;

    return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`;

  }


  function timeToMinutes(
    time
  ) {

    const [hours, minutes] =
      String(time || "0:0")
        .split(":")
        .map(Number);

    return (
      (Number(hours) || 0) * 60 +
      (Number(minutes) || 0)
    );

  }


  function minutesToTime(
    totalMinutes
  ) {

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  }


  function addMinutes(
    time,
    amount
  ) {

    return minutesToTime(
      timeToMinutes(time) +
      amount
    );

  }


  function createBookingId() {

    return `BPL-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

  }


  function escapeHTML(
    value
  ) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function escapeAttribute(
    value
  ) {
    return escapeHTML(value);
  }


  function escapeCssUrl(
    value
  ) {

    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "")
      .replace(/\r/g, "");

  }

  if (window.__bpBusinessAudit) {
    window.__bpBusinessAuditApi = {
      async snapshot() {
        await refreshBookingAvailability();
        if (!availabilityReady) throw new Error("Booking availability could not be loaded.");
        const hours = {};
        const rows = [...shopHours.querySelectorAll("p")].map(row => {
          const label = row.querySelector("strong").textContent;
          const text = row.textContent.slice(row.textContent.indexOf(":") + 1).trim();
          const parsed = parseHoursRange(text);
          for (const day of parseHoursDays(label)) hours[day] = parsed === "closed"
            ? { open: false, start: "", end: "" } : { open: true, ...parsed };
          return { days: label, hours: text };
        });
        const availability = [], bookingServices = [];
        for (const barber of bookableBarbers) {
          openBookingModal(barber.id);
          bookingServices.push({ name: barber.name, services: [...serviceSelect.options].filter(option => option.value).map(option => {
            const at = option.textContent.lastIndexOf(" - ");
            return { name: option.textContent.slice(0, at), price: Number(option.textContent.slice(at + 3).replace(/[^0-9.]/g, "")), id: option.value };
          }) });
          for (const serviceId of barber.serviceIds) {
            openBookingModal(barber.id, serviceId);
            for (let offset = 1; offset <= 7; offset++) {
              const date = new Date();
              date.setDate(date.getDate() + offset);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              dateInput.value = key;
              updateAvailableTimes();
              availability.push({ name: barber.name, barberId: barber.id, serviceId, date: key, offset, day: date.getDay(), duration: serviceMinutes(serviceId),
                times: getDateAvailability(barber, key).times,
                options: [...timeSelect.options].filter(option => option.value).map(option => option.value) });
            }
          }
        }
        closeBookingModal();
        return { hours, hoursRows: rows, availability, bookingServices, bookings: getBookings(), timeOff: getApprovedTimeOff(), closures: businessClosures,
          team: [...barberSelector.querySelectorAll(".barber-selector-card:not(.business-pro-profile-card)")].map(card => ({
            id: card.dataset.barberId, name: card.querySelector("h3").textContent.trim() })),
          bookingTeam: [...barberSelect.options].filter(option => option.value).map(option => ({ id: option.value, name: option.textContent.trim() })),
          services: [...servicesList.querySelectorAll(".service-card")].map(card => ({
            name: card.querySelector("h3").textContent.trim(), price: Number(card.querySelector("p").textContent.replace(/[^0-9.]/g, "")) })) };
      }
    };
  }

});
/* ============================================================
   11/7 (Tom): LUXURY SKIN - EVERY GOLD WORD GETS THE GOLD METAL
   Any text that shows in the gold color (any size) gets the
   real gold metal finish, same as the headline. Text sitting on
   a colored button/box is left alone so it stays readable.
============================================================ */
(function goldMetalWords() {
  var SKIP = { SCRIPT: 1, STYLE: 1, IMG: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, svg: 1, path: 1, SVG: 1, PATH: 1 };
  function goldColors() {
    var probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
    var out = ["--accent", "--accent-light"].map(function (v) {
      probe.style.color = "var(" + v + ")";
      return getComputedStyle(probe).color;
    });
    probe.remove();
    return out;
  }
  function rgb(c) { return (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number); }
  function isGold(c, golds) {
    var a = rgb(c);
    return golds.some(function (g) {
      var b = rgb(g);
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 40;
    });
  }
  function paint() {
    if (!document.body || !document.body.classList.contains("style-luxury")) return;
    var golds = goldColors();
    document.querySelectorAll("body *").forEach(function (el) {
      if (SKIP[el.tagName] || el.closest("svg") || el.classList.contains("lux-gold-text")) return;
      var hasText = Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
      if (!hasText) return;
      var s = getComputedStyle(el);
      if (!isGold(s.color, golds)) return;
      var bg = s.backgroundColor;
      if (s.backgroundImage !== "none" || (bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)")) return;
      el.classList.add("lux-gold-text");
    });
  }
  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(paint, 150); }
  function start() {
    paint();
    setTimeout(paint, 600);
    new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
