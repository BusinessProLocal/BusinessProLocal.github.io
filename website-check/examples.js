/* 11/20 (Tom + Claude): "See example" pop-ups for the Free Website Check.
   Each check shows WITHOUT vs WITH as a quick picture, on a phone and/or a computer.
   Made-up business names only. Add a check's example when its Tom definition is finished. */
(function () {
  var BIZ = "Your Business";
  var phone = function (inner) { return '<div class="mx-phone"><div class="mx-notch"></div><div class="mx-screen">' + inner + '</div></div>'; };
  var pc = function (tabs, address, inner, secure) {
    return '<div class="mx-pc"><div class="mx-tabs">' + tabs + '</div><div class="mx-bar">' +
      (secure === false ? '<span class="mx-warn">⚠ Not secure</span>' : secure === true ? '<span class="mx-lock">🔒</span>' : "") +
      '<span class="mx-url">' + address + '</span></div><div class="mx-page">' + inner + '</div></div>';
  };
  var tab = function (icon, text, on) { return '<span class="mx-tab' + (on ? " on" : "") + '">' + icon + '<span>' + text + '</span></span>'; };
  var globe = '<span class="mx-ico mx-globe">🌐</span>';
  var mark = '<span class="mx-ico mx-logo">YB</span>';
  var search = function (q) { return '<div class="mx-search">' + q + '</div>'; };
  var result = function (ico, name, url, title, desc, extra, hl) {
    return '<div class="mx-res' + (hl ? " " + hl : "") + '"><div class="mx-site">' + ico + '<div><b>' + name + '</b><small>' + url + '</small></div></div>' +
      '<div class="mx-title">' + title + '</div>' + (desc ? '<div class="mx-desc">' + desc + '</div>' : "") + (extra || "") + '</div>';
  };
  var comp = function (letter, color) { return '<span class="mx-ico" style="background:' + color + ';color:#fff">' + letter + '</span>'; };
  var COMP = result(comp("C", "#1565c0"), "Competitor Roofing", "competitorroofing.com", "Roofing &amp; Gutters | Competitor Roofing", "Free estimates on new roofs and repairs.");

  var EX = {
    pages: { label: "Example", views: { "Example": {
      without: phone(search("cedar shake roofing near me") + result(comp("C", "#1565c0"), "Competitor Roofing", "competitorroofing.com/cedar-shake", "Cedar Shake Roofing | Competitor Roofing", "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-bad") + '<div class="mx-note">Your business has no cedar shake page, so the competitor\'s page shows first.</div>'),
      with: phone(search("cedar shake roofing near me") + result(mark, BIZ, "yourbusiness.com/cedar-shake", "Cedar Shake Roofing | " + BIZ, "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-good") + COMP)
    } } },
    call: { views: { "Phone example": {
      without: phone('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-plain">Call us: 207-555-0123</div></div><div class="mx-note">Tapping the number does nothing. They have to write it down.</div>'),
      with: phone('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-btn">📞 Tap to Call</div></div><div class="mx-calling">Calling ' + BIZ + '…</div>')
    } } },
    phone: { views: { "Phone example": {
      without: phone('<div class="mx-tiny"><div class="mx-tiny-head">' + BIZ + ' — Home | About | Services | Gallery | Contact</div><p>Welcome to our website. We have been proudly serving our customers for many years with quality work and fair prices. Call today for your free estimate on any job big or small.</p><div class="mx-tiny-cols"><span></span><span></span><span></span></div></div><div class="mx-note">Tiny computer page squeezed onto a phone. Pinch and zoom to read it.</div>'),
      with: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Quality work, fair prices.</p><div class="mx-btn">Get a Free Estimate</div><div class="mx-btn ghost">📞 Tap to Call</div></div>')
    } } },
    secure: { views: {
      "Computer example": {
        without: pc(tab(mark, BIZ, true), "yourbusiness.com", '<div class="mx-pghead">' + BIZ + '</div>', false),
        with: pc(tab(mark, BIZ, true), "yourbusiness.com", '<div class="mx-pghead">' + BIZ + '</div>', true)
      },
      "Phone example": {
        without: phone('<div class="mx-addr"><span class="mx-warn">⚠ Not secure</span> yourbusiness.com</div><div class="mx-hero"><b>' + BIZ + '</b></div>'),
        with: phone('<div class="mx-addr"><span class="mx-lock">🔒</span> yourbusiness.com</div><div class="mx-hero"><b>' + BIZ + '</b></div>')
      }
    } },
    fresh: { views: { "Example": {
      without: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Roofing &amp; siding</p></div><div class="mx-foot bad">© 2018 ' + BIZ + '</div><div class="mx-note">"2018? Are they still in business?"</div>'),
      with: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Roofing &amp; siding</p></div><div class="mx-foot">© ' + new Date().getFullYear() + ' ' + BIZ + '</div>')
    } } },
    google: { views: { "Phone example": {
      without: phone(search(BIZ) + result(globe, BIZ, "yourbusiness.com", BIZ, "Welcome to our website. Home | About | Services | Contact", "", "hl-bad")),
      with: phone(search(BIZ) + result(mark, BIZ, "yourbusiness.com", BIZ + " | Roofers in York, Maine", "Roof repair and replacement. Free estimates.", '<div class="mx-rich"><span>📍 York, ME</span><span>🕒 Open · Closes 5 PM</span><span>📞 (207) 555-0123</span></div>', "hl-good") + '<div class="mx-note good">Google can show details like these when it can read them.</div>')
    } } },
    title: { views: { "Phone example": {
      without: phone(search("roofer near me") + result(globe, "yourbusiness.com", "yourbusiness.com", "Home", "", "", "hl-bad") + COMP),
      with: phone(search("roofer near me") + result(mark, BIZ, "yourbusiness.com", BIZ + " | Roofers in York, Maine", "", "", "hl-good") + COMP)
    } } },
    description: { views: { "Phone example": {
      without: phone(search("roofer near me") + result(mark, BIZ, "yourbusiness.com", BIZ + " | Roofing", "Home | About | Services | Gallery | Contact | Copyright 2018 | Privacy", "", "hl-bad") + '<div class="mx-note">Google grabbed menu words off the page.</div>'),
      with: phone(search("roofer near me") + result(mark, BIZ, "yourbusiness.com", BIZ + " | Roofing", "Roof repair, new roofs and siding across Maine. Free estimates, fully insured. Call or book online today.", "", "hl-good"))
    } } },
    share: { views: { "Phone example": {
      without: phone('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-bubble me">yourbusiness.com</div></div><div class="mx-note">Just a plain link. Easy to scroll past.</div>'),
      with: phone('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-card"><div class="mx-photo">Your best job photo</div><small>YOURBUSINESS.COM</small><b>' + BIZ + ' | Roofers in York, Maine</b></div></div>')
    } } },
    photos: { views: { "Phone example": {
      without: phone(search("cedar shingles") + '<div class="mx-imgs"><span style="background:#8d6e63"></span><span style="background:#a1887f"></span><span style="background:#6d4c41"></span><span style="background:#bcaaa4"></span><span style="background:#795548"></span><span style="background:#8d6e63"></span></div><div class="mx-note">Image results: none of your photos show up. Google can\'t tell what they are.</div>'),
      with: phone(search("cedar shingles") + '<div class="mx-imgs"><span class="yours">Your photo<small>yourbusiness.com</small></span><span style="background:#a1887f"></span><span style="background:#6d4c41"></span><span style="background:#bcaaa4"></span><span style="background:#795548"></span><span style="background:#8d6e63"></span></div><div class="mx-note good">Labeled "new cedar shake roof in York, Maine," so Google shows it.</div>')
    } } },
    icon: { views: {
      "Phone example": {
        without: phone(search("roofer near me") + result(globe, BIZ, "yourbusiness.com", BIZ + " | Roofing", "", "", "hl-bad") + COMP),
        with: phone(search("roofer near me") + result(mark, BIZ, "yourbusiness.com", BIZ + " | Roofing", "", "", "hl-good") + COMP)
      },
      "Computer example": {
        without: pc(tab(globe, BIZ, true) + tab(comp("C", "#1565c0"), "Competitor", false) + tab(globe, "Home", false), "yourbusiness.com", '<div class="mx-pghead">' + BIZ + '</div>'),
        with: pc(tab(mark, BIZ, true) + tab(comp("C", "#1565c0"), "Competitor", false) + tab(globe, "Home", false), "yourbusiness.com", '<div class="mx-pghead">' + BIZ + '</div>')
      }
    } }
  };

  function open(id, view) {
    var ex = EX[id]; if (!ex) return;
    var v = ex.views[view]; if (!v) return;
    var box = document.getElementById("mx-modal");
    if (!box) {
      box = document.createElement("div"); box.id = "mx-modal"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
      document.body.appendChild(box);
      box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".mx-close")) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
    box.innerHTML = '<div class="mx-card-wrap"><button class="mx-close" type="button" aria-label="Close">✕</button>' +
      '<p class="mx-head">' + view + '</p><div class="mx-grid">' +
      '<div><p class="mx-tag bad">✗ Without</p>' + v.without + '</div>' +
      '<div><p class="mx-tag good">✓ With</p>' + v.with + '</div></div>' +
      '<button class="mx-done" type="button" onclick="document.getElementById(\'mx-modal\').classList.remove(\'show\')">Got it</button></div>';
    box.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function close() { var box = document.getElementById("mx-modal"); if (box) box.classList.remove("show"); document.body.style.overflow = ""; }

  window.WebsiteCheckExamples = {
    buttons: function (id) {
      var ex = EX[id]; if (!ex) return "";
      return '<span class="mx-links">' + Object.keys(ex.views).map(function (v) {
        return '<button type="button" class="mx-link" data-ex="' + id + '" data-view="' + v + '">👁 ' + (v === "Example" ? "See example" : v) + '</button>';
      }).join("") + '</span>';
    },
    ids: function () { return Object.keys(EX); }
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mx-link");
    if (b) { open(b.getAttribute("data-ex"), b.getAttribute("data-view")); }
    if (e.target.classList && e.target.classList.contains("mx-done")) close();
  });
})();
