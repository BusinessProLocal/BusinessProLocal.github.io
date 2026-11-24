// 11/23 (Tom): ☰ on every site — businessprolocal.com too. The nav links stay showing;
// ☰ (top-left of the nav bar) opens every page as a drop-down list.
(function () {
  "use strict";
  const nav = document.querySelector("nav.site-nav");
  if (!nav || nav.querySelector(".site-burger")) return;
  const burger = document.createElement("button");
  burger.type = "button";
  burger.className = "site-burger";
  burger.setAttribute("aria-label", "Menu");
  burger.setAttribute("aria-expanded", "false");
  burger.textContent = "☰";
  const panel = document.createElement("div");
  panel.className = "site-burger-panel";
  panel.hidden = true;
  const home = nav.querySelector(".nav-brand");
  const links = [...(home ? [{ href: home.getAttribute("href"), text: "Home" }] : []),
    ...[...nav.querySelectorAll(".nav-side a")].map(link => ({ href: link.getAttribute("href"), text: link.textContent.trim() }))];
  // every page's menu ends with the Free Website Check
  const root = home ? home.getAttribute("href").replace(/\/?$/, "/").replace(/^\.\/$/, "") : "";
  if (!links.some(link => /website-check/.test(link.href))) links.push({ href: `${root}website-check/`, text: "Free Website Check" });
  links.forEach(link => {
    const item = document.createElement("a");
    item.href = link.href;
    item.textContent = link.text;
    panel.appendChild(item);
  });
  nav.append(burger, panel);
  const close = () => { panel.hidden = true; burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", event => {
    event.stopPropagation();
    panel.hidden = !panel.hidden;
    burger.setAttribute("aria-expanded", String(!panel.hidden));
  });
  document.addEventListener("click", event => { if (!panel.hidden && !panel.contains(event.target)) close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
})();
