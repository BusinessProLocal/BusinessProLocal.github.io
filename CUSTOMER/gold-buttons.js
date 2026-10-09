(function () {
  "use strict";
  const scriptUrl = document.currentScript.src;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("gold-buttons.css", scriptUrl).href;
  document.head.append(stylesheet);
  const goldColors = new Set(["rgb(212, 175, 55)", "rgb(243, 215, 122)", "rgb(156, 122, 28)", "rgb(184, 134, 11)"]);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("This browser could not measure engraved gold button labels.");
  function fit(element) {
    const style = getComputedStyle(element);
    const parentStyle = getComputedStyle(element.parentElement);
    const available = element.parentElement.clientWidth - parseFloat(parentStyle.paddingLeft) -
      parseFloat(parentStyle.paddingRight) - 24 - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
    if (available <= 0) return;
    const words = element.dataset.goldBarLabel.toUpperCase().split(/\s+/);
    const baseSize = parseFloat(style.fontSize);
    measure.font = `700 ${baseSize}px Cinzel`;
    const longest = Math.max(...words.map(word => measure.measureText(word).width));
    const size = longest > available ? baseSize * available / longest : baseSize;
    element.style.setProperty("--gold-bar-label-size", size + "px");
    element.style.setProperty("--gold-bar-height", element.getBoundingClientRect().height + "px");
  }
  const resize = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
  const observer = new MutationObserver(refresh);
  function setupMagnet() {
    const hero = document.querySelector(".hero-demos");
    const picture = hero?.closest(".hero");
    if (!picture || hero.dataset.magnetReady) return;
    hero.dataset.magnetReady = "true";
    const allowed = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    function reset() {
      picture.classList.remove("hero-magnet-active");
      hero.style.setProperty("--magnet-x", "0px");
      hero.style.setProperty("--magnet-y", "0px");
    }
    function follow(event) {
      if (event.pointerType !== "mouse" || !allowed.matches || window.innerWidth <= 700) return;
      const rect = picture.getBoundingClientRect();
      const halfWidth = hero.offsetWidth / 2, halfHeight = hero.offsetHeight / 2;
      const home = { x: hero.offsetLeft, y: hero.offsetTop + halfHeight };
      const targetX = Math.max(halfWidth, Math.min(rect.width - halfWidth, event.clientX - rect.left));
      const targetY = Math.max(halfHeight + 8, Math.min(rect.height - halfHeight - 8, event.clientY - rect.top));
      const x = targetX - home.x, y = targetY - home.y;
      picture.classList.add("hero-magnet-active");
      hero.style.setProperty("--magnet-x", x + "px");
      hero.style.setProperty("--magnet-y", y + "px");
    }
    picture.addEventListener("pointerenter", follow);
    picture.addEventListener("pointermove", follow);
    picture.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    allowed.addEventListener("change", reset);
  }
  function refresh() {
    observer.disconnect();
    setupMagnet();
    for (const element of document.querySelectorAll("button,a.btn,a.book-button,.owner-preview-popup a,[role=button]")) {
      if (element.matches(".intro-splash,.ad-tab,.booking-date-day") || element.closest("#ad-popup")) continue;
      if (element.closest("#daily-dashboard,.owner-preview-popup") || document.body.classList.contains("demo-owner-open")) {
        if (element.classList.contains("gold-bar")) {
          const source = element.querySelector(":scope > .gold-bar-source");
          if (source) {
            while (source.firstChild) element.insertBefore(source.firstChild, source);
            source.remove();
          }
          element.querySelector(":scope > .gold-bar-label")?.remove();
          element.classList.remove("gold-bar");
          resize.unobserve(element);
          for (const name of ["--gold-bar-height", "--gold-bar-label-size", "--gold-bar-position", "--gold-bar-side-padding"]) element.style.removeProperty(name);
        }
        continue;
      }
      const style = getComputedStyle(element);
      if (!element.classList.contains("gold-bar") &&
        ![style.backgroundColor, style.color, style.borderTopColor].some(color => goldColors.has(color))) continue;
      if (element.querySelector("input,select,textarea,button,a")) continue;
      const source = element.querySelector(":scope > .gold-bar-source") || element;
      const text = source.querySelector(":scope > .gold-word-text")?.textContent ||
        [...source.childNodes].map(node => node.textContent.trim()).filter(Boolean).join(" ");
      if (!text) continue;
      if (!element.hasAttribute("aria-label") || element.dataset.goldBarAutoLabel === "true") {
        element.setAttribute("aria-label", text);
        element.dataset.goldBarAutoLabel = "true";
      }
      element.dataset.goldBarLabel = text;
      if (!element.classList.contains("gold-bar") || !element.querySelector(":scope > .gold-bar-label")) {
        element.style.setProperty("--gold-bar-position", style.position === "static" ? "relative" : style.position);
        const original = document.createElement("span");
        original.className = "gold-bar-source";
        while (element.firstChild) original.append(element.firstChild);
        const label = document.createElement("span");
        label.className = "gold-bar-label";
        label.setAttribute("aria-hidden", "true");
        element.append(original, label);
        element.classList.add("gold-bar");
        resize.observe(element);
      }
      element.querySelector(":scope > .gold-bar-label").textContent = text;
      fit(element);
    }
    observer.observe(document.body, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ["class", "disabled"] });
  }
  window.BusinessProGoldButtons = { refresh };
  stylesheet.addEventListener("load", refresh);
  stylesheet.addEventListener("error", () => console.error("Gold button stylesheet failed to load:", stylesheet.href));
  window.addEventListener("goldwordschange", refresh);
  document.fonts.addEventListener("loadingdone", refresh);
  document.fonts.ready.then(refresh);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
