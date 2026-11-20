/* ============================================================
   BUSINESS PRO DEMOS — OWNER VIEW NEW LOOK (11/19, Tom)
   The demos' "SHOP OWNER VIEW" gets the same look as the real owner portal (11/18):
   white and black, square corners, one font, menu across the top. Gold only on the BP logo.

   Same repaint as business-pro-server ADMIN/bp-new-look.js, but it only touches the demo's
   owner view (#daily-dashboard), so the shop's customer website around it keeps its own look.
   ============================================================ */
(function () {
  "use strict";
  if (window.__bpDemoNewLook) return;
  window.__bpDemoNewLook = true;

  const SCOPE = "body.demo-owner-open #daily-dashboard";
  const FONT = 'Inter, system-ui, "Segoe UI", Arial, sans-serif';
  const css = `
${SCOPE}{background:#fff!important;color:#000;font-family:${FONT}!important}
${SCOPE} *:not(svg):not(svg *){font-family:${FONT}!important}
${SCOPE},${SCOPE} *,${SCOPE} *::before,${SCOPE} *::after{border-radius:0!important;text-shadow:none!important}
${SCOPE} .bp-round,${SCOPE} .dashboard-barber-photo,${SCOPE} .dashboard-barber-photo *{border-radius:50%!important}
${SCOPE} h1,${SCOPE} h2,${SCOPE} h3{font-weight:800!important;letter-spacing:-.01em}
${SCOPE} input,${SCOPE} select,${SCOPE} textarea{background:#fff!important;color:#000!important;border:1.5px solid #000!important}
${SCOPE} ::placeholder{color:#71717a!important}
`;
  const style = document.createElement("style");
  style.id = "bp-demo-new-look-css";
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  // ---------- repaint what the old gold look left behind (owner view only) ----------
  // parts the new-look CSS (demo-owner.css) colors itself: the sweep leaves them alone
  // 11/20 (Tom): + the black shop-name block at the top-left (.sidebar .brand)
  const KEEP = "[data-keep-color], img, svg, video, canvas, iframe, .dashboard-photo-silhouette, .shop-owner-banner, .dash-step, .completed-barber-block, .sidebar .brand";
  function rgba(text) {
    const m = /rgba?\(([^)]+)\)/.exec(text || "");
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  const visibleColor = c => c && c.a > 0.4;
  const isGold = c => visibleColor(c) && c.r >= 150 && c.g >= 100 && c.g <= 220 && c.b <= 130 && c.r >= c.g && c.r - c.b >= 70;
  const isDark = c => visibleColor(c) && c.r < 45 && c.g < 45 && c.b < 45;
  const isLight = c => visibleColor(c) && c.r > 215 && c.g > 215 && c.b > 215;
  const isButton = el => el.matches("button, [role=button], input[type=button], input[type=submit], a.btn, a.button, .btn, .action-btn, .lock-btn, .book-button");
  const setIf = (el, prop, value) => { if (el.style.getPropertyValue(prop) !== value) el.style.setProperty(prop, value, "important"); };
  function backdrop(el) {
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const c = rgba(getComputedStyle(node).backgroundColor);
      if (visibleColor(c)) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function paint(el) {
    if (el.closest(KEEP)) return;
    const s = getComputedStyle(el);
    const bg = rgba(s.backgroundColor), fg = rgba(s.color);
    if (s.backgroundImage !== "none" && /gradient|gold|circuit|texture/i.test(s.backgroundImage)) setIf(el, "background-image", "none");
    if (s.boxShadow !== "none") setIf(el, "box-shadow", "none");
    if (el.dataset.bpLook === "black") return;
    if (isButton(el)) {
      if (isGold(bg) || isDark(bg)) { setIf(el, "background-color", "#000"); setIf(el, "color", "#fff"); setIf(el, "-webkit-text-fill-color", "#fff"); setIf(el, "border-color", "#000"); }
      else if (!visibleColor(bg) || isLight(bg)) {
        if (isGold(fg) || isLight(fg) || isGold(rgba(s.borderTopColor))) { setIf(el, "color", "#000"); setIf(el, "-webkit-text-fill-color", "#000"); setIf(el, "border-color", "#000"); }
      }
      return;
    }
    if (isGold(bg)) { el.dataset.bpLook = "black"; setIf(el, "background-color", "#000"); setIf(el, "color", "#fff"); setIf(el, "-webkit-text-fill-color", "#fff"); return; }
    if (isDark(bg) && el.dataset.bpLook !== "black") {
      setIf(el, "background-color", "#fff");
      if (el.offsetHeight > 30 && el.offsetWidth > 60 && !["SPAN", "B", "STRONG", "SMALL", "LABEL"].includes(el.tagName)) setIf(el, "border-color", "#e4e4e7");
    }
    ["Top", "Right", "Bottom", "Left"].forEach(side => {
      const c = rgba(s[`border${side}Color`]);
      if (isGold(c) && parseFloat(s[`border${side}Width`]) > 0) setIf(el, `border-${side.toLowerCase()}-color`, el.offsetHeight > 120 ? "#e4e4e7" : "#000");
    });
    if (isGold(fg) || (isLight(fg) && isLight(backdrop(el)))) { setIf(el, "color", "#000"); setIf(el, "-webkit-text-fill-color", "#000"); }
    if (isGold(rgba(s.textDecorationColor))) setIf(el, "text-decoration-color", "#000");
    if (s.webkitBackgroundClip === "text" || s.backgroundClip === "text") { setIf(el, "-webkit-text-fill-color", "#000"); setIf(el, "background-image", "none"); }
  }

  let queued = false;
  function sweep() {
    queued = false;
    const root = document.querySelector(SCOPE);
    if (!root) return; // the customer website is showing: leave it alone
    paint(root);
    root.querySelectorAll("*").forEach(paint);
  }
  function soon() { if (!queued) { queued = true; requestAnimationFrame(() => setTimeout(sweep, 30)); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", soon); else soon();
  window.addEventListener("load", soon);
  new MutationObserver(list => {
    if (list.every(m => m.type === "attributes" && m.attributeName === "style")) return;
    soon();
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "style"] });

  window.BusinessProDemoNewLook = { sweep, paint, isGold, isDark };
})();
