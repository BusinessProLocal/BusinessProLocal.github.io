/* ============================================================
   BUSINESS PRO — REAL GOLD FINISH + ROUNDED CORNERS (one file, every Business Pro page)

   House rules (Tom, 10/24/2026):
   1. Gold looks like real polished gold (the BP logo gold), not flat paint:
      gold bars/buttons, gold edging and big gold letters use gold-texture.webp.
      Small gold text (labels, fine print) stays flat gold so it reads clearly on a phone.
   2. No square (90-degree) corners anywhere: every box, button, input and picture is rounded.

   How: after the page draws (and again whenever it redraws), this looks at what each
   element really looks like on screen and upgrades the gold parts. It never touches:
   - customer website previews (anything inside [data-no-gold], an iframe, or .site-preview)
   - anything with data-no-gold on it
   Load it with: <script src="…/ADMIN/gold-finish.js" defer></script>
   ============================================================ */
(function () {
  "use strict";
  if (window.__bpGoldFinish) return;
  window.__bpGoldFinish = true;

  const me = document.currentScript;
  const GOLD_URL = new URL("gold-texture.webp", (me && me.src) || location.href).href;
  const IMG = `url("${GOLD_URL}")`;
  const BIG_TEXT_PX = 20;          // gold text this size or bigger gets the glossy finish
  const RADIUS = "12px", SMALL_RADIUS = "7px";
  const SKIP_TAGS = new Set(["HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK", "META", "BR", "HR", "OPTION", "SVG", "PATH", "G", "LINE", "CIRCLE", "RECT", "POLYLINE", "POLYGON", "DEFS", "USE", "TITLE", "NOSCRIPT", "TEMPLATE", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "COL", "COLGROUP", "CAPTION"]);
  const ALWAYS_ROUND = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "IMG", "VIDEO", "IFRAME", "CANVAS", "DIALOG"]);
  const PROPS = ["background-image", "background-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-radius", "-webkit-background-clip", "background-clip", "-webkit-text-fill-color", "text-shadow", "background-size", "background-position", "background-repeat", "background-origin"];
  const touched = new Map(); // element → its own inline values before we changed anything

  function rgba(text) {
    const m = /rgba?\(([^)]+)\)/.exec(text || "");
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function isGold(c) {
    return Boolean(c) && c.a > 0.5 && c.r >= 170 && c.g >= 120 && c.g <= 215 && c.b <= 125 && c.r >= c.g && c.r - c.b >= 90;
  }
  const css = c => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
  function skip(el) {
    return SKIP_TAGS.has(el.tagName) || el.closest("[data-no-gold], .site-preview, #site-preview, .preview-frame") !== null;
  }
  function restore(el) {
    const saved = touched.get(el);
    if (!saved) return;
    for (const prop of PROPS) {
      if (saved[prop]) el.style.setProperty(prop, saved[prop][0], saved[prop][1]);
      else el.style.removeProperty(prop);
    }
    touched.delete(el);
  }
  function set(el, prop, value) {
    if (!touched.has(el)) {
      const saved = {};
      for (const p of PROPS) { const v = el.style.getPropertyValue(p); if (v) saved[p] = [v, el.style.getPropertyPriority(p)]; }
      touched.set(el, saved);
    }
    el.style.setProperty(prop, value, "important");
  }
  // The nearest solid color behind an element (what shows through a see-through panel).
  function solidBehind(el) {
    for (let node = el.parentElement; node; node = node.parentElement) {
      const c = rgba(getComputedStyle(node).backgroundColor);
      if (c && c.a >= 0.95) return css(c);
    }
    return "rgb(0, 0, 0)";
  }
  // Every bit of text inside is the same gold (so the glossy fill can't recolor other text).
  function allTextSameColor(el, color) {
    const kids = el.querySelectorAll("*");
    if (kids.length > 12) return false;
    for (const kid of kids) {
      if (!kid.textContent.trim()) continue;
      const s = getComputedStyle(kid);
      if (s.color !== color || (s.backgroundImage !== "none") || (rgba(s.backgroundColor) || { a: 0 }).a > 0) return false;
    }
    return true;
  }

  function finish(el) {
    restore(el);
    if (skip(el)) return;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || s.display.startsWith("table") || s.display === "contents") return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const bg = rgba(s.backgroundColor);
    const hasOwnImage = s.backgroundImage !== "none";
    // Measured before any gold changes (they make the border color transparent).
    const square = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"].every(k => parseFloat(s[k]) === 0);
    const hasBorder = ["top", "right", "bottom", "left"].some(side =>
      parseFloat(s.getPropertyValue(`border-${side}-width`)) > 0 && s.getPropertyValue(`border-${side}-style`) !== "none" && (rgba(s.getPropertyValue(`border-${side}-color`)) || { a: 0 }).a > 0);
    const hasFill = (bg && bg.a > 0) || hasOwnImage || s.boxShadow !== "none";

    // 1. Gold bars, gold buttons, gold badges → real gold
    if (isGold(bg) && !hasOwnImage) {
      set(el, "background-image", IMG);
      set(el, "background-size", rect.width > 600 ? "cover" : "260% auto");
      set(el, "background-position", "center 40%");
      set(el, "background-repeat", "no-repeat");
      set(el, "background-origin", "border-box");
      if (rect.height <= 80) set(el, "text-shadow", "0 1px 0 rgba(255, 240, 190, .45)");
    }

    // 2. Gold edging → real gold edging (solid borders only; dashed stays as it is)
    const sides = ["top", "right", "bottom", "left"].filter(side =>
      parseFloat(s[`border-${side}-width`] || s.getPropertyValue(`border-${side}-width`)) > 0 &&
      s.getPropertyValue(`border-${side}-style`) === "solid" &&
      isGold(rgba(s.getPropertyValue(`border-${side}-color`))));
    if (sides.length && !hasOwnImage && !isGold(bg)) {
      const inside = bg && bg.a > 0 ? bg : null;
      const layers = [];
      if (inside) layers.push(`linear-gradient(${css(inside)}, ${css(inside)}) padding-box`);
      if (!inside || inside.a < 0.95) { const back = solidBehind(el); layers.push(`linear-gradient(${back}, ${back}) padding-box`); }
      layers.push(`${IMG} center / cover border-box`);
      set(el, "background-image", "none");
      set(el, "background", layers.join(", "));
      sides.forEach(side => set(el, `border-${side}-color`, "transparent"));
    }

    // 3. Big gold letters → glossy gold letters
    const color = rgba(s.color);
    const size = parseFloat(s.fontSize) || 0;
    if (isGold(color) && size >= BIG_TEXT_PX && el.textContent.trim() && !hasOwnImage && !(bg && bg.a > 0) && !sides.length &&
        !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(el.tagName) && allTextSameColor(el, s.color)) {
      set(el, "background-image", IMG);
      set(el, "background-size", "220% auto");
      set(el, "background-position", "30% 68%");
      set(el, "background-repeat", "no-repeat");
      set(el, "-webkit-background-clip", "text");
      set(el, "background-clip", "text");
      set(el, "-webkit-text-fill-color", "transparent");
    }

    // 4. No square corners: anything that shows as a box gets rounded
    if (!square) return;
    const fullPage = rect.width >= innerWidth - 2 && rect.height >= innerHeight * 0.9;
    if (fullPage) return;
    if (ALWAYS_ROUND.has(el.tagName) || hasBorder || hasFill) {
      if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio")) return;
      set(el, "border-radius", rect.height < 30 || rect.width < 30 ? SMALL_RADIUS : RADIUS);
    }
  }

  let queued = false;
  function run() {
    queued = false;
    observer.disconnect();
    try { document.querySelectorAll("body *").forEach(finish); }
    finally { observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "open", "aria-current", "aria-expanded", "disabled"] }); }
  }
  function queue() {
    if (queued) return;
    queued = true;
    setTimeout(() => requestAnimationFrame(run), 120);
  }
  const observer = new MutationObserver(queue);
  window.addEventListener("resize", queue);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", queue); else queue();
  window.addEventListener("load", queue);
  window.bpGoldFinish = { refresh: queue, textureUrl: GOLD_URL };
})();
