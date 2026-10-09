(function (root) {
  "use strict";
  const tiers = ["basic", "professional", "business-pro"];
  const carriers = ["USPS", "UPS", "FedEx"];
  const states = Object.fromEntries(("AL:Alabama|AK:Alaska|AZ:Arizona|AR:Arkansas|CA:California|CO:Colorado|CT:Connecticut|DE:Delaware|DC:District of Columbia|FL:Florida|GA:Georgia|HI:Hawaii|ID:Idaho|IL:Illinois|IN:Indiana|IA:Iowa|KS:Kansas|KY:Kentucky|LA:Louisiana|ME:Maine|MD:Maryland|MA:Massachusetts|MI:Michigan|MN:Minnesota|MS:Mississippi|MO:Missouri|MT:Montana|NE:Nebraska|NV:Nevada|NH:New Hampshire|NJ:New Jersey|NM:New Mexico|NY:New York|NC:North Carolina|ND:North Dakota|OH:Ohio|OK:Oklahoma|OR:Oregon|PA:Pennsylvania|RI:Rhode Island|SC:South Carolina|SD:South Dakota|TN:Tennessee|TX:Texas|UT:Utah|VT:Vermont|VA:Virginia|WA:Washington|WV:West Virginia|WI:Wisconsin|WY:Wyoming|PR:Puerto Rico").split("|").map(state => state.split(":")));
  function stateCode(value) {
    const text = typeof value === "string" ? value.trim() : "";
    return Object.keys(states).find(code => code === text.toUpperCase() || states[code].toLowerCase() === text.toLowerCase()) || null;
  }
  function parseAddress(value) {
    if (typeof value !== "string") return null;
    const parts = value.trim().split(/\s*[,;\n]\s*/);
    if (parts.length !== 3 || !parts[0] || !parts[1]) return null;
    const region = parts[2].match(/^(.+?)\s+(\d{5})$/);
    const state = region && stateCode(region[1]);
    return state ? { street: parts[0], city: parts[1], state, zip: region[2] } : null;
  }
  function addressText(address) {
    if (address && typeof address === "object") return `${address.street}\n${address.city}, ${address.state} ${address.zip}`;
    const parsed = parseAddress(address);
    return parsed ? addressText(parsed) : typeof address === "string" ? address.trim() : "";
  }
  function shippingTo(order) {
    return [order.name, addressText(order.shippingAddress)].filter(Boolean).join("\n");
  }
  function shippingFrom(shop) {
    const address = [shop.addressLine1, shop.addressLine2].filter(Boolean).join(", ");
    const parsed = parseAddress(address);
    const lines = parsed ? addressText(parsed) : address.replace(/,\s*/, "\n");
    return `${shop.name}\n${lines}`;
  }
  function isPickup(order) { return ["Pickup", "Free local pickup"].includes(order.shippingMethod); }
  function key(config) {
    if (!tiers.includes(config.demo.tier) || !/^demo-[a-z-]+$/.test(config.demo.id)) {
      throw new Error("Invalid demo configuration.");
    }
    return "businessProDemo_v1_" + config.demo.id;
  }
  function empty() { return { bookings: [], cart: [], orders: [] }; }
  function read(storage, config) {
    const raw = storage.getItem(key(config));
    if (raw === null) return empty();
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.bookings) || !Array.isArray(state.cart) || !Array.isArray(state.orders) ||
        (state.inventoryOrderOffset !== undefined && (!Number.isInteger(state.inventoryOrderOffset) ||
          state.inventoryOrderOffset < 0 || state.inventoryOrderOffset > state.orders.length)) ||
        state.cart.some(item => !config.products?.some(product => product.id === item.id) ||
          !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) ||
        new Set(state.cart.map(item => item.id)).size !== state.cart.length ||
        state.bookings.some(item => !item || typeof item.id !== "string" || typeof item.staffId !== "string" ||
          typeof item.date !== "string" || typeof item.time !== "string") ||
        state.orders.some(item => !item || typeof item.id !== "string" || typeof item.name !== "string" ||
          !Number.isFinite(Date.parse(item.createdAt)) || !Number.isInteger(item.totalCents) ||
          !Array.isArray(item.items) || !item.items.length ||
          item.items.some(line => !line || typeof line.id !== "string" || typeof line.name !== "string" ||
            !Number.isInteger(line.quantity) || line.quantity < 1 || !Number.isInteger(line.priceCents)) ||
          (item.shippingAddress && typeof item.shippingAddress !== "string" &&
            (typeof item.shippingAddress !== "object" || ["street", "city", "state", "zip"].some(field => typeof item.shippingAddress[field] !== "string"))) ||
          (item.status !== undefined && !["New", "Packed", "Shipped", "Ready for pickup"].includes(item.status)))) {
      throw new Error("Saved demo data is invalid. Clear this demo's browser storage to restart.");
    }
    return state;
  }
  function write(storage, config, state) {
    storage.setItem(key(config), JSON.stringify(state));
  }
  function lead(storage) {
    const leads = JSON.parse(storage.getItem("businessProLeads") || "[]");
    if (!Array.isArray(leads)) throw new Error("Saved Get Started information is invalid.");
    if (!leads.length) return null;
    const latest = leads.at(-1);
    if (!latest || ["name", "business", "phone", "email"].some(field => typeof latest[field] !== "string") ||
        (latest.address !== undefined && typeof latest.address !== "string")) {
      throw new Error("Saved Get Started information is incomplete.");
    }
    return latest;
  }
  function personalize(config, visitor) {
    if (!visitor) return;
    const shop = config.shop;
    if (visitor.business.trim()) {
      shop.name = visitor.business.trim();
      shop.pageTitle = `${shop.name} | ${config.demo.label} DEMO`;
      shop.heroTitle = shop.name;
    }
    if (visitor.phone.trim()) shop.phoneDisplay = visitor.phone.trim();
    if (visitor.email.trim()) shop.email = visitor.email.trim();
    if (visitor.address?.trim()) {
      shop.addressLine1 = visitor.address.trim();
      shop.addressLine2 = "";
    }
  }
  function timeLabel(value) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Invalid appointment time.");
    const hour = Number(value.slice(0, 2));
    return `${hour % 12 || 12}:${value.slice(3)} ${hour >= 12 ? "PM" : "AM"}`;
  }
  function stock(config, state, id) {
    const product = config.products.find(item => item.id === id);
    if (!product) throw new Error("Product not found.");
    return Math.max(0, product.stock - state.orders.slice(state.inventoryOrderOffset || 0).reduce((sum, order) =>
      sum + order.items.filter(item => item.id === id).reduce((count, item) => count + item.quantity, 0), 0));
  }
  function resetStoreVisit(storage, config) {
    if (config.demo.tier !== "business-pro") throw new Error("Inventory visits are only included in the store demo.");
    const state = read(storage, config);
    state.cart = [];
    state.inventoryOrderOffset = state.orders.length;
    write(storage, config, state);
    return state;
  }
  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function dates(now = new Date()) {
    return Array.from({ length: 31 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
      return dateKey(date);
    });
  }
  function slots(config, state, staffId, serviceId, day, now = new Date()) {
    if (config.demo.tier !== "professional" || !dates(now).includes(day)) return [];
    const staff = config.barbers.find(item => item.id === staffId && item.serviceIds.includes(serviceId));
    if (!staff) return [];
    const date = new Date(day + "T00:00:00");
    const schedule = staff.schedule;
    if (!schedule.workingDays.includes(date.getDay())) return [];
    const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
    const duration = config.booking.appointmentLengthMinutes;
    const result = [];
    for (let minute = minutes(schedule.startTime); minute + duration <= minutes(schedule.endTime); minute += duration) {
      const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      if (new Date(day + "T" + time) <= now) continue;
      if (!state.bookings.some(item => item.status !== "Canceled" && item.staffId === staffId && item.date === day && item.time === time)) result.push(time);
    }
    return result;
  }
  function book(storage, config, input, now = new Date()) {
    if (config.demo.tier !== "professional") throw new Error("Booking is only included in Professional, not Basic or the store-only demo.");
    const state = read(storage, config);
    const name = input.name.trim();
    if (!name || name.length > 80) throw new Error("Enter a demo name (up to 80 characters).");
    if (!slots(config, state, input.staffId, input.serviceId, input.date, now).includes(input.time)) {
      throw new Error("That time is unavailable. Select another available time.");
    }
    const booking = { ...input, name, id: "DEMO-" + root.crypto.randomUUID(), createdAt: now.toISOString(), demo: true };
    state.bookings.push(booking);
    write(storage, config, state);
    return booking;
  }
  function setQuantity(storage, config, id, quantity) {
    if (config.demo.tier !== "business-pro") throw new Error("Storefront is only included in Business Pro.");
    if (!config.products.some(product => product.id === id)) throw new Error("Product not found.");
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error("Quantity must be between 0 and 99.");
    const state = read(storage, config);
    if (quantity > stock(config, state, id)) throw new Error("Not enough stock for that quantity.");
    state.cart = state.cart.filter(item => item.id !== id);
    if (quantity) state.cart.push({ id, quantity });
    write(storage, config, state);
    return state;
  }
  function total(config, state) {
    return state.cart.reduce((sum, item) => sum + config.products.find(product => product.id === item.id).priceCents * item.quantity, 0);
  }
  function clearCart(storage, config) {
    const state = read(storage, config);
    if (state.cart.length) {
      state.cart = [];
      write(storage, config, state);
    }
    return state;
  }
  function customerDetails(input) {
    const text = (object, field, maximum) => {
      const value = typeof object?.[field] === "string" ? object[field].trim() : "";
      if (!value || value.length > maximum) throw new Error(`Enter ${field} (up to ${maximum} characters).`);
      return value;
    };
    if (!["Ship", "Pickup"].includes(input.shippingMethod)) throw new Error("Choose Ship or Pickup.");
    const customer = { name: text(input, "name", 80), shippingAddress: null };
    if (input.shippingMethod === "Pickup") return customer;
    const address = input.shippingAddress;
    const state = text(address, "state", 2).toUpperCase();
    const zip = text(address, "zip", 5);
    if (!states[state]) throw new Error("Enter a valid two-letter state.");
    if (!/^\d{5}$/.test(zip)) throw new Error("Enter a five-digit ZIP.");
    customer.shippingAddress = { street: text(address, "street", 200), city: text(address, "city", 100), state, zip };
    return customer;
  }
  function checkout(storage, config, input, now = new Date()) {
    if (config.demo.tier !== "business-pro") throw new Error("Checkout is only included in Business Pro.");
    const state = read(storage, config);
    if (!state.cart.length) throw new Error("Your demo cart is empty.");
    if (state.cart.some(item => item.quantity > stock(config, state, item.id))) {
      throw new Error("Your cart exceeds available stock. Update quantities before checkout.");
    }
    const customer = customerDetails(input);
    const shippingMethod = input.shippingMethod;
    const order = {
      id: "DEMO-" + root.crypto.randomUUID(), ...customer, shippingMethod, status: "New", packedIds: [], shipment: null, label: null,
      demo: true, payment: "simulated-no-charge",
      createdAt: now.toISOString(), totalCents: total(config, state),
      items: state.cart.map(item => ({ ...item, name: config.products.find(product => product.id === item.id).name,
        priceCents: config.products.find(product => product.id === item.id).priceCents }))
    };
    order.boxes = shipBoxes(config, order);
    state.orders.push(order);
    state.cart = [];
    write(storage, config, state);
    return order;
  }
  function getOrder(state, id) {
    const order = state.orders.find(order => order.id === id);
    if (!order) throw new Error("Order not found.");
    return order;
  }
  function savePacking(storage, config, id, input) {
    const state = read(storage, config), order = getOrder(state, id);
    if (["Shipped", "Ready for pickup"].includes(order.status)) throw new Error("Completed orders cannot be changed.");
    if (!Array.isArray(input.packedIds) || input.packedIds.some(id => !order.items.some(item => item.id === id))) {
      throw new Error("Invalid packing checklist.");
    }
    const boxes = order.boxes || shipBoxes(config, order);
    const boxIds = boxes.flatMap((box, index) => box.items.map(item => `${index}:${item.id}`));
    const packedBoxIds = input.packedBoxIds || (boxes.length === 1 ? input.packedIds.map(id => `0:${id}`) : []);
    if (!Array.isArray(packedBoxIds) || packedBoxIds.some(id => !boxIds.includes(id))) {
      throw new Error("Invalid box packing checklist.");
    }
    const shipment = input.shipment;
    if (!shipment || !Number.isInteger(shipment.lbs) || shipment.lbs < 0 || shipment.lbs > 999 ||
        !Number.isInteger(shipment.oz) || shipment.oz < 0 || shipment.oz > 15 ||
        ["length", "width", "height"].some(field => !Number.isFinite(shipment[field]) || shipment[field] < 0 || shipment[field] > 200)) {
      throw new Error("Use 0-999 whole lbs, 0-15 whole oz, and package dimensions from 0 to 200 inches.");
    }
    const address = input.shippingAddress ?? order.shippingAddress;
    if (!isPickup(order) && (!addressText(address) || addressText(address).length > 500)) {
      throw new Error("Enter the ship-to address (up to 500 characters).");
    }
    const packedIds = [...new Set(input.packedIds)];
    const changed = JSON.stringify(order.shipment) !== JSON.stringify(shipment) ||
      JSON.stringify(order.packedBoxIds) !== JSON.stringify(packedBoxIds) ||
      JSON.stringify(order.shippingAddress) !== JSON.stringify(address) || JSON.stringify(order.packedIds) !== JSON.stringify(packedIds);
    order.shippingAddress = address;
    order.shipment = { ...shipment };
    order.packedIds = packedIds;
    order.boxes = boxes;
    order.packedBoxIds = [...new Set(packedBoxIds)];
    order.status = order.items.every(item => packedIds.includes(item.id)) && boxIds.every(id => packedBoxIds.includes(id)) ?
      (isPickup(order) ? "Ready for pickup" : "Packed") : "New";
    if (changed) { order.label = null; order.labels = []; }
    if (order.status === "Packed" && input.prepareLabel) {
      order.labels = orderLabels(config, order);
      order.label = order.labels[0];
      order.carrier = order.label.carrier;
    }
    write(storage, config, state);
    return order;
  }
  function labelDetails(config, order, shipment = order.shipment) {
    if (!shipment || shipment.lbs * 16 + shipment.oz <= 0 ||
        ["length", "width", "height"].some(field => shipment[field] <= 0)) {
      throw new Error("Enter a positive box weight and all three package dimensions.");
    }
    if (shipment.lbs * 16 + shipment.oz > 320 ||
        ["length", "width", "height"].some(field => shipment[field] > 24)) {
      throw new Error("Each demo box must be at most 20 lb and 24 inches on every side.");
    }
    return {
      tracking: null, carrier: order.carrier || "USPS", from: shippingFrom(config.shop),
      to: shippingTo(order), ...shipment, notice: "DEMO, not real postage"
    };
  }
  function orderLabels(config, order) {
    const boxes = order.boxes || shipBoxes(config, order);
    return boxes.map((box, index) => ({ ...labelDetails(config, order, boxes.length === 1 ? order.shipment : box),
      boxNumber: index + 1, boxCount: boxes.length }));
  }
  function printLabel(storage, config, id) {
    const state = read(storage, config), order = getOrder(state, id);
    if (isPickup(order)) throw new Error("Pickup orders do not need a shipping label.");
    if (order.label) return order.label;
    if (order.status !== "Packed") throw new Error("Complete and save the packing checklist before creating a label.");
    order.labels = orderLabels(config, order);
    order.label = order.labels[0];
    order.carrier = order.label.carrier;
    write(storage, config, state);
    return order.label;
  }
  function setCarrier(storage, config, id, carrier) {
    if (!carriers.includes(carrier)) throw new Error("Choose USPS, UPS or FedEx.");
    const state = read(storage, config), order = getOrder(state, id);
    if (isPickup(order) || order.status !== "Packed" || !order.label) throw new Error("Pack the shipping order before choosing a carrier.");
    order.carrier = carrier;
    order.label.carrier = carrier;
    (order.labels || []).forEach(label => { label.carrier = carrier; });
    write(storage, config, state);
    return order;
  }
  function demoTracking(carrier) {
    const alphabet = carrier === "UPS" ? "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "0123456789";
    const length = carrier === "USPS" ? 18 : carrier === "UPS" ? 16 : 12;
    const bytes = root.crypto.getRandomValues(new Uint8Array(length));
    return (carrier === "USPS" ? "9400" : carrier === "UPS" ? "1Z" : "") +
      Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
  }
  function markShipped(storage, config, id, now = new Date()) {
    const state = read(storage, config), order = getOrder(state, id);
    if (order.status !== "Packed" || !order.label) throw new Error("Pack the order and create its demo label before marking shipped.");
    if (isPickup(order)) throw new Error("Pickup orders cannot be shipped.");
    const carrier = order.carrier || order.label.carrier || "USPS";
    if (!carriers.includes(carrier)) throw new Error("Choose USPS, UPS or FedEx.");
    order.carrier = carrier;
    const labels = order.labels?.length ? order.labels : [order.label];
    const used = new Set();
    labels.forEach(label => {
      let tracking;
      do { tracking = demoTracking(carrier); } while (used.has(tracking));
      used.add(tracking);
      label.carrier = carrier;
      label.tracking = tracking;
    });
    order.labels = labels;
    order.label = labels[0];
    order.trackingNumbers = labels.map(label => label.tracking);
    order.tracking = order.trackingNumbers[0];
    order.status = "Shipped";
    order.shippedAt = now.toISOString();
    write(storage, config, state);
    return order;
  }
  function dashboard(storage, config, now = new Date()) {
    const state = read(storage, config);
    if (config.demo.tier === "professional" && !state.bookings.some(item => item.id === "DEMO-SAMPLE-1")) {
      ["Jordan Ellis", "Taylor Reed", "Sam Parker"].forEach((name, index) => {
        const staffId = index === 1 ? "casey" : "riley", date = dateKey(now);
        const preferred = ["09:00", "11:00", "14:00"][index];
        const available = Array.from({ length: 16 }, (_, slot) =>
          `${String(9 + Math.floor(slot / 2)).padStart(2, "0")}:${slot % 2 ? "30" : "00"}`)
          .filter(time => !state.bookings.some(item => item.staffId === staffId && item.date === date && item.time === time));
        const time = available.includes(preferred) ? preferred : available[0];
        if (!time) throw new Error("No room for the demo schedule. Choose a different booking day.");
        state.bookings.push({ id: "DEMO-SAMPLE-" + (index + 1), name, staffId, date, time,
          serviceId: index === 2 ? "kids-cut" : "classic-cut", status: "Scheduled", demo: true, example: true });
      });
    }
    if (config.demo.tier === "business-pro" && !state.orders.some(item => item.id === "DEMO-SAMPLE-ORDER")) {
      const product = config.products[0];
      state.orders.push({ id: "DEMO-SAMPLE-ORDER", name: "Morgan Ellis", email: "morgan@example.com", phone: "207-555-0102",
        shippingAddress: "21 Harbor Lane\nPortland, ME 04101", shippingMethod: "UPS", createdAt: now.toISOString(),
        items: [{ id: product.id, name: product.name, quantity: 1, priceCents: product.priceCents }],
        totalCents: product.priceCents, status: "New", packedIds: [], shipment: null, label: null, demo: true, example: true });
    }
    write(storage, config, state);
    return state;
  }
  function bookingStatus(storage, config, id, next) {
    if (config.demo.tier !== "professional") throw new Error("Schedule is only available in the booking demo.");
    const state = read(storage, config), booking = state.bookings.find(item => item.id === id);
    if (!booking || !((!booking.status || booking.status === "Scheduled") && next === "Started") &&
        !(booking.status === "Started" && next === "Finished") &&
        !(["Scheduled", "Started", undefined].includes(booking.status) && next === "Canceled")) throw new Error("Start this appointment before finishing it, or cancel an active appointment.");
    booking.status = next;
    write(storage, config, state);
    return booking;
  }
  function shipBoxes(config, order) {
    if (!Array.isArray(order.items) || !order.items.length) throw new Error("An order must have items before packing.");
    const lines = order.items.map(item => {
      const product = config.products.find(product => product.id === item.id);
      if (!product) throw new Error("An earlier demo order contains a retired product. Place a new order to preview packing.");
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error("Invalid packing quantity.");
      if (!Number.isFinite(product.weight) || product.weight <= 0 || !Array.isArray(product.box) ||
          product.box.length !== 3 || product.box.some(side => !Number.isFinite(side) || side <= 0)) {
        throw new Error("Invalid product shipping weight or dimensions.");
      }
      return { product, quantity: item.quantity };
    });
    const packages = [];
    for (const { product, quantity } of lines) {
      const volume = product.box.reduce((size, side) => size * side, 1) * 1.3;
      const longest = Math.max(...product.box);
      if (longest > 24 || volume > 24 ** 3 || product.weight > 20) {
        throw new Error("An item exceeds the largest demo box (24 inches or 20 lb) and cannot be split.");
      }
      for (let unit = 0; unit < quantity; unit++) {
        let box = packages.find(box => box.volume + volume <= 24 ** 3 &&
          Math.ceil((box.weight + product.weight) * 16) <= 320);
        if (!box) {
          if (packages.length === 2) throw new Error("This order exceeds the largest two-box demo shipment. Reduce quantities.");
          box = { volume: 0, weight: 0, longest: 0, fragile: false, items: [] };
          packages.push(box);
        }
        box.volume += volume;
        box.weight += product.weight;
        box.longest = Math.max(box.longest, longest);
        box.fragile ||= Boolean(product.fragile);
        const item = box.items.find(item => item.id === product.id);
        if (item) item.quantity++;
        else box.items.push({ id: product.id, name: product.name, quantity: 1 });
      }
    }
    return packages.map(box => {
      const ounces = Math.ceil(box.weight * 16);
      const side = [8, 10, 12, 14, 16, 18, 20, 24].find(side => side ** 3 >= box.volume && side >= box.longest);
      return { lbs: Math.floor(ounces / 16), oz: ounces % 16, length: side, width: side, height: side,
        items: box.items, fragile: box.fragile };
    });
  }
  function shipBox(config, order) {
    const packages = order.boxes || shipBoxes(config, order);
    const ounces = packages.reduce((sum, box) => sum + box.lbs * 16 + box.oz, 0);
    return { boxes: packages.length, lbs: Math.floor(ounces / 16), oz: ounces % 16,
      length: packages[0].length, width: packages[0].width, height: packages[0].height,
      items: packages.reduce((sum, box) => sum + box.items.reduce((count, item) => count + item.quantity, 0), 0),
      fragile: packages.some(box => box.fragile) };
  }
  function savePhoto(storage, config, field, data) {
    const barberField = config.barbers?.some(staff => field === `barberPhoto:${staff.id}`);
    if ((!["barberPhoto", "workPhoto"].includes(field) && !barberField) || typeof data !== "string" ||
        !/^data:image\/(?:jpeg|png|webp);base64,/.test(data) || data.length > 4000000) {
      throw new Error("Choose a JPG, PNG or WebP photo smaller than 3 MB.");
    }
    const state = read(storage, config);
    state[field] = data;
    write(storage, config, state);
  }
  const api = { key, read, lead, personalize, timeLabel, stock, resetStoreVisit, dates, slots, book, setQuantity, clearCart, total, checkout,
    parseAddress, addressText, shippingTo, shippingFrom, isPickup, savePacking, printLabel, setCarrier, markShipped,
    dashboard, bookingStatus, shipBox, shipBoxes, savePhoto };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BusinessProDemo = api;
})(globalThis);
