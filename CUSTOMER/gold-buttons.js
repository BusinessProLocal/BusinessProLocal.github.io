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
    element.style.setProperty("--gold-bar-height", element.getBoundingClientRect().height + "px");
    const available = element.clientWidth - 16;
    if (available <= 0) return;
    const words = element.dataset.goldBarLabel.toUpperCase().split(/\s+/);
    let size = parseFloat(style.fontSize);
    for (let attempt = 0; attempt < 30; attempt++) {
      measure.font = `700 ${size}px Cinzel`;
      const widths = words.map(word => measure.measureText(word).width);
      const longest = Math.max(...widths);
      if (longest > available) { size *= available / longest; continue; }
      const space = measure.measureText(" ").width;
      let lines = 1, width = 0;
      for (const wordWidth of widths) {
        if (width && width + space + wordWidth > available) { lines++; width = wordWidth; }
        else width += (width ? space : 0) + wordWidth;
      }
      if (lines * size * 1.15 <= element.clientHeight * .92) break;
      size *= .95;
    }
    element.style.setProperty("--gold-bar-label-size", size + "px");
  }
  const resize = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
  const observer = new MutationObserver(refresh);
  function refresh() {
    observer.disconnect();
    for (const element of document.querySelectorAll("button,a.btn,a.book-button,.owner-preview-popup a,[role=button]")) {
      if (element.matches(".intro-splash,.ad-tab") || element.closest("#ad-popup")) continue;
      const style = getComputedStyle(element);
      if (!element.classList.contains("gold-bar") &&
        ![style.backgroundColor, style.color, style.borderTopColor].some(color => goldColors.has(color))) continue;
      if (element.querySelector("input,select,textarea,button,a")) continue;
      const text = element.querySelector(":scope > .gold-word-text")?.textContent ||
        [...element.childNodes].map(node => node.textContent.trim()).filter(Boolean).join(" ");
      if (!text) continue;
      if (!element.hasAttribute("aria-label") || element.dataset.goldBarAutoLabel === "true") {
        element.setAttribute("aria-label", text);
        element.dataset.goldBarAutoLabel = "true";
      }
      element.dataset.goldBarLabel = text;
      if (!element.classList.contains("gold-bar")) {
        element.style.setProperty("--gold-bar-position", style.position === "static" ? "relative" : style.position);
        element.classList.add("gold-bar");
        resize.observe(element);
      }
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
