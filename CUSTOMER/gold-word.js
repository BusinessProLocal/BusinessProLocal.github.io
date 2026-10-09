(function () {
  "use strict";
  const scriptUrl = document.currentScript.src;
  const assetUrl = new URL("../images/gold-letters/", scriptUrl);
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("gold-word.css", scriptUrl).href;
  document.head.append(stylesheet);
  const buttons = document.createElement("script");
  buttons.src = new URL("gold-buttons.js", scriptUrl).href;
  buttons.addEventListener("error", () => console.error("Gold button script failed to load:", buttons.src));
  document.head.append(buttons);
  const widths = { "0":180,"1":129,"2":175,"3":165,"4":175,"5":162,"6":175,"7":183,"8":178,"9":175,
    A:234,B:203,C:204,D:228,E:188,F:181,G:239,H:253,I:130,J:152,K:232,L:185,M:280,N:223,
    O:233,P:194,Q:236,R:224,S:166,T:196,U:233,V:225,W:336,X:236,Y:234,Z:215,
    amp:244,apostrophe:74,comma:80,dash:133,excl:81,period:81,question:144 };
  const punctuation = { "&":"amp", "!":"excl", "?":"question", "-":"dash", "'":"apostrophe", ",":"comma", ".":"period" };
  function glyphName(character) {
    const normalized = character.replace(/[\u2018\u2019]/g, "'").replace(/[\u2013\u2014]/g, "-");
    return /^[A-Z0-9]$/.test(normalized) ? normalized : punctuation[normalized];
  }
  function makeVisual(text) {
    const visual = document.createElement("span");
    visual.className = "gold-word-visual";
    visual.setAttribute("aria-hidden", "true");
    for (const word of text.toUpperCase().trim().split(/\s+/)) {
      const piece = document.createElement("span");
      piece.className = "gold-word-piece";
      let emWidth = 0;
      for (const character of word) {
        const name = glyphName(character);
        let letter;
        if (name) {
          letter = document.createElement("img");
          letter.className = "gold-letter";
          letter.src = new URL(name + ".png", assetUrl).href;
          letter.alt = "";
          letter.width = widths[name];
          letter.height = 284;
          letter.style.setProperty("width", (widths[name] / 200) + "em", "important");
          letter.draggable = false;
          letter.addEventListener("error", () => {
            console.error("Gold letter image failed to load:", letter.src);
            const fallback = document.createElement("span");
            fallback.className = "gold-word-fallback";
            fallback.textContent = character;
            letter.replaceWith(fallback);
          }, { once: true });
          emWidth += widths[name] / 200;
        } else {
          letter = document.createElement("span");
          letter.className = "gold-word-fallback";
          letter.textContent = character;
          emWidth += 1;
        }
        piece.append(letter);
      }
      piece.dataset.emWidth = String(emWidth + Math.max(0, word.length - 1) * .04);
      visual.append(piece);
    }
    return visual;
  }
  function fit(element) {
    const style = getComputedStyle(element);
    const available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    if (available <= 0) return;
    const size = parseFloat(style.fontSize);
    const visual = element.querySelector(":scope > .gold-word-visual");
    if (!visual) return;
    visual.style.justifyContent = style.textAlign === "center" ? "center" : style.textAlign === "right" ? "flex-end" : "flex-start";
    for (const piece of visual.children) {
      const fontSize = Math.min(size, available / Number(piece.dataset.emWidth));
      const value = fontSize + "px";
      if (piece.style.fontSize !== value) piece.style.fontSize = value;
    }
  }
  const resize = new ResizeObserver(entries => {
    for (const entry of entries) fit(entry.target);
  });
  const candidates = ".gold-word,h1,h2,h3,h4,button,a.btn,a.book-button,.brand,.text-logo,.intro-splash > span";
  const goldColors = new Set(["rgb(212, 175, 55)", "rgb(243, 215, 122)", "rgb(156, 122, 28)"]);
  const observer = new MutationObserver(refresh);
  function refresh() {
    observer.disconnect();
    for (const element of document.querySelectorAll(".gold-word")) {
      if (element.closest(".gold-bar")) continue;
      if (element.closest("#daily-dashboard,.owner-preview-popup") || document.body.classList.contains("demo-owner-open") ||
        (element.dataset.goldWordAuto === "true" && !goldColors.has(getComputedStyle(element).color))) {
        const text = element.querySelector(":scope > .gold-word-text");
        if (text) element.replaceChildren(document.createTextNode(text.textContent));
        element.classList.remove("gold-word");
        delete element.dataset.goldWordAuto;
        resize.unobserve(element);
      }
    }
    let changed = false;
    for (const element of document.querySelectorAll(candidates)) {
      if (element.closest(".gold-bar")) continue;
      if (element.matches("button,a.btn,a.book-button,[role=button]")) continue;
      if (element.closest("#daily-dashboard,.owner-preview-popup") || document.body.classList.contains("demo-owner-open")) continue;
      if (element.closest(".gold-word-visual,.gold-word-text")) continue;
      if (!element.classList.contains("gold-word") && !goldColors.has(getComputedStyle(element).color)) continue;
      if (element.querySelector("input,select,textarea,button,a") || element.querySelector("img:not(.gold-letter)")) continue;
      const existing = element.querySelector(":scope > .gold-word-text");
      const text = existing ? existing.textContent : element.textContent.trim();
      if (!text) continue;
      if (!existing) {
        if (!element.classList.contains("gold-word")) element.dataset.goldWordAuto = "true";
        element.classList.add("gold-word");
        const accessible = document.createElement("span");
        accessible.className = "gold-word-text";
        accessible.textContent = text;
        element.replaceChildren(accessible, makeVisual(text));
        resize.observe(element);
        changed = true;
      }
      fit(element);
    }
    observer.observe(document.body, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ["class", "disabled"] });
    if (changed) window.dispatchEvent(new Event("goldwordschange"));
  }
  window.BusinessProGoldWords = { refresh };
  stylesheet.addEventListener("load", refresh);
  stylesheet.addEventListener("error", () => console.error("Gold word stylesheet failed to load:", stylesheet.href));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
