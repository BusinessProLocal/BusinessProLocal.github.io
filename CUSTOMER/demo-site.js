(function () {
  "use strict";
  const config = window.SHOP_CONFIG, api = window.BusinessProDemo, forms = window.BusinessProForms;
  const app = document.getElementById("demo-app");
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const money = cents => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  const $ = id => document.getElementById(id);
  const bookingEnabled = config.demo.tier === "professional", storeEnabled = config.demo.tier === "business-pro";
  const pageName = document.body.dataset.page || "home";
  let visitor, dashboardOpen = false, dashboardView = "dashboard";
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let ownerCalendarDate = null, ownerCalendarView = "day", employeeFilter = "all";
  let ownerCalendarObserver = null;
  let adLayoutObserver = null;
  const ownerStyles = document.createElement("link");
  ownerStyles.rel = "stylesheet";
  ownerStyles.href = "../../CUSTOMER/demo-owner.css";
  document.head.appendChild(ownerStyles);
  const employeeColor = id => id === config.barbers?.[0]?.id ? "#2463eb" : "#b8860b";
  const previewPhotos = {};
  const photoMessages = {};
  const ownerTabs = config.ownerTabs || [];
  const visitedLiveTabs = new Set();
  const expandedOwnerTabs = new Set();
  let previewPopupTimer;
  const plansLink = "../../index.html#start";
  function ownerTabLabel(tab) {
    const staff = config.barbers?.find(staff => staff.id === tab.staffId);
    return staff ? `${staff.name}'s ${tab.label}` : tab.label;
  }
  function openOwnerTab(id) {
    const tab = ownerTabs.flatMap(tab => [tab, ...(tab.children || [])]).find(tab => tab.id === id);
    if (!tab) throw new Error("Unknown demo owner tab.");
    if (tab.live) visitedLiveTabs.add(id);
    dashboardView = id;
    if (id === "appointments" && bookingEnabled) {
      const own = api.read(localStorage, config).bookings.filter(item => !item.example).at(-1);
      ownerCalendarView = "day";
      ownerCalendarDate = new Date(own.date + "T12:00:00");
    }
    renderDashboard();
    window.scrollTo({ top: 0 });
  }
  function ownerNavigation() {
    const button = (tab, child = false) => `<button type="button" data-owner-tab="${escape(tab.id)}"
      ${tab.children ? `aria-expanded="${expandedOwnerTabs.has(tab.id)}" aria-controls="demo-submenu-${tab.id}"` : ""}
      class="${dashboardView === tab.id ? "active " : ""}${tab.live ? "owner-live-tab" : "owner-preview-tab"} ${tab.live && !visitedLiveTabs.has(tab.id) ? "owner-live-pulse" : ""} ${child ? "owner-subtab" : ""}">
      <span>${escape(ownerTabLabel(tab))}</span><span class="owner-tab-tag">${tab.live ? "LIVE" : "Preview"}</span>${tab.children ? '<span class="nav-caret">&#9662;</span>' : ""}</button>`;
    return ownerTabs.map(tab => button(tab) + (tab.children ?
      `<div class="owner-demo-submenu" id="demo-submenu-${tab.id}" ${expandedOwnerTabs.has(tab.id) ? "" : "hidden"}>${tab.children.map(child => button(child, true)).join("")}</div>` : "")).join("");
  }
  const extraPhotos = config.photos.slice(1).filter(photo => photo.src !== config.photos[0].src);
  const status = message => { $("demo-status").textContent = message; };
  function error(failure) {
    $("demo-error").textContent = "Demo action failed: " + failure.message;
    console.error(failure);
  }
  function action(callback) {
    $("demo-error").textContent = "";
    try { callback(); } catch (failure) { error(failure); }
  }
  const image = (src, alt, className = "") => `<img class="${className}" src="${escape(src)}" alt="${escape(alt)}" loading="lazy">`;
  const ads = [
    { name: "Pine & Blade", type: "Barbershop", tagline: "Classic cuts & hot-towel shaves", button: "Book now",
      bg: "#13261c", accent: "#d9b25c", glow: "#2b5a40", photo: "../assets/ads/ad-pine-blade.jpg",
      icon: '<circle cx="14" cy="36" r="6"/><circle cx="34" cy="36" r="6"/><path d="M18 31 36 7M30 31 12 7"/>' },
    { name: "Harbor Light Salon", type: "Hair salon", tagline: "Color, cuts & styling", button: "Book now",
      bg: "#14213d", accent: "#f2c57c", glow: "#2f4a80", photo: "../assets/ads/ad-harbor-light.jpg",
      icon: '<path d="M8 18h32v7H8z"/><path d="M11 25v12M15 25v12M19 25v12M23 25v12M27 25v12M31 25v12M35 25v12"/><path d="M38 6l1.5 3.5L43 11l-3.5 1.5L38 16l-1.5-3.5L33 11l3.5-1.5z" class="fill"/>' },
    { name: "Seaside Treasures", type: "Gifts & keepsakes", tagline: "Maine-made gifts, candles & sea glass", button: "Shop now",
      bg: "#0f3b3e", accent: "#f0d9a8", glow: "#1f6f73", photo: "../assets/ads/ad-seaside-treasures.jpg",
      icon: '<path d="M24 40 7 21C12 9 36 9 41 21Z"/><path d="M24 40 13 15M24 40 19 12M24 40V11M24 40 29 12M24 40 35 15"/><path d="M19 40h10"/>' },
    { name: "Northway Auto Care", type: "Auto shop", tagline: "Honest repairs, oil changes & inspections", button: "Call today",
      bg: "#1c1c1e", accent: "#e4572e", glow: "#3a2a24", photo: "../assets/ads/ad-northway-auto.jpg",
      icon: '<path d="M38.5 9.5a8 8 0 0 0-10.6 10L10 37.4a3 3 0 0 0 4.2 4.2L32 23.7a8 8 0 0 0 10-10.6l-5.2 5.2-4.6-1.1-1.1-4.6z"/>' },
    { name: "Iron Anchor Tattoo", type: "Tattoo & piercing", tagline: "Custom tattoos & piercing", button: "Book now",
      bg: "#0b0b0b", accent: "#c8102e", glow: "#3a0d14", photo: "../assets/ads/ad-iron-anchor.jpg",
      icon: '<circle cx="24" cy="9" r="4"/><path d="M24 13v28M15 20h18"/><path d="M8 29c1 7 8 12 16 12s15-5 16-12"/><path d="M5 32l3-4 4 3M43 32l-3-4-4 3"/>' },
    { name: "Evergreen Home Services", type: "Home services", tagline: "Cleaning, landscaping & snow plowing", button: "Get a quote",
      bg: "#16301f", accent: "#9fd18b", glow: "#2c5d3a", photo: "../assets/ads/ad-evergreen-home.jpg",
      icon: '<path d="M24 5 13 21h6L9 34h30L29 21h6z"/><path d="M24 34v8"/>' },
    { name: "Muddy Paws Pet Care", type: "Pet care", tagline: "Grooming, boarding & play", button: "Book now",
      bg: "#3b2414", accent: "#f4a259", glow: "#6b3f1f", photo: "../assets/ads/ad-muddy-paws.jpg",
      icon: '<ellipse class="fill" cx="24" cy="32" rx="9" ry="7.5"/><circle class="fill" cx="12.5" cy="21" r="3.8"/><circle class="fill" cx="19.5" cy="13.5" r="3.8"/><circle class="fill" cx="28.5" cy="13.5" r="3.8"/><circle class="fill" cx="35.5" cy="21" r="3.8"/>' },
    { name: "Sea Glass Nails & Spa", type: "Nails & spa", tagline: "Manicures, pedicures & massage", button: "Book now",
      bg: "#1d3b3a", accent: "#a8e6cf", glow: "#3f7f78", photo: "../assets/ads/ad-sea-glass.jpg",
      icon: '<path d="M24 40c-7-6-7-18 0-28 7 10 7 22 0 28z"/><path d="M24 40c-9 0-17-5-18-14 7-1 14 4 18 14zM24 40c9 0 17-5 18-14-7-1-14 4-18 14z"/>' }
  ];
  function adCard(ad, fullSize = false, banner = false) {
    const sponsored = '<span class="ad-sponsored">Sponsored</span>';
    if (ad.photo && banner) return `<span class="ad-card ad-banner">
      ${sponsored}
      ${image(ad.photo, `${ad.name} - ${ad.tagline}`, "ad-photo")}
      <span class="ad-banner-strip"><span class="ad-name">${escape(ad.name)}</span><span class="ad-banner-cta">Shop now</span></span></span>`;
    if (ad.photo && !banner) return `<span class="ad-card ad-photo-card${fullSize ? " ad-card-full" : ""}">
      ${sponsored}
      ${image(ad.photo, `${ad.name} - ${ad.tagline}`, "ad-photo")}</span>`;
    return `<span class="ad-card${fullSize ? " ad-card-full" : ""}${banner ? " ad-banner" : ""}" style="--bg:${ad.bg};--accent:${ad.accent};--glow:${ad.glow}">
      ${sponsored}
      <span class="ad-art"><span class="ad-badge"><svg viewBox="0 0 48 48" aria-hidden="true">${ad.icon}</svg></span></span>
      <span class="ad-text"><span class="ad-type">${escape(ad.type)}</span>
      <span class="ad-name"${fullSize ? ' id="ad-popup-name"' : ""}>${escape(ad.name)}</span>
      <span class="ad-tagline">${escape(ad.tagline)}</span><span class="ad-cta">${escape(ad.button)}</span></span></span>`;
  }
  function renderShell() {
    app.classList.toggle("has-customer-ads", pageName === "home");
    app.classList.toggle("barber-customer-demo", bookingEnabled);
    document.title = config.shop.pageTitle;
    app.innerHTML = `${bookingEnabled ? '<div class="customer-demo-banner">Customer Demo &mdash; this is what your customers see when they book an appointment with you.</div>' : ""}
      <div class="test-bar">TEST PAGE &middot; NOT LIVE</div>
      <div class="demo-ribbon">DEMO MODE &middot; ${storeEnabled ? "Business Pro" : "Business Pro " + escape(config.demo.label)}</div>
      <header class="shop-header"><h1>${escape(config.shop.name)}</h1><nav aria-label="Main navigation">
      <a href="index.html#home">Home</a><a href="index.html#${storeEnabled ? "store" : "services"}">${storeEnabled ? "Shop" : bookingEnabled ? "Services" : "Menu"}</a>
      ${extraPhotos.length && !storeEnabled ? '<a href="index.html#photos">Photos</a>' : ""}<a href="index.html#contact">Contact</a>
      ${bookingEnabled ? '<a href="index.html#booking">Book an appointment</a>' : ""}
      ${storeEnabled ? '<a id="cart-link" href="index.html#checkout">Cart</a>' : ""}</nav></header>
      <div class="demo-pricing"><a class="book-button" href="../../index.html#plans">Like what you see? See Plans &amp; Pricing &rarr;</a></div>
      <p class="demo-notice">Demo only. Saved on this device. No real texts, emails, payments or shipping; no shop server connections.</p>
      <p id="demo-error" class="demo-error" role="alert"></p><p id="demo-status" role="status" aria-live="polite"></p>
      <main id="demo-content"></main>
      <div class="demo-pricing"><a class="book-button" href="../../index.html#plans">Like what you see? See Plans &amp; Pricing &rarr;</a></div>
      <footer>${escape(config.shop.name)} &middot; ${escape(config.demo.label)} demo by Business Pro</footer>`;
    if (pageName === "home") renderAds();
  }
  function updateCartLink() {
    if ($("cart-link")) $("cart-link").textContent = `Cart (${api.read(localStorage, config).cart.reduce((sum, item) => sum + item.quantity, 0)})`;
  }
  function renderAds() {
    const excluded = bookingEnabled ? [0, 1] : storeEnabled ? [2, 5] : [];
    const selected = ads.map((ad, index) => ({ ad, index })).filter(item => !excluded.includes(item.index));
    $("demo-content").insertAdjacentHTML("beforebegin", `<div id="sample-ads"><p class="ad-label">Sample ads: Business Pro customers can choose to be featured on other local Business Pro websites.</p>
      </div>
      <div class="ad-mobile-row" aria-label="Other local businesses">${selected.map(({ ad, index }) =>
        `<button type="button" class="ad-tab" data-ad="${index}" aria-label="${escape(ad.name)} sample ad" aria-haspopup="dialog">${adCard(ad, false, true)}</button>`).join("")}</div>
      <dialog id="ad-popup" aria-label="Sample business ad"><div id="ad-popup-content"></div>
      <button type="button" id="close-ad">Close ad</button></dialog>`);
    document.querySelectorAll("[data-ad]").forEach(button => button.addEventListener("click", () => {
      $("ad-popup-content").innerHTML = `${adCard(ads[Number(button.dataset.ad)], true)}
        <p>Sample ad: this would open their website.</p>`;
      $("ad-popup").showModal();
    }));
    $("close-ad").addEventListener("click", () => $("ad-popup").close());
    $("ad-popup").addEventListener("click", event => { if (event.target === $("ad-popup")) $("ad-popup").close(); });
  }
  function emptyAdSpots(bounds, obstacles) {
    const levels = [...new Set([bounds.top, bounds.bottom, ...obstacles.flatMap(rect =>
      [Math.max(bounds.top, rect.top - 10), Math.min(bounds.bottom, rect.bottom + 10)])])]
      .filter(y => y >= bounds.top && y <= bounds.bottom).sort((a, b) => a - b);
    const spots = [];
    for (let start = 0; start < levels.length - 1; start++) {
      for (let end = start + 1; end < levels.length; end++) {
        const top = levels[start], bottom = levels[end];
        if (bottom - top < 56) continue;
        const blocked = obstacles.filter(rect => rect.top - 10 < bottom && rect.bottom + 10 > top)
          .map(rect => [Math.max(bounds.left, rect.left - 10), Math.min(bounds.right, rect.right + 10)])
          .filter(([left, right]) => right > left).sort((a, b) => a[0] - b[0]);
        let left = bounds.left;
        const gaps = [];
        for (const [begin, finish] of blocked) {
          if (begin > left) gaps.push([left, begin]);
          left = Math.max(left, finish);
        }
        if (left < bounds.right) gaps.push([left, bounds.right]);
        for (const [begin, finish] of gaps) {
          if (finish - begin < 100) continue;
          const height = Math.min(bottom - top, 260);
          const width = Math.min(finish - begin, height < 100 ? 300 : 260);
          spots.push({ left: begin + (finish - begin - width) / 2,
            top: top + (bottom - top - height) / 2, width, height });
        }
      }
    }
    return spots.sort((a, b) => b.width * b.height - a.width * a.height);
  }
  function layoutAds() {
    const row = document.querySelector(".ad-mobile-row");
    if (!row || document.body.classList.contains("demo-owner-open")) return;
    const buttons = [...row.querySelectorAll("[data-ad]")];
    buttons.forEach(button => {
      button.classList.remove("ad-gap", "ad-compact");
      button.hidden = false;
      button.removeAttribute("style");
      button.dataset.placement = "below shop photo";
    });
    if ($("demo-error").textContent.startsWith("Some sample ads cannot fit safely")) $("demo-error").textContent = "";
    if (window.innerWidth <= 600) return;
    buttons.forEach(button => button.classList.add("ad-gap"));
    const appBounds = app.getBoundingClientRect();
    const appStyles = getComputedStyle(app);
    const borderLeft = parseFloat(appStyles.borderLeftWidth);
    const borderTop = parseFloat(appStyles.borderTopWidth);
    const obstacles = [];
    document.querySelectorAll(".hero-photo, #demo-content .card, #demo-content .demo-gallery, #services .menu, #booking .demo-form, #checkout .demo-form, #checkout .demo-summary, .hero-content > button, .hero-content > a").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) obstacles.push(rect);
    });
    // Text blocks often span the whole column, but their actual lettering does not.
    document.querySelectorAll("#demo-content > section > h2, #demo-content > section > p, .hero-content > h2, .hero-content > p, .contact-details > *, .shop-header h1, .shop-header nav a").forEach(el => {
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const rect of range.getClientRects()) {
        if (rect.width && rect.height) obstacles.push(rect);
      }
    });
    const regions = [];
    const addRegion = (element, label, top, bottom) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      regions.push({ label, left: appBounds.left + 24, right: appBounds.right - 24,
        top: top ?? rect.top, bottom: bottom ?? rect.bottom });
    };
    const hero = document.querySelector(".hero-content");
    const callToAction = hero.querySelector("button, a");
    addRegion(callToAction, `home, beside ${callToAction.textContent.trim()} button`,
      Math.max(hero.querySelector("p").getBoundingClientRect().bottom + 10, callToAction.getBoundingClientRect().top - 6),
      document.querySelector("#home").getBoundingClientRect().bottom - 8);
    addRegion(hero, "home, beside hero text", hero.getBoundingClientRect().top + 20,
      callToAction.getBoundingClientRect().top - 10);
    document.querySelectorAll("#services .menu, #services .card-grid, #barbers .card-grid, #store .card-grid, #booking .demo-form, #checkout .demo-form, .contact-details").forEach(el =>
      addRegion(el, `${el.closest("section").id}, beside ${el.classList.contains("menu") ? "menu" : el.classList.contains("card-grid") ? "cards / open row end" : el.classList.contains("contact-details") ? "contact details" : "form"}`));
    document.querySelectorAll("#demo-content > section:not(#home)").forEach(section => {
      const heading = section.querySelector("h2");
      addRegion(heading, `${section.id}, beside section heading`,
        section.getBoundingClientRect().top + 8, heading.getBoundingClientRect().bottom + 12);
    });
    const header = document.querySelector(".shop-header");
    addRegion(header, "shop header, beside title / navigation",
      header.getBoundingClientRect().top + 10, header.getBoundingClientRect().bottom - 8);
    const placements = [];
    // One ad per region per pass: use independent open spots before returning
    // to a second side. Never convert a long gutter into a stack of ads.
    const usedSpots = new Set();
    if (bookingEnabled && window.innerWidth >= 1024) {
      const buttonBounds = callToAction.getBoundingClientRect();
      const center = buttonBounds.left + buttonBounds.width / 2;
      const pair = symmetricAdSpots(regions[0], obstacles, center);
      if (pair.length) {
        placements.push(...pair.map((spot, index) => ({
          ...spot, label: `${regions[0].label}, ${index ? "right" : "left"}`
        })));
        usedSpots.add(`${regions[0].label}/left`);
        usedSpots.add(`${regions[0].label}/right`);
      }
    }
    for (let pass = 0; pass < 2 && placements.length < buttons.length; pass++) {
      for (const region of regions) {
        const spot = emptyAdSpots(region, [...obstacles, ...placements.map(slot => ({
          left: slot.left - 32, right: slot.left + slot.width + 32,
          top: slot.top - 40, bottom: slot.top + slot.height + 40
        }))]).find(slot => {
          const side = slot.left + slot.width / 2 < appBounds.left + appBounds.width / 2 ? "left" : "right";
          return !usedSpots.has(`${region.label}/${side}`);
        });
        if (!spot) continue;
        const side = spot.left + spot.width / 2 < appBounds.left + appBounds.width / 2 ? "left" : "right";
        usedSpots.add(`${region.label}/${side}`);
        placements.push({ ...spot, label: `${region.label}, ${side}` });
        if (placements.length === buttons.length) break;
      }
    }
    if (placements.length < buttons.length) {
      $("demo-error").textContent = "Some sample ads cannot fit safely at this size. They are hidden to keep shop content clear.";
      console.error("Not enough safe individual ad spots.", { width: window.innerWidth, placed: placements.length, total: buttons.length });
    }
    buttons.forEach((button, index) => {
      const slot = placements[index];
      button.hidden = !slot;
      if (!slot) return;
      button.classList.toggle("ad-compact", slot.width < 170 || slot.height < 100);
      button.style.left = `${slot.left - appBounds.left - borderLeft}px`;
      button.style.top = `${slot.top - appBounds.top - borderTop}px`;
      button.style.width = `${slot.width}px`;
      button.style.height = `${slot.height}px`;
      button.dataset.placement = slot.label;
    });
  }
  function symmetricAdSpots(bounds, obstacles, center) {
    const leftSpots = emptyAdSpots({ ...bounds, right: center }, obstacles);
    for (const left of leftSpots) {
      const right = { ...left, left: 2 * center - left.left - left.width };
      if (right.left + right.width > bounds.right) continue;
      if (obstacles.some(rect => right.left < rect.right + 10 &&
        right.left + right.width > rect.left - 10 &&
        right.top < rect.bottom + 10 && right.top + right.height > rect.top - 10)) continue;
      return [left, right];
    }
    return [];
  }
  function renderHome() {
    document.body.classList.remove("demo-owner-open");
    app.classList.toggle("barber-customer-demo", bookingEnabled);
    const mobileAds = document.querySelector(".ad-mobile-row");
    if (mobileAds) mobileAds.remove();
    const shop = config.shop, state = api.read(localStorage, config);
    $("demo-content").innerHTML = `<section id="home">${image(config.photos[0].src, config.photos[0].alt, "hero-photo")}
      <div class="hero-content"><h2>${escape(shop.heroTitle)}</h2><p>${escape(shop.heroSubtitle)}</p>
      ${!bookingEnabled && !storeEnabled ? '<button id="call-order" type="button">Call to order</button><p id="call-message" role="status"></p>' :
        `<a class="book-button" href="#${storeEnabled ? "store" : "booking"}">${storeEnabled ? "Shop coastal gifts" : "Customer Demo"}</a>`}</div></section>
      ${config.menu ? `<section id="services"><h2>Our Menu</h2><div class="menu">${config.menu.map(group =>
        `<article><h3>${escape(group.name)}</h3><ul class="menu-items">${group.items.map(item =>
          `<li>${image(item.photo, item.text.split("$")[0].trim(), "menu-thumbnail")}<span>${escape(item.text)}</span></li>`).join("")}</ul></article>`).join("")}</div></section>` : ""}
      ${bookingEnabled ? `<section id="services"><h2>Our Services</h2><div class="card-grid">${config.services.map(service =>
        `<article class="card"><h3>${escape(service.name)}</h3><p>${escape(service.description)}</p><p>${money(service.price * 100)}</p></article>`).join("")}</div></section>` : ""}
      ${extraPhotos.length && !storeEnabled ? `<section id="photos"><h2>A Look Around</h2><div class="demo-gallery">
      ${extraPhotos.map(photo => image(photo.src, photo.alt)).join("")}</div></section>` : ""}
      ${bookingEnabled ? `<section id="barbers"><h2>Meet the Barbers</h2><div class="card-grid">${config.barbers.map((staff, index) =>
        `<article class="card"><h3>${escape(staff.name)}</h3><p>${escape(staff.cardSpecialty)}</p><p>${escape(staff.bio)}</p>
        ${index === 0 ? photoControl("barber-photo", "barberPhoto", "Add your barber photo", "Your barber photo", state) : ""}</article>`).join("")}</div></section>
      <section id="booking"><h2>Book Your Appointment</h2><p>This is exactly how your customers will book an appointment.</p>
      ${bookingForm()}</section>` : ""}
      ${storeEnabled ? `<section id="store"><h2>Shop Coastal Favorites</h2><p>Ship to your address or choose free local pickup.</p>
      <div class="card-grid">${config.products.map(product => {
        const count = api.stock(config, state, product.id);
        return `<article class="card product-card">${image(product.photo, product.name)}<h3>${escape(product.name)}</h3>
          <p>${money(product.priceCents)}</p><p class="product-description">${escape(product.description)}</p>
          <p>${count === 0 ? "Out of stock" : count <= 3 ? `Only ${count} left` : "In stock"}</p>
          <div class="add-row"><label>Quantity<select data-qty="${escape(product.id)}" autocomplete="off" aria-label="${escape(product.name)} quantity">
          ${Array.from({ length: Math.min(count, 10) + 1 }, (_, quantity) =>
            `<option value="${quantity}" ${quantity === (state.cart.find(item => item.id === product.id)?.quantity || 0) ? "selected" : ""}>${quantity}</option>`).join("")}
          </select></label></div>
          <p class="added-message" data-added="${escape(product.id)}" role="status"></p></article>`;
      }).join("")}</div></section>` : ""}
      ${storeEnabled ? `<section id="checkout"><h2>Your Order</h2>${checkoutContent(state)}</section>` : ""}
      <section id="contact"><h2>Hours &amp; Contact</h2><div class="contact-details"><p>${escape(shop.phoneDisplay)} &middot; ${escape(shop.email)}</p>
      <p class="address">${escape([shop.addressLine1, shop.addressLine2].filter(Boolean).join(", "))}</p><h3>Hours</h3>
      ${shop.hours.map(row => `<p><strong>${escape(row.days)}</strong>: ${escape(row.hours)}</p>`).join("")}</div></section>`;
    if (mobileAds) document.querySelector(".hero-photo").insertAdjacentElement("afterend", mobileAds);
    adLayoutObserver?.disconnect();
    adLayoutObserver = new ResizeObserver(layoutAds);
    document.querySelectorAll(".shop-header, #demo-content > section, .hero-photo, #booking .demo-form, #checkout .demo-form, .contact-details").forEach(el => adLayoutObserver.observe(el));
    document.querySelectorAll("#demo-content img").forEach(img => img.addEventListener("load", layoutAds));
    document.fonts.ready.then(layoutAds);
    layoutAds();
    if ($("call-order")) $("call-order").addEventListener("click", () => { $("call-message").textContent = `Call ${shop.phoneDisplay} to order`; });
    if (bookingEnabled) {
      setupBooking();
      photoInput("barber-photo", "barberPhoto");
    }
    if (storeEnabled) setupCheckout();
    document.querySelectorAll("[data-qty]").forEach(select => select.addEventListener("change", () => {
      const id = select.dataset.qty;
      const message = document.querySelector(`[data-added="${id}"]`);
      message.textContent = "";
      try {
        const quantity = Number(select.value);
        if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10) throw new Error("Choose a quantity from 0 to 10.");
        const state = api.setQuantity(localStorage, config, id, quantity);
        select.dataset.savedQuantity = String(quantity);
        updateOrderTotals(state);
        updateCartLink();
      } catch (failure) {
        select.value = select.dataset.savedQuantity || String(state.cart.find(item => item.id === id)?.quantity || 0);
        message.textContent = failure.message;
        console.error(failure);
      }
    }));
  }
  function contactFields(prefix) {
    return `<label>Your name<input id="${prefix}-name" required maxlength="80" autocomplete="name"></label>
      <label>Phone<input id="${prefix}-phone" type="tel" required autocomplete="tel"></label>
      <label>Email<input id="${prefix}-email" type="email" required maxlength="254" autocomplete="email"></label>`;
  }
  function enhanceContact(form, prefix) {
    const fields = { name: `${prefix}-name`, phone: `${prefix}-phone`, email: `${prefix}-email` };
    const values = () => ({ ...forms.leadValues(localStorage), name: "Jake Miller" });
    forms.enhance(form);
    forms.fill(fields, values());
    forms.addDemoButton(form, fields, values);
  }
  function bookingForm() {
    return `<form id="booking-form" class="demo-form"><fieldset><legend>1. Pick a service</legend>
      <label>Choose a service<select id="demo-service" required><option value="">Select a service</option>
      ${config.services.map(service => `<option value="${escape(service.id)}">${escape(service.name)} - ${money(service.price * 100)}</option>`).join("")}</select></label></fieldset>
      <fieldset><legend>2. Pick your barber</legend><label>Choose your barber<select id="demo-staff" required disabled>
      <option value="">Select a service first</option></select></label><p id="booking-with">Booking with: choose your barber</p></fieldset>
      <fieldset><legend>3. Pick a day</legend><input id="demo-date" type="hidden">
      <div class="booking-date-calendar" aria-label="Available appointment dates">
      <div class="booking-date-calendar-toolbar"><button id="calendar-prev" type="button" aria-label="Previous month">&lt;</button>
      <strong id="calendar-month"></strong><button id="calendar-next" type="button" aria-label="Next month">&gt;</button></div>
      <div class="booking-date-weekdays" aria-hidden="true">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => `<span>${day}</span>`).join("")}</div>
      <div id="calendar-days" class="booking-date-grid"></div><p class="booking-date-note">Choose your barber to see available days. Unavailable days cannot be selected.</p></div></fieldset>
      <fieldset><legend>4. Pick a time</legend><label>Choose an available time<select id="demo-time" required disabled><option value="">Choose a day first</option></select></label></fieldset>
      <fieldset id="booking-info" disabled><legend>5. Your information</legend>${contactFields("demo")}</fieldset>
      <div id="booking-summary" class="demo-summary" aria-live="polite"></div>
      <p>No payment or text consent is needed in demo mode. Nothing is sent.</p>
      <p id="booking-error" class="checkout-error" role="alert"></p>
      <button type="submit" id="demo-confirm" disabled>Confirm appointment</button></form>`;
  }
  function renderCalendar() {
    const days = api.dates(), state = api.read(localStorage, config);
    const first = new Date(days[0] + "T00:00:00"), last = new Date(days.at(-1) + "T00:00:00");
    $("calendar-month").textContent = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    $("calendar-prev").disabled = calendarMonth <= new Date(first.getFullYear(), first.getMonth(), 1);
    $("calendar-next").disabled = calendarMonth >= new Date(last.getFullYear(), last.getMonth(), 1);
    const offset = (calendarMonth.getDay() + 6) % 7;
    let html = "<span></span>".repeat(offset);
    const count = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= count; day++) {
      const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const available = api.slots(config, state, $("demo-staff").value, $("demo-service").value, key);
      html += `<button type="button" class="booking-date-day ${$("demo-date").value === key ? "is-selected" : ""}" data-day="${key}"
        aria-pressed="${$("demo-date").value === key}" aria-label="${key}${available.length ? " available" : " unavailable"}" ${available.length ? "" : "disabled"}>
        ${day}${!available.length && days.includes(key) && $("demo-staff").value ? "<small>OFF/FULL</small>" : ""}</button>`;
    }
    $("calendar-days").innerHTML = html;
    document.querySelectorAll("[data-day]").forEach(button => button.addEventListener("click", () => action(() => {
      $("demo-date").value = button.dataset.day;
      renderCalendar(); refreshTimes();
    })));
  }
  function refreshTimes() {
    const available = api.slots(config, api.read(localStorage, config), $("demo-staff").value, $("demo-service").value, $("demo-date").value);
    $("demo-time").innerHTML = '<option value="">Select a time</option>' + available.map(time => `<option value="${time}">${api.timeLabel(time)}</option>`).join("");
    $("demo-time").disabled = !available.length;
    refreshSummary();
  }
  function refreshSummary() {
    const service = config.services.find(item => item.id === $("demo-service").value);
    const staff = config.barbers.find(item => item.id === $("demo-staff").value);
    const ready = Boolean(service && staff && $("demo-date").value && $("demo-time").value);
    $("booking-info").disabled = !ready;
    $("demo-confirm").disabled = !ready;
    $("booking-summary").textContent = ready ?
      `${service.name} with ${staff.name} on ${$("demo-date").value} at ${api.timeLabel($("demo-time").value)}. ${money(service.price * 100)}; nothing charged in this demo.` : "";
  }
  function setupBooking() {
    enhanceContact($("booking-form"), "demo");
    $("booking-form").querySelector(".demo-fill").addEventListener("click", () => formAction("booking-error", () => {
      $("demo-service").selectedIndex = 1; $("demo-service").dispatchEvent(new Event("change"));
      $("demo-staff").selectedIndex = 1; $("demo-staff").dispatchEvent(new Event("change"));
      const state = api.read(localStorage, config);
      const day = api.dates().find(date => api.slots(config, state, $("demo-staff").value, $("demo-service").value, date).length);
      if (!day) throw new Error("No demo appointments are available in the next 30 days.");
      $("demo-date").value = day;
      const date = new Date(day + "T12:00:00");
      calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      renderCalendar(); refreshTimes();
      $("demo-time").selectedIndex = 1;
      refreshSummary();
    }));
    $("demo-service").addEventListener("change", () => action(() => {
      const staff = config.barbers.filter(item => item.serviceIds.includes($("demo-service").value));
      $("demo-staff").innerHTML = '<option value="">Select a barber</option>' + staff.map(item =>
        `<option value="${escape(item.id)}">${escape(item.name)}</option>`).join("");
      $("demo-staff").disabled = !staff.length;
      $("demo-date").value = "";
      renderCalendar(); refreshTimes();
    }));
    $("demo-staff").addEventListener("change", () => action(() => {
      $("booking-with").textContent = "Booking with: " + (config.barbers.find(item => item.id === $("demo-staff").value)?.name || "choose your barber");
      $("demo-date").value = "";
      renderCalendar(); refreshTimes();
    }));
    [["calendar-prev", -1], ["calendar-next", 1]].forEach(([id, delta]) => $(id).addEventListener("click", () => action(() => {
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1);
      renderCalendar();
    })));
    $("demo-time").addEventListener("change", refreshSummary);
    $("booking-form").addEventListener("submit", event => {
      event.preventDefault();
      formAction("booking-error", () => {
        api.book(localStorage, config, { serviceId: $("demo-service").value, staffId: $("demo-staff").value,
          date: $("demo-date").value, time: $("demo-time").value, name: $("demo-name").value,
          phone: $("demo-phone").value, email: $("demo-email").value });
        jumpToDashboard();
      });
    });
    renderCalendar();
  }
  function formAction(errorId, callback) {
    $(errorId).textContent = "";
    try { callback(); }
    catch (failure) {
      if ($(errorId)) { $(errorId).textContent = failure.message; console.error(failure); }
      else error(failure);
    }
  }
  function jumpToDashboard() {
    dashboardOpen = true;
    dashboardView = "dashboard";
    renderDashboard();
    document.querySelector("#daily-dashboard .topbar").scrollIntoView({ block: "start", behavior: "instant" });
  }
  function renderCart() {
    const state = api.read(localStorage, config);
    $("demo-content").innerHTML = `<section><h2>Your Cart</h2>${state.cart.length ? state.cart.map(item => {
      const product = config.products.find(product => product.id === item.id);
      return `<article class="cart-row">${image(product.photo, product.name)}<div><h3>${escape(product.name)}</h3><p>${money(product.priceCents)} each</p></div>
        <label>Quantity<input type="number" min="1" max="${Math.min(99, api.stock(config, state, item.id))}" step="1" value="${item.quantity}" data-quantity="${escape(item.id)}"></label>
        <button type="button" data-remove="${escape(item.id)}">Remove</button></article>`;
    }).join("") : "<p>Your cart is empty.</p>"}${state.cart.length ? `<div class="demo-summary order-totals"><p><span>Subtotal</span><span>${money(api.total(config, state))}</span></p>
      <p><span>Shipping</span><span>Choose at checkout</span></p><p class="grand-total"><span>Total</span><span>${money(api.total(config, state))}</span></p></div>` : ""}
      <div class="cart-actions"><a class="book-button ghost" href="index.html#store">Continue shopping</a>${state.cart.length ? '<a class="book-button" href="checkout.html">Checkout</a>' : ""}</div></section>`;
    document.querySelectorAll("[data-quantity]").forEach(input => input.addEventListener("change", () => action(() => {
      if (!input.checkValidity()) throw new Error("Choose a whole-number quantity within available stock.");
      api.setQuantity(localStorage, config, input.dataset.quantity, Number(input.value)); renderCart(); updateCartLink();
    })));
    document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => action(() => {
      api.setQuantity(localStorage, config, button.dataset.remove, 0); renderCart(); updateCartLink();
    })));
  }
  function renderCheckout() {
    const state = api.read(localStorage, config);
    $("demo-content").innerHTML = `<section id="checkout"><h2>Your Order</h2>${checkoutContent(state)}
      <div class="cart-actions"><a class="book-button ghost" href="index.html#checkout">Back to shop &amp; order</a></div></section>`;
    setupCheckout();
  }
  function orderTotals(state) {
    if (!state.cart.length) return "<p>No items yet. Pick a quantity above.</p>";
    const pickup = $("checkout-shipping")?.value === "Pickup";
    return state.cart.map(item => {
      const product = config.products.find(product => product.id === item.id);
      return `<p class="order-line"><span>${escape(product.name)} &times; ${item.quantity}</span><span>${money(product.priceCents * item.quantity)}</span></p>`;
    }).join("") + `<p class="subtotal"><span>Subtotal</span><span>${money(api.total(config, state))}</span></p>
      <p><span>Shipping</span><span>${pickup ? "Free pickup" : "$0.00 (demo)"}</span></p>
      <p class="grand-total"><span>Total</span><span>${money(api.total(config, state))}</span></p>`;
  }
  function checkoutContent(state) {
    return `<div id="order-totals" class="demo-summary order-totals" aria-live="polite">${orderTotals(state)}</div>
      <form id="checkout-form" class="demo-form"><label>Name<input id="checkout-name" required maxlength="80" autocomplete="name"></label>
      <label>Ship or Pickup<select id="checkout-shipping"><option>Ship</option><option>Pickup</option></select></label>
      <fieldset id="checkout-address"><legend>Shipping address</legend>
      <label>Street address<input id="checkout-street" required maxlength="200" autocomplete="shipping address-line1"></label>
      <label>City<input id="checkout-city" required maxlength="100" autocomplete="shipping address-level2"></label>
      <label>State (2-letter)<input id="checkout-state" required maxlength="2" pattern="[A-Za-z]{2}" autocomplete="shipping address-level1"></label>
      <label>ZIP<input id="checkout-zip" required maxlength="5" pattern="[0-9]{5}" inputmode="numeric" autocomplete="shipping postal-code"></label></fieldset>
      <p id="checkout-error" class="checkout-error" role="alert"></p>
      <button id="place-order" type="submit" ${state.cart.length ? "" : "disabled"}>Place order (demo, no charge)</button></form>`;
  }
  function updateOrderTotals(state) {
    $("order-totals").innerHTML = orderTotals(state);
    $("place-order").disabled = !state.cart.length;
  }
  function setupCheckout() {
    const fields = { name: "checkout-name", street: "checkout-street", city: "checkout-city", state: "checkout-state", zip: "checkout-zip" };
    const values = () => {
      const saved = forms.leadValues(localStorage);
      return { name: saved.name, ...(api.parseAddress(saved.address) || api.parseAddress(forms.sample.address)) };
    };
    forms.fill(fields, values());
    forms.addDemoButton($("checkout-form"), fields, values);
    $("checkout-state").addEventListener("input", event => { event.target.value = event.target.value.toUpperCase(); });
    $("checkout-shipping").addEventListener("change", () => {
      const pickup = $("checkout-shipping").value === "Pickup";
      $("checkout-address").hidden = pickup;
      $("checkout-address").disabled = pickup;
      try { updateOrderTotals(api.read(localStorage, config)); }
      catch (failure) { $("checkout-error").textContent = failure.message; console.error(failure); }
    });
    $("checkout-form").addEventListener("submit", event => {
      event.preventDefault();
      formAction("checkout-error", () => {
        api.checkout(localStorage, config, { name: $("checkout-name").value, shippingMethod: $("checkout-shipping").value,
          shippingAddress: { street: $("checkout-street").value, city: $("checkout-city").value,
            state: $("checkout-state").value, zip: $("checkout-zip").value } });
        updateCartLink();
        jumpToDashboard();
      });
    });
  }
  function photoControl(id, field, label, alt, state) {
    const src = previewPhotos[field] || state[field];
    return `<div class="photo-control"><button type="button" class="photo-button" data-photo-input="${id}">${label}</button>
      <input type="file" id="${id}" class="sr-only" accept="image/*" aria-label="${label}">
      <img id="${id}-preview" class="photo-preview" alt="${alt}" ${src ? `src="${escape(src)}"` : "hidden"}>
      <p id="${id}-message" class="photo-message" role="status">${escape(photoMessages[field] || "")}</p></div>`;
  }
  function shrinkPhoto(src) {
    return new Promise((resolve, reject) => {
      const photo = new Image();
      photo.onerror = () => reject(new Error("This image format could not be opened. Try a JPG or PNG photo."));
      photo.onload = () => {
        try {
          const scale = Math.min(1, 800 / Math.max(photo.naturalWidth, photo.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(photo.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(photo.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("This browser could not prepare a photo preview.");
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(photo, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL("image/jpeg", .8);
          if (!compressed.startsWith("data:image/jpeg;base64,")) throw new Error("This photo could not be resized.");
          resolve(compressed);
        } catch (failure) { reject(failure); }
      };
      photo.src = src;
    });
  }
  function photoInput(id, field) {
    const input = $(id), preview = $(id + "-preview"), message = $(id + "-message");
    document.querySelector(`[data-photo-input="${id}"]`).addEventListener("click", () => input.click());
    let selection = 0;
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const current = ++selection;
      if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
        error(new Error("Choose a photo from your camera or photo library, not an SVG drawing.")); return;
      }
      $("demo-error").textContent = "";
      const src = URL.createObjectURL(file);
      preview.src = src;
      preview.hidden = false;
      message.textContent = "Photo selected. Shrinking it for this device...";
      try {
        const compressed = await shrinkPhoto(src);
        if (current !== selection) return;
        previewPhotos[field] = compressed;
        preview.src = compressed;
        try {
          api.savePhoto(localStorage, config, field, compressed);
          photoMessages[field] = "Photo saved on this device. Nothing uploaded.";
          message.textContent = photoMessages[field];
        } catch (failure) {
          photoMessages[field] = "Your photo is shown, but could not be saved. It will not survive a reload. Free browser storage and choose the photo again.";
          message.textContent = photoMessages[field];
          error(new Error("Photo preview could not be saved on this device: " + failure.message));
        }
      } catch (failure) {
        if (current === selection) {
          preview.removeAttribute("src");
          preview.hidden = true;
          message.textContent = "The photo could not be prepared. Try a JPG or PNG.";
          error(failure);
        }
      } finally {
        URL.revokeObjectURL(src);
        if (current === selection) input.value = "";
      }
    });
  }
  function ownerPreview(tab) {
    const live = bookingEnabled ? "Appointments" : "Orders", target = bookingEnabled ? "appointments" : "orders";
    const panel = (title, content) => `<article class="preview-panel"><h3>${escape(title)}</h3><div>${content}</div></article>`;
    const field = (label, value = "", type = "text") => `<label>${escape(label)}<input type="${type}" value="${escape(value)}" readonly></label>`;
    const select = (label, values) => `<label>${escape(label)}<select tabindex="0" aria-readonly="true">${values.map(value => `<option>${escape(value)}</option>`).join("")}</select></label>`;
    const button = label => `<button type="button">${escape(label)}</button>`;
    const table = (headers, rows) => `<div class="preview-table-scroll"><table><thead><tr>${headers.map(value => `<th>${escape(value)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(value => `<td>${escape(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const cards = values => `<div class="preview-cards">${values.map(([label, value]) => `<article><span>${escape(label)}</span><strong>${escape(value)}</strong><small>Sample preview data</small></article>`).join("")}</div>`;
    const periods = labels => `<div class="preview-actions">${labels.map(button).join("")}</div>`;
    const employees = bookingEnabled ? config.barbers.map(staff => staff.name) : ["Demo Shop Owner", "Demo Shop Assistant"];
    let content;
    switch (tab.id) {
      case "business-status":
        content = panel("Shop Status", `<p>OPEN</p>${button("Open / Close shop")}`) +
          panel("Normal Business Hours", config.shop.hours.map(hour => `<p>${escape(hour.days)}: ${escape(hour.hours)}</p>${button("Edit hours")}`).join("")) +
          panel("Schedule a Shop Closure", `<div class="preview-fields">${field("Closure Date", "", "date")}${field("Start Time", "09:00", "time")}${field("End Time", "17:00", "time")}${field("Internal Note", "Sample holiday closure")}</div>
          ${periods(["+ Schedule a Closure", "Close rest of today", "Review affected customers", "Confirm closure"])}`) +
          panel("Scheduled Shop Closures", "<p>No sample closures scheduled.</p>");
        break;
      case "schedule":
        content = panel("Employee Schedule", `<div class="preview-fields">${select("Employee", employees)}${field("Week of", api.dates()[0], "date")}</div>
          ${table(["Day", "Employee", "Start", "End"], ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => [day, employees[0], "9:00 AM", "5:00 PM"]))}
          ${periods(["Edit schedule", "Save schedule", "Request time off"])}`) +
          panel("Time-Off Requests", table(["Employee", "Day", "Reason", "Status"], [[employees.at(-1), "Next Friday", "Sample request", "Awaiting review"]]) + periods(["Approve", "Decline"]));
        break;
      case "services":
        content = panel("Services & Pricing", `<p>Update names, prices, descriptions and appointment duration.</p>
          ${table(["Name", "Price", "Description"], bookingEnabled ? config.services.map(service => [service.name, money(service.price * 100), service.description]) :
            config.products.map(product => [product.name, money(product.priceCents), product.description]))}${button("Manage Services")}`);
        break;
      case "products":
        content = panel("Product Catalog", table(["Product", "Price", "Weight", "Item dimensions"], config.products.map(product =>
          [product.name, money(product.priceCents), `${product.weight} lb`, `${product.box.join(" x ")} in`])) +
          periods(["Add product", "Edit product", "Hide product"])) +
          panel("Product Details", `<div class="preview-fields">${field("Product name", "Sample coastal keepsake")}${field("Price", "18.00", "number")}
          ${field("Description", "A locally inspired gift")}${field("SKU", "DEMO-GIFT-001")}</div>${button("Save product")}`);
        break;
      case "inventory":
      case "receiving":
      case "outgoing":
      case "low-stock": {
        const state = api.read(localStorage, config);
        const stockRows = config.products.map(product => [product.name, String(api.stock(config, state, product.id)),
          product.id === "canvas-tote" ? "Out of stock" : api.stock(config, state, product.id) <= 3 ? "Low stock" : "In stock"]);
        content = cards([["Receiving", "Incoming goods"], ["Outgoing", "Leaving on orders"], ["Low-stock alerts", "Restock reminders"]]) +
          panel("Inventory Overview", table(["Product", "Available", "Status"], stockRows) + button("Adjust stock")) +
          panel("Receiving - Incoming", `<div class="preview-fields">${select("Product", config.products.map(product => product.name))}
          ${field("Quantity received", "12", "number")}${field("Supplier", "Demo local supplier")}${field("Reference", "DEMO-DELIVERY-001")}</div>${button("Receive inventory")}`) +
          panel("Outgoing - Leaving on Orders", table(["Order", "Product", "Quantity", "Status"], [["DEMO-EXAMPLE", "Lobster Coffee Mug", "2", "Packed"]]) +
          button("Review outgoing")) +
          panel("Low-stock Alerts", table(["Product", "Available", "Action"], stockRows.filter(row => row[2] !== "In stock").map(row => [row[0], row[1], "Reorder"])) +
          periods(["Set alert threshold", "Create reorder"]));
        break;
      }
      case "shipping":
        content = cards([["Labels", "2 sample labels"], ["Carriers", "USPS / UPS / FedEx"], ["Tracking", "Demo only"]]) +
          panel("All Shipping Labels", table(["Order", "Box", "Carrier", "Tracking", "Status"], [
            ["DEMO-EXAMPLE", "Box 1 of 2", "USPS", "9400000000000000000001 (demo)", "Shipped"],
            ["DEMO-EXAMPLE", "Box 2 of 2", "USPS", "9400000000000000000002 (demo)", "Shipped"]
          ]) + periods(["View label", "Print labels", "Track shipment"])) +
          panel("Carriers", select("Default carrier", ["USPS", "UPS", "FedEx"]) + button("Save carrier"));
        break;
      case "employees":
        content = panel("Employees", table(["Name", "Role", "Status"], employees.map((name, index) => [name, index ? "Employee" : "Owner", "Active"])) +
          periods(["Add employee", "Edit employee"])) +
          periods(["Today", "Past Week", "Past Month", "Past Year"]) + panel("Employee Performance", select("Employee", employees)) +
          cards(bookingEnabled ? [["Completed Appointments", "6"], ["Completed Service Hours", "3.0"], ["Service Revenue", "$168.00"], ["Tips", "$24.00"], ["Total Collected", "$192.00"]] :
            [["Orders Packed", "6"], ["Hours Worked", "8.0"], ["Order Revenue", "$168.00"], ["Items Received", "24"], ["Orders Shipped", "5"]]) +
          panel("Completed Transactions - Today", table(["Employee", "Customer", bookingEnabled ? "Service" : "Order", "Revenue"],
            [[employees[0], "Demo Guest", bookingEnabled ? "Sample service" : "DEMO-EXAMPLE", "$28.00"]]) + button("View transaction"));
        break;
      case "customers":
        content = panel("Customer List", field("Search customers", "") +
          table(["Customer", bookingEnabled ? "Visits" : "Orders", "Last activity", "Total spent"], [
            ["Demo Guest", "3", "Sample day", "$84.00"],
            ["Sample Shopper", "2", "Previous sample day", "$56.00"]
          ]) + periods(["View customer", "Add customer"])) +
          panel(bookingEnabled ? "Visit History" : "Order History", table(
            ["Customer", "Date", bookingEnabled ? "Service" : "Order", "Status", "Total"], [
              ["Demo Guest", "Sample day", bookingEnabled ? "Classic Cut" : "DEMO-EXAMPLE-1", "Completed", "$28.00"],
              ["Demo Guest", "Previous sample day", bookingEnabled ? "Classic Cut" : "DEMO-EXAMPLE-2", "Completed", "$28.00"]
            ]) + button("Open history"));
        break;
      case "sales-reports":
        content = periods(["Day", "Week", "Month", "Year"]) +
          cards([[bookingEnabled ? "Completed Visits" : "Completed Orders", "12"], ["Gross Sales", "$480.00"],
            ["Discounts", "$24.00"], ["Net Sales", "$456.00"], ["Average Sale", "$38.00"]]) +
          panel("Sales Summary", table(["Period", bookingEnabled ? "Visits" : "Orders", "Gross", "Discounts", "Net"], [
            ["Sample day", "12", "$480.00", "$24.00", "$456.00"],
            ["Previous sample day", "8", "$320.00", "$16.00", "$304.00"]
          ]) + periods(["View report", "Export report"]));
        break;
      case "settings":
        content = panel("Business Hours", config.shop.hours.map(hour =>
          `<p>${escape(hour.days)}: ${escape(hour.hours)}</p>`).join("") + button("Edit business hours")) +
          panel("Contact Info", `<div class="preview-fields">${field("Phone", config.shop.phoneDisplay)}${field("Email", config.shop.email)}</div>`) +
          panel("Notifications", `<div class="preview-fields">${select("Owner email alerts", ["Enabled", "Disabled"])}
            ${select("Customer notifications", ["Enabled", "Disabled"])}</div>`) +
          (storeEnabled ? panel("Pickup & Tax", `<div class="preview-fields">${select("Local pickup", ["Enabled", "Disabled"])}
            ${field("Pickup instructions", "Collect your order during shop hours.")}${field("Sample tax rate (%)", "5.5", "number")}</div>
            <p>Sample settings only. No tax is applied to demo checkout.</p>`) : "") + periods(["Save settings"]);
        break;
      case "financials":
        content = periods(["Day", "Week", "Month", "Year"]) + cards([["Total Income", "$480.00"], ["Service / Order Revenue", "$450.00"], ["Tips", "$30.00"], ["Outgoing", "$120.00"], ["Net", "$360.00"]]) +
          panel("Add Outgoing", `<div class="preview-fields">${field("Expense", "Sample supplies")}${field("Amount", "45.00", "number")}${field("Due Date", api.dates()[0], "date")}${select("Repeat", ["Monthly", "Weekly", "Yearly"])}</div>${button("Add outgoing")}`) +
          panel("Outgoing Bills / Expenses", table(["Expense", "Amount", "Due", "Recurring", "Status"], [["Sample rent", "$120.00", "This month", "Monthly", "Unpaid"]]) + periods(["Mark paid", "Delete"])) +
          panel("Saved Expense Dropdown", "<p>Sample rent · Sample supplies</p>" + button("Remove saved expense"));
        break;
      case "photos":
        content = panel("Photos Waiting for Your Approval", "<p>No sample photos awaiting review.</p>" + periods(["Approve photo", "Decline photo"])) +
          panel(bookingEnabled ? "Barber Photo Manager" : "Shop Photo Manager", select("Profile", employees) +
            `<div class="preview-gallery">${config.photos.map(photo => image(photo.src, photo.alt)).join("")}</div>${periods(["Upload profile photo", "Add gallery photos", "Remove photo"])}`);
        break;
      case "announcements":
        content = panel("Announcement or Promotion Request", `<div class="preview-fields">${field("Title", "Welcome to our shop")}
          <label>Message<textarea readonly rows="4">Sample announcement: thank you for shopping local.</textarea></label>
          ${select("Type", ["Announcement", "Promotion"])}${select("Audience", ["Shop-wide", "Specific employee"])}${field("Expires", "", "datetime-local")}</div>${button("Submit for owner review")}`) +
          panel("Owner Workspace", "<p>Sample announcement · Pending review</p>" + periods(["Approve", "Edit", "Remove"]));
        break;
      case "business":
        content = panel("Customer-facing business details", `<div class="preview-fields">${field("Business name", config.shop.name)}${field("Phone", config.shop.phoneDisplay)}
          ${field("Address line 1", config.shop.addressLine1)}${field("Address line 2", config.shop.addressLine2)}${field("Customer contact email", config.shop.email)}</div>${button("Save business info")}`);
        break;
      case "cancellations":
        content = panel("Cancellation History", table(["Date", "Time", "Customer", "Service", "Employee", "Canceled By", "Acknowledged By"],
          [["Sample day", "10:00 AM", "Demo Guest", "Sample service", employees[0], "Customer", "Owner"]]) + button("View cancellation"));
        break;
      case "completed":
        content = employees.map(name => panel(name, "<p>Sample completed appointments</p>" + periods(["9:00 AM", "10:30 AM", "2:00 PM"]))).join("");
        break;
      case "uncompleted":
        content = panel("Uncompleted Appointments", "<p>Demo Guest · Sample service · Previous day, 3:00 PM</p>" + periods(["Complete", "No-show", "Owner override"])) +
          panel("Late Cancel - 20% Fee", "<p>No sample late cancellations.</p>") + panel("Override log", "<p>No sample overrides.</p>");
        break;
      default:
        content = panel(ownerTabLabel(tab), `<div class="preview-fields">${select("Employee", employees)}${field("Day", api.dates()[0], "date")}</div>${periods(["Previous Day", "Today", "Next Day", "Week View"])}
          ${table(["Time", ...employees], ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"].map((time, index) =>
            [time, ...employees.map((name, employee) => index === employee ? "Demo Guest - Sample appointment" : "Available")]))}${button("Open appointment")}`);
    }
    return `<section class="owner-preview-page"><div class="owner-preview-banner">Preview. Try the live tabs:
      <button type="button" data-preview-live="dashboard">Dashboard</button> and <button type="button" data-preview-live="${target}">${live}</button></div>
      <div class="preview-heading"><h2>${escape(ownerTabLabel(tab))}</h2><p>Demo data only. Explore the layout without changing your shop.</p></div>
      <div class="owner-preview-controls">${content}</div></section>`;
  }
  function showPreviewPopup() {
    clearTimeout(previewPopupTimer);
    const popup = $("owner-preview-popup");
    popup.hidden = false;
    popup.classList.remove("preview-popup-fading");
    previewPopupTimer = setTimeout(() => {
      popup.classList.add("preview-popup-fading");
      previewPopupTimer = setTimeout(() => { popup.hidden = true; }, 300);
    }, 5000);
  }
  function setupOwnerPreview() {
    const controls = document.querySelector(".owner-preview-controls");
    if (!controls) return;
    const block = event => {
      if (!event.target.closest("button, input, select, textarea, label, a")) return;
      event.preventDefault();
      event.stopPropagation();
      showPreviewPopup();
    };
    controls.addEventListener("click", block, true);
    controls.addEventListener("pointerdown", block, true);
    controls.addEventListener("keydown", event => {
      if (event.key !== "Tab" && !((event.ctrlKey || event.metaKey) && ["c", "a"].includes(event.key.toLowerCase()))) block(event);
    }, true);
    controls.querySelectorAll("input, textarea").forEach(input => { input.readOnly = true; });
    controls.addEventListener("submit", event => { event.preventDefault(); showPreviewPopup(); });
  }
  function renderDashboard() {
    clearTimeout(previewPopupTimer);
    ownerCalendarObserver?.disconnect();
    const state = api.read(localStorage, config);
    const own = (bookingEnabled ? state.bookings : state.orders).filter(item => !item.example).at(-1);
    if (!own) {
      dashboardOpen = false;
      document.body.classList.remove("demo-owner-open");
      app.classList.toggle("has-customer-ads", pageName === "home");
      document.querySelector(".shop-header").hidden = false; document.querySelectorAll("#sample-ads, .ad-mobile-row").forEach(el => { el.hidden = false; });
      $("demo-content").innerHTML = `<section><h2>Customer first</h2><p>Complete a demo ${bookingEnabled ? "booking" : "checkout"} before building your daily dashboard.</p><a class="book-button" href="index.html">Back to the customer site</a></section>`;
      return;
    }
    const seeded = state;
    app.classList.remove("has-customer-ads");
    app.classList.remove("barber-customer-demo");
    const activeTab = ownerTabs.flatMap(tab => [tab, ...(tab.children || [])]).find(tab => tab.id === dashboardView);
    const title = activeTab ? ownerTabLabel(activeTab) : "Dashboard";
    const preview = activeTab && !activeTab.live;
    document.body.classList.add("demo-owner-open");
    adLayoutObserver?.disconnect();
    document.querySelector(".shop-header").hidden = true; document.querySelectorAll("#sample-ads, .ad-mobile-row").forEach(el => { el.hidden = true; });
    document.title = `${visitor?.business || config.shop.name} | ${title} Demo`;
    const records = [own];
    const finished = own.status === "Finished";
    const price = bookingEnabled ? own.status === "Canceled" ? 0 : (config.services.find(service => service.id === own.serviceId)?.price || 0) * 100 : own.totalCents;
    const complete = bookingEnabled ? finished || own.status === "Canceled" : ["Shipped", "Ready for pickup"].includes(own.status);
    $("demo-content").innerHTML = `<section id="daily-dashboard"><div class="app"><aside class="sidebar"><div class="brand">
      <div class="business-name"><strong>${escape(visitor?.business || config.shop.name)}</strong></div>
      <h1>BUSINESS PRO</h1><p>${bookingEnabled ? "Professional" : "Business Pro"} Owner Portal</p></div>
      <nav class="nav" aria-label="Owner portal menu">${ownerNavigation()}</nav>
      <div class="support-box"><h3>Need Help?</h3><p>Having a problem with your website or owner portal? Contact Business Pro directly.</p>
      <div class="support-buttons"><button type="button" aria-disabled="true">&#9993; Email Me</button><button type="button" aria-disabled="true">&#128172; Text Me</button></div></div></aside>
      <main class="main"><header class="topbar"><div><h2>${title}</h2><div class="note" style="font-size:12px;color:#777">Business: ${escape(visitor?.business || config.shop.name)} - demo mode</div></div>
      <div class="access-controls"><span class="signed-in-badge">Signed in: Owner</span><div class="date">${escape(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }))}</div>
      <button type="button" class="lock-btn" id="demo-lock">Lock</button></div></header>
      <div class="content">${preview ? ownerPreview(activeTab) : dashboardView === "appointments" && bookingEnabled ? ownerCalendarPanel(seeded) :
        dashboardView === "orders" ? `<section class="page active" id="dashboard">${ordersPanel(records, seeded)}</section>` : `<section class="page active" id="dashboard">
      <div class="section-heading"><h2>Good Morning</h2><p>Here is what is happening at your shop today.</p></div>
      <div class="cards"><div class="card"><span>${bookingEnabled ? "Today's Appointments" : "Today's Orders"}</span><strong>1</strong><small>${complete ? 0 : 1} remaining today</small></div>
      <div class="card"><span>${bookingEnabled ? "Barbers Working" : "To Pack & Ship"}</span><strong>${bookingEnabled ? config.barbers.length : complete ? 0 : 1}</strong><small>${bookingEnabled ? config.barbers.length + " scheduled today" : "Orders awaiting fulfillment"}</small></div>
      <div class="card"><span>Today's Sales</span><strong>${money(complete ? price : 0)} earned</strong><small>of ${money(price)} booked ${bookingEnabled ? "- services only" : "- orders only"}</small></div></div>
      ${bookingEnabled ? schedulePanel(records, seeded) : ordersPanel(records, seeded)}</section>`}
      ${!preview && (own.status === "Finished" || own.status === "Shipped" || own.status === "Ready for pickup") ? endOfDemo() : ""}
      </div></main></div>${bookingEnabled && !preview ? appointmentDialog() : ""}
      <div id="owner-preview-popup" class="owner-preview-popup" role="status" aria-live="polite" hidden><p>This works in your real portal.</p>
      <div><button type="button" data-preview-live="${bookingEnabled ? "appointments" : "orders"}">Try ${bookingEnabled ? "Appointments" : "Orders"} &#8594;</button>
      <a href="${plansLink}">See plans</a></div></div></section>`;
    $("demo-lock").addEventListener("click", () => { location.href = "index.html"; });
    document.querySelectorAll("[data-owner-tab]").forEach(button => button.addEventListener("click", () => action(() => {
      const tab = ownerTabs.find(tab => tab.id === button.dataset.ownerTab);
      if (tab?.children) {
        if (expandedOwnerTabs.has(tab.id)) expandedOwnerTabs.delete(tab.id);
        else expandedOwnerTabs.add(tab.id);
      }
      openOwnerTab(button.dataset.ownerTab);
    })));
    document.querySelectorAll("[data-preview-live]").forEach(button => button.addEventListener("click", () => action(() => openOwnerTab(button.dataset.previewLive))));
    if (preview) { setupOwnerPreview(); return; }
    if (bookingEnabled) {
      if (dashboardView === "appointments") { setupOwnerCalendar(); return; }
      setupAppointmentDetails();
      photoInput("work-photo", "workPhoto");
    } else {
      document.querySelectorAll("[data-packed]").forEach(button => button.addEventListener("click", () => action(() => {
        const order = api.read(localStorage, config).orders.find(item => item.id === button.dataset.packed);
        const checklist = Array.from(document.querySelectorAll("[data-order-pack]")).filter(input => input.dataset.order === order.id);
        if (checklist.some(input => !input.checked)) throw new Error("Check each item in every box on the packing checklist before tapping Packed.");
        const checked = [...new Set(checklist.map(input => input.dataset.orderPack))];
        const first = (order.boxes || api.shipBoxes(config, order))[0];
        api.savePacking(localStorage, config, order.id, { packedIds: checked, shippingAddress: order.shippingAddress,
          packedBoxIds: checklist.map(input => input.dataset.boxPack),
          shipment: { lbs: first.lbs, oz: first.oz, length: first.length, width: first.width, height: first.height }, prepareLabel: true });
        renderDashboard();
      })));
      document.querySelectorAll("[data-carrier]").forEach(select => select.addEventListener("change", () => {
        try { api.setCarrier(localStorage, config, select.dataset.carrier, select.value); renderDashboard(); }
        catch (failure) {
          select.value = api.read(localStorage, config).orders.find(order => order.id === select.dataset.carrier).carrier || "USPS";
          error(failure);
        }
      }));
      document.querySelectorAll("[data-shipped]").forEach(button => button.addEventListener("click", () => action(() => {
        api.printLabel(localStorage, config, button.dataset.shipped);
        api.markShipped(localStorage, config, button.dataset.shipped);
        renderDashboard();
      })));
    }
    function endOfDemo() {
      return `<div class="end-of-demo"><p>That's a day running your shop with Business Pro.</p>
        <a class="book-button" href="${plansLink}">See plans</a></div>`;
    }
  }
  function schedulePanel(records, state) {
    return `<div class="panel"><div class="panel-header"><h3>Today's Appointments</h3></div><div class="panel-body">
      ${records[0].date !== api.dates()[0] ? "<p>Your selected booking is included in this preview even if it is on another day.</p>" : ""}
      <div class="completed-owner-grid">${config.barbers.map(staff => `<section class="completed-barber-block" style="border-top-color:${employeeColor(staff.id)}">
      <div class="completed-barber-header"><button type="button" class="completed-barber-name compact-barber-name-btn">${escape(staff.name)}</button></div>
      <div class="completed-time-list">${records.filter(item => item.staffId === staff.id).map(item =>
        `<button type="button" class="completed-time-btn ${item.status !== "Finished" ? "next-barber-appointment" : ""}" data-calendar-booking="${escape(item.id)}" title="${escape(item.name)} - ${escape(item.status || "Scheduled")}">${api.timeLabel(item.time)}</button>`).join("")}</div></section>`).join("")}</div>
      ${photoControl("work-photo", "workPhoto", "Add a photo of your work", "Your work photo preview", state)}</div></div>`;
  }
  function ownerCalendarPanel(state) {
    if (!ownerCalendarDate) {
      const own = state.bookings.filter(item => !item.example).at(-1);
      ownerCalendarDate = new Date(own.date + "T12:00:00");
    }
    const monday = new Date(ownerCalendarDate);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const selectedStaff = config.barbers;
    const columns = ownerCalendarView === "day" ? selectedStaff.map(staff => ({ date: dateKey(ownerCalendarDate), staff,
      label: staff.name })) : Array.from({ length: 6 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(day.getDate() + index);
      return { date: dateKey(day), label: day.toLocaleDateString("en-US", { weekday: "long" }),
        shortDate: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    });
    const latest = state.bookings.filter(item => !item.example).at(-1);
    let grid = '<div class="owner-grid-heading">Time</div>' + columns.map(column =>
      `<div class="owner-grid-heading"><div>${escape(column.label)}</div>${column.shortDate ? `<small>${escape(column.shortDate)}</small>` : ""}</div>`).join("");
    for (let minute = 9 * 60; minute < 17 * 60; minute += 30) {
      const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${minute % 60 ? "30" : "00"}`;
      grid += `<div class="owner-grid-time">${api.timeLabel(time)}</div>` + columns.map(column => {
        const bookings = [latest].filter(item => item.date === column.date && item.time === time &&
          (employeeFilter === "all" || item.staffId === employeeFilter) && (!column.staff || item.staffId === column.staff.id));
        return `<div class="owner-grid-slot">${bookings.map(item => `<div role="button" tabindex="0" class="month-appointment confirmed ${item.status === "Finished" ? "completed" : ""}"
          style="background:${item.status === "Canceled" ? "#6b7280" : employeeColor(item.staffId)}"
          aria-label="${escape(item.name)} - ${escape(config.services.find(service => service.id === item.serviceId)?.name || item.serviceId)} - ${escape(item.status || "Scheduled")}. Open appointment details."
          data-calendar-booking="${escape(item.id)}">
          <div class="calendar-card-summary"><strong>${escape(item.name)}</strong><span>${escape(config.services.find(service => service.id === item.serviceId)?.name || item.serviceId)}</span></div>
          ${ownerCalendarView === "week" ? `<small class="calendar-card-barber">${escape(config.barbers.find(staff => staff.id === item.staffId)?.name || item.staffId)}</small>` : ""}
          ${!["Finished", "Canceled"].includes(item.status) ? `<div class="calendar-card-actions">
          <button type="button" data-calendar-status="${item.status === "Started" ? "Finished" : "Started"}" data-id="${escape(item.id)}">${item.status === "Started" ? "Finish" : "Start"}</button></div>` : ""}</div>`).join("")}</div>`;
      }).join("");
    }
    const end = new Date(monday);
    end.setDate(end.getDate() + 5);
    const label = ownerCalendarView === "day" ? ownerCalendarDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }) :
      `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    const minimum = ownerCalendarView === "day" ? 190 : 150;
    return `<section id="appointments" class="page active appointments-workspace"><div id="owner-calendar"><div class="appointments-topbar">
      <button type="button" id="close-appointments" class="close-appointments" aria-label="Back to Dashboard">&times;</button>
      <div class="appointments-title"><h2>Appointments</h2><p>Owner View &mdash; All Employees. Open any appointment to manage or cancel it.</p></div></div>
      <div class="month-toolbar"><div class="month-navigation">
      <button type="button" id="owner-previous" class="calendar-btn">&larr; ${ownerCalendarView === "day" ? "Previous Day" : "Previous Week"}</button>
      <button type="button" id="owner-today" class="calendar-btn">Today</button>
      <button type="button" id="owner-next" class="calendar-btn">${ownerCalendarView === "day" ? "Next Day" : "Next Week"} &rarr;</button>
      <button type="button" id="owner-view-toggle" class="calendar-btn" aria-pressed="${ownerCalendarView === "day"}">${ownerCalendarView === "day" ? "Week View" : "Day View"}</button>
      </div><h1 class="calendar-month-title">${escape(label)}</h1><label class="calendar-filter">Employee:
      <select id="owner-employee"><option value="all">All Employees</option>${config.barbers.map(staff =>
        `<option value="${escape(staff.id)}" ${employeeFilter === staff.id ? "selected" : ""}>${escape(staff.name)}</option>`).join("")}</select></label></div>
      <div class="calendar-legend">${config.barbers.map(staff => `<span class="legend-item"><span class="legend-box" style="background:${employeeColor(staff.id)}"></span>${escape(staff.name)}</span>`).join("")}</div>
      <div class="month-calendar"><div class="calendar-top-scroll" id="demo-calendar-top"><div class="calendar-top-scroll-inner"></div></div>
      <div class="month-grid-scroll" tabindex="0" role="region" aria-label="Appointment calendar, scroll to browse">
      <div class="month-grid" style="grid-template-columns:90px repeat(${columns.length},minmax(${minimum}px,1fr));grid-template-rows:48px repeat(16,90px);min-width:${90 + columns.length * minimum}px;width:100%">${grid}</div></div></div></div></section>`;
  }
  function setupOwnerCalendar() {
    $("close-appointments").addEventListener("click", () => action(() => { dashboardView = "dashboard"; renderDashboard(); }));
    [["owner-previous", -1], ["owner-next", 1]].forEach(([id, delta]) => $(id).addEventListener("click", () => action(() => {
      ownerCalendarDate.setDate(ownerCalendarDate.getDate() + delta * (ownerCalendarView === "day" ? 1 : 7));
      renderDashboard();
    })));
    $("owner-today").addEventListener("click", () => action(() => { ownerCalendarDate = new Date(); renderDashboard(); }));
    $("owner-view-toggle").addEventListener("click", () => action(() => {
      ownerCalendarView = ownerCalendarView === "week" ? "day" : "week"; renderDashboard();
    }));
    $("owner-employee").addEventListener("change", event => action(() => { employeeFilter = event.target.value; renderDashboard(); }));
    const scroller = document.querySelector("#owner-calendar .month-grid-scroll");
    const top = $("demo-calendar-top");
    const sync = () => { top.firstElementChild.style.width = scroller.scrollWidth + "px"; };
    top.addEventListener("scroll", () => { scroller.scrollLeft = top.scrollLeft; });
    scroller.addEventListener("scroll", () => { top.scrollLeft = scroller.scrollLeft; });
    const observer = new ResizeObserver(() => {
      if (!scroller.isConnected) { observer.disconnect(); return; }
      sync();
    });
    ownerCalendarObserver = observer;
    observer.observe(scroller);
    sync();
    setupAppointmentDetails();
    document.querySelectorAll("[data-calendar-status]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      action(() => {
        api.bookingStatus(localStorage, config, button.dataset.id, button.dataset.calendarStatus);
        renderDashboard();
      });
    }));
  }
  function appointmentDialog() {
    return `<div class="appointment-modal" id="appointment-popup" role="dialog" aria-modal="true" aria-labelledby="appointment-popup-title" hidden>
      <div class="appointment-modal-box"><div class="appointment-modal-header"><h2 id="appointment-popup-title">Appointment Details</h2>
      <button type="button" class="modal-close" id="close-appointment" aria-label="Close appointment">&times;</button></div>
      <div id="appointment-popup-content"></div></div></div>`;
  }
  function setupAppointmentDetails() {
    document.querySelectorAll("[data-calendar-booking]").forEach(button => button.addEventListener("click", () => action(() => {
      const booking = api.read(localStorage, config).bookings.find(item => item.id === button.dataset.calendarBooking);
      if (!booking) throw new Error("This demo appointment was not found.");
      const price = config.services.find(service => service.id === booking.serviceId)?.price || 0;
      const details = [["Date", booking.date], ["Time", api.timeLabel(booking.time)], ["Customer", booking.name],
        ["Customer Phone", booking.phone || ""], ["Customer Email", booking.email || ""],
        ["Employee", config.barbers.find(staff => staff.id === booking.staffId)?.name || booking.staffId],
        ["Service", config.services.find(service => service.id === booking.serviceId)?.name || booking.serviceId], ["Status", booking.status || "Scheduled"]];
      $("appointment-popup-content").innerHTML = `<div class="appointment-detail-grid">${details.map(([label, value]) =>
        `<div class="appointment-detail"><label>${label}</label><strong>${escape(value)}</strong></div>`).join("")}</div>
        <div class="appointment-form-group"><label>Service Price</label><input type="text" value="${money(price * 100)}" readonly></div>
        <div class="appointment-form-group"><label>Tip Amount</label><input type="text" value="$0.00" readonly></div>
        <div class="modal-actions"><button type="button" class="modal-action-btn" data-booking-status="Started" ${booking.status && booking.status !== "Scheduled" ? "disabled" : ""}>Start</button>
        <button type="button" class="modal-action-btn" id="completeAppointment" data-booking-status="Finished" ${booking.status !== "Started" ? "disabled" : ""}>Finish</button>
        <button type="button" class="modal-action-btn cancel-btn" data-booking-status="Canceled" ${["Finished", "Canceled"].includes(booking.status) ? "disabled" : ""}>Cancel Appointment</button></div>`;
      const popup = $("appointment-popup");
      popup.hidden = false; popup.classList.add("open");
      $("close-appointment").focus();
      document.querySelectorAll("[data-booking-status]").forEach(control => control.addEventListener("click", () => action(() => {
        api.bookingStatus(localStorage, config, booking.id, control.dataset.bookingStatus); renderDashboard();
      })));
      document.querySelectorAll('[data-calendar-booking][role="button"]').forEach(card => card.addEventListener("keydown", event => {
        if (event.target === card && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault(); card.click();
        }
      }));
    })));
    $("close-appointment").addEventListener("click", () => {
      $("appointment-popup").hidden = true; $("appointment-popup").classList.remove("open");
    });
    $("appointment-popup").addEventListener("keydown", event => {
      if (event.key === "Escape") $("close-appointment").click();
      if (event.key === "Tab") {
        const controls = Array.from($("appointment-popup").querySelectorAll("button:not(:disabled),input")).filter(el => !el.hidden);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }
  function shipBox(order) {
    return api.shipBox(config, order);
  }
  function ordersPanel(records, state) {
    return records.map(order => `<article class="panel owner-order"><div class="panel-header"><h3>${escape(order.name)} &middot; ${money(order.totalCents)}</h3>
      <span class="status">${escape(order.status || "New")}</span></div><div class="panel-body">
      ${!order.example ? "<p>Your demo order</p>" : ""}
      <p>${api.isPickup(order) ? "Free pickup" : "Ship"}</p>
      <p class="address">${escape(api.shippingTo(order))}</p>
      <h3>Ships in ${shipBox(order).boxes} box${shipBox(order).boxes === 1 ? "" : "es"}</h3>
      <h3>Packing checklist</h3>
      ${(order.boxes || api.shipBoxes(config, order)).map((box, index, boxes) => `<section class="ship-box">
        <h3>Box ${index + 1} of ${boxes.length}</h3>
        <p><strong>Weight:</strong> ${box.lbs} lb ${box.oz} oz</p>
        <p><strong>Size:</strong> ${box.length} x ${box.width} x ${box.height} in</p>
        ${box.items.map(item => {
        const product = config.products.find(product => product.id === item.id);
        if (!product) throw new Error("An earlier demo order contains a retired product. Place a new order to preview packing.");
        return `<label class="packing-item"><input type="checkbox" data-order="${escape(order.id)}" data-order-pack="${escape(item.id)}"
          data-box-pack="${index}:${escape(item.id)}"
          ${(order.packedBoxIds || (boxes.length === 1 ? (order.packedIds || []).map(id => `0:${id}`) : [])).includes(`${index}:${item.id}`) ? "checked" : ""}
          ${["Packed", "Shipped", "Ready for pickup"].includes(order.status) ? "disabled" : ""}>
          <span>${escape(item.name)} &times; ${item.quantity}<br>Each: ${product.weight} lb &middot; item size ${product.box.join(" x ")} in
          ${product.fragile ? "<br>Fragile - wrap and protect before packing." : ""}<br>Exact stock: ${api.stock(config, state, product.id)}</span></label>`;
        }).join("")}</section>`).join("")}
      <button type="button" class="action-btn" data-packed="${escape(order.id)}" ${["Packed", "Shipped", "Ready for pickup"].includes(order.status) ? "disabled" : ""}>Packed</button>
      ${shippingLabel(order)}
      </div></article>`).join("");
  }
  function shippingLabel(order) {
    if (api.isPickup(order) || !order.label) return "";
    const labels = order.labels?.length ? order.labels : [order.label];
    return labels.map((label, index) => `<div class="shipping-label"><div class="shipping-label-content"><h3>${order.status === "Shipped" ? "SHIPPED" : "Shipping label"} &middot; DEMO</h3>
      <p><strong>Box ${index + 1} of ${labels.length}</strong></p>
      <div class="label-address"><strong>FROM:</strong><p class="address">${escape(label.from)}</p></div>
      <div class="label-address"><strong>TO:</strong><p class="address">${escape(label.to)}</p></div>
      <p><strong>Package:</strong> ${label.lbs} lb ${label.oz} oz &middot; ${label.length} x ${label.width} x ${label.height} in</p>
      ${order.status === "Shipped" ? `<p>Carrier: ${escape(order.carrier || label.carrier || "USPS")}</p>
        <p class="tracking">Tracking: ${escape(label.tracking || order.tracking)} (demo)</p>` :
        `<label>Carrier<select data-carrier="${escape(order.id)}">${["USPS", "UPS", "FedEx"].map(carrier =>
          `<option ${carrier === (order.carrier || label.carrier || "USPS") ? "selected" : ""}>${carrier}</option>`).join("")}</select></label>
        `}
      <p>Demo label only. No postage purchased or carrier contacted.</p></div></div>`).join("") +
      (order.status === "Shipped" ? "" : `<button type="button" class="action-btn" data-shipped="${escape(order.id)}">Shipped</button>`);
  }
  try {
    visitor = api.lead(localStorage);
    api.personalize(config, visitor);
    renderShell();
    window.addEventListener("resize", layoutAds);
    api.read(localStorage, config);
    if (storeEnabled && pageName === "home") api.resetStoreVisit(localStorage, config);
    if (pageName !== "home" && !storeEnabled) throw new Error("This tier has no storefront.");
    if (pageName === "orders") { dashboardOpen = true; renderDashboard(); }
    else if (pageName === "cart") renderCart();
    else if (pageName === "checkout") renderCheckout();
    else renderHome();
    updateCartLink();
    window.addEventListener("pageshow", event => {
      if (!storeEnabled || pageName !== "home") return;
      // History navigation can restore form values after pageshow.
      requestAnimationFrame(() => action(() => {
        if (event.persisted) {
          api.resetStoreVisit(localStorage, config);
          dashboardOpen = false;
          renderShell(); renderHome();
        } else {
          const state = api.read(localStorage, config);
          document.querySelectorAll("[data-qty]").forEach(select => {
            select.value = String(state.cart.find(item => item.id === select.dataset.qty)?.quantity || 0);
          });
          updateOrderTotals(state);
        }
        updateCartLink();
      }));
    });
    window.addEventListener("storage", event => {
      if (event.key === api.key(config) || event.key === null) action(() => {
        if (dashboardOpen) renderDashboard();
        else if (pageName === "cart") renderCart();
        else if (pageName === "checkout") renderCheckout();
        else if (bookingEnabled) { renderCalendar(); refreshTimes(); }
        else if (storeEnabled) renderHome();
        updateCartLink();
      });
    });
  } catch (failure) {
    if ($("demo-error")) error(failure);
    else { app.textContent = "Demo failed to load: " + failure.message; console.error(failure); }
  }
})();
