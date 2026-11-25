/* 11/20 (Tom + Claude): "See example" pop-ups for the Free Website Check.
   Each check shows WITHOUT vs WITH as a quick picture, on a phone AND a computer (11/24: both, always).
   Made-up business names only. Add a check's example when its Tom definition is finished. */
(function () {
  var BRAND = { name: "", logo: "", host: "" };
  function escx(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function build() {
  // their real name, web address and logo when the checker found them; otherwise "Your Business"
  var BIZ = escx(BRAND.name || "Your Business");
  var HOST = escx(BRAND.host || "yourbusiness.com");
  var initial = escx((BRAND.name || "Y").trim().charAt(0).toUpperCase() || "Y");
  var mark = BRAND.logo
    ? '<span class="mx-ico mx-logo mx-img"><img src="' + escx(BRAND.logo) + '" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove(\'mx-img\');this.parentNode.textContent=\'' + initial + '\'"></span>'
    : '<span class="mx-ico mx-logo">' + initial + '</span>';
  var phone = function (inner) { return '<div class="mx-phone"><div class="mx-notch"></div><div class="mx-screen">' + inner + '</div></div>'; };
  var pc = function (tabs, address, inner, secure) {
    return '<div class="mx-pc"><div class="mx-tabs">' + tabs + '</div><div class="mx-bar">' +
      (secure === false ? '<span class="mx-warn">⚠ Not secure</span>' : secure === true ? '<span class="mx-lock">🔒</span>' : "") +
      '<span class="mx-url">' + address + '</span></div><div class="mx-page">' + inner + '</div></div>';
  };
  var tab = function (icon, text, on) { return '<span class="mx-tab' + (on ? " on" : "") + '">' + icon + '<span>' + text + '</span></span>'; };
  var globe = '<span class="mx-ico mx-globe">🌐</span>';
  var zoom = function (icon, good) { return '<div class="mx-zoom ' + (good ? "good" : "bad") + '"><span>🔍 Up close</span>' + icon + '</div>'; };
  var search = function (q) { return '<div class="mx-search">' + q + '</div>'; };
  var result = function (ico, name, url, title, desc, extra, hl) {
    return '<div class="mx-res' + (hl ? " " + hl : "") + '"><div class="mx-site">' + ico + '<div><b>' + name + '</b><small>' + url + '</small></div></div>' +
      '<div class="mx-title">' + title + '</div>' + (desc ? '<div class="mx-desc">' + desc + '</div>' : "") + (extra || "") + '</div>';
  };
  var comp = function (letter, color) { return '<span class="mx-ico" style="background:' + color + ';color:#fff">' + letter + '</span>'; };
  var COMP = result(comp("C", "#1565c0"), "Competitor Roofing", "competitorroofing.com", "Roofing &amp; Gutters | Competitor Roofing", "Free estimates on new roofs and repairs.");

  // a Google search page on a computer
  var gpc = function (q, inner) { return pc(tab('<span class="mx-ico">G</span>', q + " - Google Search", true), "google.com/search?q=" + q.replace(/ /g, "+"), '<div class="mx-pgbody">' + search(q) + inner + '</div>'); };
  var page = function (inner) { return '<div class="mx-pgbody">' + inner + '</div>'; };
  var IMGS = '<span style="background:#a1887f"></span><span style="background:#6d4c41"></span><span style="background:#bcaaa4"></span><span style="background:#795548"></span><span style="background:#8d6e63"></span>';

  // 11/24 (Tom): every check gets BOTH a Phone example and a Computer example, phone first
  return {
    pages: { views: {
      "Phone example": {
        without: phone(search("cedar shake roofing near me") + result(comp("C", "#1565c0"), "Competitor Roofing", "competitorroofing.com/cedar-shake", "Cedar Shake Roofing | Competitor Roofing", "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-bad") + '<div class="mx-note">Your business has no cedar shake page, so the competitor\'s page shows first.</div>'),
        with: phone(search("cedar shake roofing near me") + result(mark, BIZ, HOST + "/cedar-shake", "Cedar Shake Roofing | " + BIZ, "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-good") + COMP)
      },
      "Computer example": {
        without: gpc("cedar shake roofing near me", result(comp("C", "#1565c0"), "Competitor Roofing", "competitorroofing.com/cedar-shake", "Cedar Shake Roofing | Competitor Roofing", "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-bad")) + '<div class="mx-note">No cedar shake page, so the competitor shows first.</div>',
        with: gpc("cedar shake roofing near me", result(mark, BIZ, HOST + "/cedar-shake", "Cedar Shake Roofing | " + BIZ, "Cedar shake roofs installed and repaired. Free estimates.", "", "hl-good") + COMP)
      }
    } },
    call: { views: {
      "Phone example": {
        without: phone('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-plain">Call us: (207) 555-0123</div></div><div class="mx-note">Tapping the number does nothing. They have to write it down.</div>'),
        with: phone('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-btn">📞 Tap to Call</div></div><div class="mx-calling">Calling ' + BIZ + '…</div>')
      },
      "Computer example": {
        without: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-plain">Call us: (207) 555-0123</div></div>')) + '<div class="mx-note">Clicking the number does nothing. They have to grab their phone and dial it.</div>',
        with: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-hero"><b>' + BIZ + '</b><div class="mx-btn">📞 (207) 555-0123</div></div><div class="mx-calling">Opening your phone app to call…</div>')) + '<div class="mx-note good">One click opens their phone app (like Phone Link) to call you.</div>'
      }
    } },
    phone: { views: {
      "Phone example": {
        without: phone('<div class="mx-tiny"><div class="mx-tiny-head">' + BIZ + ' — Home | About | Services | Gallery | Contact</div><p>Welcome to our website. We have been proudly serving our customers for many years with quality work and fair prices. Call today for your free estimate on any job big or small.</p><div class="mx-tiny-cols"><span></span><span></span><span></span></div></div><div class="mx-note">Tiny computer page squeezed onto a phone. Pinch and zoom to read it.</div>'),
        with: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Quality work, fair prices.</p><div class="mx-btn">Get a Free Estimate</div><div class="mx-btn ghost">📞 Tap to Call</div></div>')
      },
      "Computer example": {
        without: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-pghead">' + BIZ + '</div><p class="mx-pgp">Quality work, fair prices.</p>')) + '<div class="mx-note">Looks fine on a computer, so owners never notice. Most customers are on phones, though.</div>',
        with: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-pghead">' + BIZ + '</div><p class="mx-pgp">Quality work, fair prices.</p>')) + '<div class="mx-note good">Still looks great on a computer, and now it fits phones too.</div>'
      }
    } },
    secure: { views: {
      "Phone example": {
        without: phone('<div class="mx-addr"><span class="mx-warn">⚠ Not secure</span> ' + HOST + '</div><div class="mx-hero"><b>' + BIZ + '</b></div>'),
        with: phone('<div class="mx-addr"><span class="mx-lock">🔒</span> ' + HOST + '</div><div class="mx-hero"><b>' + BIZ + '</b></div>')
      },
      "Computer example": {
        without: pc(tab(mark, BIZ, true), HOST, '<div class="mx-pghead">' + BIZ + '</div>', false),
        with: pc(tab(mark, BIZ, true), HOST, '<div class="mx-pghead">' + BIZ + '</div>', true)
      }
    } },
    fresh: { views: {
      "Phone example": {
        without: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Roofing &amp; siding</p></div><div class="mx-foot bad">© 2018 ' + BIZ + '</div><div class="mx-note">"2018? Are they still in business?"</div>'),
        with: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>Roofing &amp; siding</p></div><div class="mx-foot">© ' + new Date().getFullYear() + ' ' + BIZ + '</div>')
      },
      "Computer example": {
        without: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-pghead">' + BIZ + '</div><div class="mx-foot bad">© 2018 ' + BIZ + '</div>')) + '<div class="mx-note">"2018? Are they still in business?"</div>',
        with: pc(tab(mark, BIZ, true), HOST, page('<div class="mx-pghead">' + BIZ + '</div><div class="mx-foot">© ' + new Date().getFullYear() + ' ' + BIZ + '</div>'))
      }
    } },
    google: { views: {
      "Phone example": {
        without: phone(search(BIZ) + result(globe, BIZ, HOST, BIZ, "Welcome to our website. Home | About | Services | Contact", "", "hl-bad")),
        with: phone(search(BIZ) + result(mark, BIZ, HOST, BIZ + " | Free Estimates", "Roof repair and replacement. Free estimates.", '<div class="mx-rich"><span>📍 Your address</span><span>🕒 Open · Closes 5 PM</span><span>📞 Tap to call</span></div>', "hl-good") + '<div class="mx-note good">Google can show details like these when it can read them.</div>')
      },
      "Computer example": {
        without: gpc(BIZ, result(globe, BIZ, HOST, BIZ, "Welcome to our website. Home | About | Services | Contact", "", "hl-bad")),
        with: gpc(BIZ, result(mark, BIZ, HOST, BIZ + " | Free Estimates", "Roof repair and replacement. Free estimates.", '<div class="mx-rich"><span>📍 Your address</span><span>🕒 Open · Closes 5 PM</span><span>📞 Call</span></div>', "hl-good")) + '<div class="mx-note good">Google can show details like these when it can read them.</div>'
      }
    } },
    title: { views: {
      "Phone example": {
        without: phone(search("roofer near me") + result(globe, HOST, HOST, "Home", "", "", "hl-bad") + COMP),
        with: phone(search("roofer near me") + result(mark, BIZ, HOST, BIZ + " | Free Estimates", "", "", "hl-good") + COMP)
      },
      "Computer example": {
        without: gpc("roofer near me", result(globe, HOST, HOST, "Home", "", "", "hl-bad") + COMP) + '<div class="mx-note">"Home" tells searchers nothing about you.</div>',
        with: gpc("roofer near me", result(mark, BIZ, HOST, BIZ + " | Free Estimates", "", "", "hl-good") + COMP)
      }
    } },
    description: { views: {
      "Phone example": {
        without: phone(search("roofer near me") + result(mark, BIZ, HOST, BIZ + " | Roofing", "Home | About | Services | Gallery | Contact | Copyright 2018 | Privacy", "", "hl-bad") + '<div class="mx-note">Google grabbed menu words off the page.</div>'),
        with: phone(search("roofer near me") + result(mark, BIZ, HOST, BIZ + " | Roofing", "Roof repair, new roofs and siding across Maine. Free estimates, fully insured. Call or book online today.", "", "hl-good"))
      },
      "Computer example": {
        without: gpc("roofer near me", result(mark, BIZ, HOST, BIZ + " | Roofing", "Home | About | Services | Gallery | Contact | Copyright 2018 | Privacy", "", "hl-bad")) + '<div class="mx-note">Google grabbed menu words off the page.</div>',
        with: gpc("roofer near me", result(mark, BIZ, HOST, BIZ + " | Roofing", "Roof repair, new roofs and siding across Maine. Free estimates, fully insured. Call or book online today.", "", "hl-good"))
      }
    } },
    share: { views: {
      "Phone example": {
        without: phone('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-bubble me">' + HOST + '</div></div><div class="mx-note">Just a plain link. Easy to scroll past.</div>'),
        with: phone('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-card"><div class="mx-photo">Your best job photo</div><small>' + HOST.toUpperCase() + '</small><b>' + BIZ + ' | Free Estimates</b></div></div>')
      },
      "Computer example": {
        without: pc(tab('<span class="mx-ico">f</span>', "Facebook", true), "facebook.com", page('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-bubble me">' + HOST + '</div></div>')) + '<div class="mx-note">Just a plain link. Easy to scroll past.</div>',
        with: pc(tab('<span class="mx-ico">f</span>', "Facebook", true), "facebook.com", page('<div class="mx-chat"><div class="mx-bubble">Who did your roof?</div><div class="mx-card"><div class="mx-photo">Your best job photo</div><small>' + HOST.toUpperCase() + '</small><b>' + BIZ + ' | Free Estimates</b></div></div>'))
      }
    } },
    photos: { views: {
      "Phone example": {
        without: phone(search("cedar shingles") + '<div class="mx-imgs"><span style="background:#8d6e63"></span>' + IMGS + '</div><div class="mx-note">Image results: none of your photos show up. Google can\'t tell what they are.</div>'),
        with: phone(search("cedar shingles") + '<div class="mx-imgs"><span class="yours">Your photo<small>' + HOST + '</small></span>' + IMGS + '</div><div class="mx-note good">Labeled "new cedar shake roof in York, Maine," so Google shows it.</div>')
      },
      "Computer example": {
        without: gpc("cedar shingles", '<div class="mx-imgs"><span style="background:#8d6e63"></span>' + IMGS + '</div>') + '<div class="mx-note">None of your photos show up. Google can\'t tell what they are.</div>',
        with: gpc("cedar shingles", '<div class="mx-imgs"><span class="yours">Your photo<small>' + HOST + '</small></span>' + IMGS + '</div>') + '<div class="mx-note good">Labeled "new cedar shake roof in York, Maine," so Google shows it.</div>'
      }
    } },
    // 11/24 (Tom): H1 = the big headline at the very top — business name + what you do, in words Google can read
    headline: { views: {
      "Phone example": {
        without: phone('<div class="mx-hero">' + mark + '<p>Welcome!</p></div><div class="mx-note">Just a logo picture and "Welcome!" Google reads no headline, so it can\'t tell what you do.</div>'),
        with: phone('<div class="mx-hero"><b>' + BIZ + '</b><p>What you do, in your town, Maine</p></div><div class="mx-note good">Google reads: "' + BIZ + ', what you do, in your town."</div>')
      },
      "Computer example": {
        without: pc(tab(mark, BIZ, true), HOST, '<div class="mx-hero">' + mark + '<p>Welcome!</p></div>') + '<div class="mx-note">The top is just a logo picture and "Welcome!" Google reads no headline, so it can\'t tell what you do.</div>',
        with: pc(tab(mark, BIZ, true), HOST, '<div class="mx-hero"><b>' + BIZ + '</b><p>What you do, in your town, Maine</p></div>') + '<div class="mx-note good">Google reads: "' + BIZ + ', what you do, in your town." Now it knows who to show you to.</div>'
      }
    } },
    icon: { views: {
      "Phone example": {
        without: phone(search("roofer near me") + result(globe, BIZ, HOST, BIZ + " | Roofing", "", "", "hl-bad") + COMP) + zoom(globe, false),
        with: phone(search("roofer near me") + result(mark, BIZ, HOST, BIZ + " | Roofing", "", "", "hl-good") + COMP) + zoom(mark, true)
      },
      "Computer example": {
        without: pc(tab(globe, BIZ, true) + tab(comp("C", "#1565c0"), "Competitor", false) + tab(globe, "Home", false), HOST, '<div class="mx-pghead">' + BIZ + '</div>') + zoom(globe, false),
        with: pc(tab(mark, BIZ, true) + tab(comp("C", "#1565c0"), "Competitor", false) + tab(globe, "Home", false), HOST, '<div class="mx-pghead">' + BIZ + '</div>') + zoom(mark, true)
      }
    } }
  };
  }

  function open(id, view) {
    var EX = build(); var ex = EX[id]; if (!ex) return;
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
    setBrand: function (brand) { BRAND = brand && typeof brand === "object" ? brand : { name: "", logo: "", host: "" }; },
    buttons: function (id) {
      var ex = build()[id]; if (!ex) return "";
      var views = Object.keys(ex.views);
      return '<span class="mx-links">' + views.map(function (v) {
        return '<button type="button" class="mx-link" data-ex="' + id + '" data-view="' + v + '">👁 ' + (views.length === 1 ? "See example" : v) + '</button>';
      }).join("") + '</span>';
    },
    ids: function () { return Object.keys(build()); }
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".mx-link");
    if (b) { open(b.getAttribute("data-ex"), b.getAttribute("data-view")); }
    if (e.target.classList && e.target.classList.contains("mx-done")) close();
  });
})();
