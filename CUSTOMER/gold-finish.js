/* ============================================================
   BUSINESS PRO — REAL GOLD FINISH + ROUNDED CORNERS (one file, every Business Pro page)

   House rules (Tom, 10/24/2026):
   1. Gold looks like real polished gold (the BP logo gold), not flat paint:
      gold bars/buttons, gold edging and gold letters (menus, ghost buttons, titles) use gold-texture.webp.
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
  const BIG_TEXT_PX = 20;          // big gold letters: wider slice of the gold picture (more shine)
  const MIN_TEXT_PX = 11;          // gold letters this size or bigger get the real-gold finish
  const RADIUS = "12px", SMALL_RADIUS = "7px";
  const SKIP_TAGS = new Set(["HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK", "META", "BR", "HR", "OPTION", "SVG", "PATH", "G", "LINE", "CIRCLE", "RECT", "POLYLINE", "POLYGON", "DEFS", "USE", "TITLE", "NOSCRIPT", "TEMPLATE", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "COL", "COLGROUP", "CAPTION"]);
  const ALWAYS_ROUND = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "IMG", "VIDEO", "IFRAME", "CANVAS", "DIALOG"]);
  const PROPS = ["background-image", "background-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-radius", "-webkit-background-clip", "background-clip", "-webkit-text-fill-color", "text-shadow", "box-shadow", "background-size", "background-position", "background-repeat", "background-origin", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"];
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

    // 2 + 3. Gold edging and gold letters → real gold, built as stacked background layers:
    //   [real gold clipped to the letters] → [the element's own dark fill] → [real gold in the border ring]
    // so a ghost button (dark inside, gold edge, gold words) gets glossy edging AND glossy words.
    const sides = ["top", "right", "bottom", "left"].filter(side =>
      parseFloat(s.getPropertyValue(`border-${side}-width`)) > 0 &&
      s.getPropertyValue(`border-${side}-style`) === "solid" &&
      isGold(rgba(s.getPropertyValue(`border-${side}-color`))));
    const color = rgba(s.color);
    const size = parseFloat(s.fontSize) || 0;
    const goldText = isGold(color) && size >= MIN_TEXT_PX && el.textContent.trim() !== "" &&
      !["INPUT", "SELECT", "TEXTAREA", "OPTION"].includes(el.tagName) && allTextSameColor(el, s.color);
    if (!isGold(bg) && !hasOwnImage && (sides.length || goldText)) {
      const images = [], clips = [], sizes = [], spots = [], repeats = [];
      if (goldText) { images.push(IMG); clips.push("text"); sizes.push(size >= BIG_TEXT_PX ? "auto 320%" : "auto 190%"); spots.push(size >= BIG_TEXT_PX ? "30% 42%" : "0 55%"); repeats.push("repeat"); }
      const inside = bg && bg.a > 0 ? bg : null;
      if (inside) { images.push(`linear-gradient(${css(inside)}, ${css(inside)})`); clips.push(sides.length ? "padding-box" : "border-box"); sizes.push("auto"); spots.push("0 0"); repeats.push("no-repeat"); }
      if (sides.length) {
        if (!inside || inside.a < 0.95) { const back = solidBehind(el); images.push(`linear-gradient(${back}, ${back})`); clips.push("padding-box"); sizes.push("auto"); spots.push("0 0"); repeats.push("no-repeat"); }
        images.push(IMG); clips.push("border-box"); sizes.push("cover"); spots.push("center"); repeats.push("no-repeat");
        sides.forEach(side => set(el, `border-${side}-color`, "transparent"));
      }
      set(el, "background-color", "transparent");
      set(el, "background-image", images.join(", "));
      set(el, "-webkit-background-clip", clips.join(", "));
      set(el, "background-clip", clips.join(", "));
      set(el, "background-origin", clips.map(() => "border-box").join(", "));
      set(el, "background-size", sizes.join(", "));
      set(el, "background-position", spots.join(", "));
      set(el, "background-repeat", repeats.join(", "));
      if (goldText) { set(el, "-webkit-text-fill-color", "transparent"); set(el, "text-shadow", "none"); }
      // Ghost buttons (gold edge + gold words): a soft gold glow inside so they read as gold, not black.
      if (goldText && sides.length && s.boxShadow === "none") set(el, "box-shadow", "inset 0 0 14px rgba(212, 175, 55, .28), 0 0 6px rgba(212, 175, 55, .18)");
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
