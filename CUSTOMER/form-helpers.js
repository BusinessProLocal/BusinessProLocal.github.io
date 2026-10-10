(function (root) {
  "use strict";
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com"];
  const sample = { name: "Joe Test", business: "Joe's Barbershop", phone: "207-555-0101", email: "joe.test@gmail.com",
    address: "7 Clipper Lane, Sanford, Maine 04073", businessType: "Barbershop" };
  const leadFields = ["name", "business", "phone", "email", "address", "businessType", "questions"];
  function clearLegacyVisitor(storage) {
    for (const key of ["businessProLeads", "businessProGetStartedDraft_v1", "businessProSignupDraft_v1", "businessProSignups"]) {
      storage.removeItem(key);
    }
  }
  function latestLead(storage) {
    const leads = JSON.parse(storage.getItem("businessProLeads") || "[]");
    if (!Array.isArray(leads)) throw new Error("Saved Get Started information is invalid.");
    const latest = leads.at(-1);
    if (latest === undefined) return null;
    if (!latest || typeof latest !== "object" || Array.isArray(latest) || leadFields.some(field =>
      latest[field] !== undefined && typeof latest[field] !== "string")) {
      throw new Error("Saved Get Started information is invalid.");
    }
    return latest;
  }
  function leadValues(storage) {
    const lead = latestLead(storage);
    return Object.fromEntries(leadFields.map(field => [field, lead?.[field]?.trim() || sample[field] || ""]));
  }
  function saveDraft(storage, key, values) {
    if (!values || Object.values(values).some(value => typeof value !== "string")) throw new Error("Form draft is invalid.");
    storage.setItem(key, JSON.stringify({ values, leadSignature: JSON.stringify(latestLead(storage)) }));
  }
  function readDraft(storage, key) {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const draft = JSON.parse(raw);
    if (!draft || !draft.values || typeof draft.values !== "object" || Array.isArray(draft.values) ||
        typeof draft.leadSignature !== "string" || Object.values(draft.values).some(value => typeof value !== "string")) {
      throw new Error("Saved form draft is invalid.");
    }
    return draft.leadSignature === JSON.stringify(latestLead(storage)) ? draft.values : null;
  }
  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join("-");
  }
  function testVisible() {
    return Array.from(document.querySelectorAll(".test-bar")).some(bar =>
      !bar.hidden && getComputedStyle(bar).display !== "none" && getComputedStyle(bar).visibility !== "hidden");
  }
  function enhance(root = document) {
    root.querySelectorAll('input[type="tel"]:not([data-phone-ready])').forEach(input => {
      input.dataset.phoneReady = "true";
      input.placeholder = "207-555-0101";
      input.maxLength = 12;
      input.addEventListener("input", () => {
        const caret = input.selectionStart ?? input.value.length;
        const digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
        input.value = formatPhone(input.value);
        let position = 0, count = 0;
        while (position < input.value.length && count < digitsBefore) {
          if (/\d/.test(input.value[position])) count++;
          position++;
        }
        input.setSelectionRange(position, position);
      });
    });
    root.querySelectorAll('input[type="email"]:not([data-email-ready])').forEach(input => {
      input.dataset.emailReady = "true";
      input.autocomplete = "off";
      const choices = document.createElement("div");
      choices.className = "email-choices";
      choices.setAttribute("aria-label", "Choose an email ending");
      choices.hidden = true;
      input.insertAdjacentElement("afterend", choices);
      function update() {
        const at = input.value.indexOf("@");
        const ending = input.value.slice(at + 1).toLowerCase();
        choices.replaceChildren();
        if (at < 1 || input.value.indexOf("@", at + 1) !== -1) { choices.hidden = true; return; }
        domains.filter(domain => domain.startsWith(ending) && domain !== ending).forEach(domain => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = domain;
          button.addEventListener("click", () => {
            input.value = input.value.slice(0, at + 1) + domain;
            choices.hidden = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.focus();
          });
          choices.appendChild(button);
        });
        choices.hidden = !choices.childElementCount;
      }
      input.addEventListener("input", update);
      input.addEventListener("keydown", event => { if (event.key === "Escape") choices.hidden = true; });
      input.addEventListener("blur", event => {
        if (!choices.contains(event.relatedTarget)) choices.hidden = true;
      });
    });
  }
  function fill(fields, values = sample) {
    Object.entries(fields).forEach(([field, id]) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.value = values[field] ?? "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  function formFailure(container, failure) {
    let message = container.querySelector(".form-storage-error");
    if (!message) {
      message = document.createElement("p");
      message.className = "form-storage-error";
      message.setAttribute("role", "alert");
      container.appendChild(message);
    }
    message.textContent = "Your information could not be saved or restored on this device: " + failure.message;
    console.error(failure);
  }
  function fillAction(container, fields, values) {
    try {
      container.querySelector(".form-storage-error")?.remove();
      fill(fields, typeof values === "function" ? values() : values);
    } catch (failure) { formFailure(container, failure); }
  }
  function addTestButton(container, fields, values = sample) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "test-fill btn ghost";
    button.textContent = "Fill test info";
    button.hidden = !testVisible();
    button.addEventListener("click", () => fillAction(container, fields, values));
    container.prepend(button);
    return button;
  }
  function addDemoButton(container, fields, values = sample) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "demo-fill btn ghost";
    button.textContent = "Fill sample info";
    button.addEventListener("click", () => fillAction(container, fields, values));
    container.prepend(button);
    return button;
  }
  const api = { enhance, fill, addTestButton, addDemoButton, sample, formatPhone, latestLead, leadValues, readDraft, saveDraft, clearLegacyVisitor };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }
  root.BusinessProForms = api;
  try { clearLegacyVisitor(localStorage); }
  catch (failure) { formFailure(document.body, failure); }
  enhance();
  function startValues(values) {
    const select = document.getElementById("fType");
    const type = values.businessType || "";
    const known = Array.from(select.options).some(option => option.value === type && type !== "Custom");
    return { ...values, businessType: known ? type : type ? "Custom" : "", customType: known ? "" : type };
  }
  function remember(container, fields, key, transform = values => values) {
    let restoring = false;
    const ids = new Set(Object.values(fields));
    function restore() {
      restoring = true;
      try {
        const draft = readDraft(sessionStorage, key);
        const lead = latestLead(sessionStorage);
        fill(fields, draft || transform(lead || {}));
      } catch (failure) { formFailure(container, failure); }
      finally { restoring = false; }
    }
    function save(event) {
      if (restoring || (event && !ids.has(event.target.id) && event.type !== "submit")) return;
      try {
        const values = Object.fromEntries(Object.entries(fields).map(([field, id]) => [field, document.getElementById(id).value]));
        saveDraft(sessionStorage, key, values);
        container.querySelector(".form-storage-error")?.remove();
      } catch (failure) { formFailure(container, failure); }
    }
    restore();
    for (const type of ["input", "change", "focusout", "submit"]) container.addEventListener(type, save);
    window.addEventListener("pageshow", () => requestAnimationFrame(restore));
    window.addEventListener("storage", event => {
      if (event.key === "businessProLeads" || event.key === key || event.key === null) restore();
    });
  }
  const start = document.getElementById("startForm");
  if (start) {
    start.autocomplete = "off";
    start.querySelectorAll("input, select, textarea").forEach(field => { field.autocomplete = "off"; });
    const fields = { name: "fName", business: "fBiz", phone: "fPhone", email: "fEmail", address: "fAddress",
      businessType: "fType", customType: "fCustomType", questions: "fMsg" };
    remember(start, fields, "businessProGetStartedDraft_v1", startValues);
  }
  const signup = document.getElementById("business-name");
  if (signup) {
    const container = signup.closest(".signup-section");
    const fields = { name: "owner-name", business: "business-name", phone: "business-phone", email: "business-email", address: "business-address",
      questions: "business-notes" };
    const type = document.getElementById("business-type");
    if (type) fields.businessType = type.id;
    remember(container, fields, "businessProSignupDraft_v1");
  }
  new MutationObserver(() => {
    const visible = testVisible();
    document.querySelectorAll(".test-fill").forEach(button => { if (button.hidden === visible) button.hidden = !visible; });
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
})(globalThis);
