# BusinessProLocal.github.io

Public output is built from `BusinessPro_Platform` with the sibling
`build-public.ps1` script into `PUBLIC_SITE`. Edit the source, not the generated
pages. Back up changed source files first and retain the newest three backups.
The build also retains three public-site snapshots and preserves the root
`CNAME` custom-domain file.

Before publishing, run `node --test CUSTOMER/demo-core.test.js` from the source
platform and check phone, tablet and desktop layouts:

- The homepage's gold `View Demos` button sits near the bottom of the hero
  picture, away from the man. On phones the photo is left-aligned and the button
  fills the available width with equal side margins. It scrolls to public
  `Plans & demos`: all three prices and `Try Demo` links work without Get Started,
  stored leads, or JavaScript. Tier cards stack on phones. Get Started remains
  in its original location and keeps its lead-saving and signup flow.
- Ads use centered cover pictures with a dark, gold-edged business-name/Shop now
  strip. Phones show approximately 2:1 banners, two per row below the shop photo.
  Desktop/tablet side rails are removed. A single eligible-ad pool is distributed
  one at a time into measured open rectangles beside the hero text/button,
  menu, cards (including empty row ends), booking/checkout forms, contact details,
  and short section headings. Each spot sets its own width and height; no
  above-phone blocks or banner-row fallback is used. Text ranges and full
  card/form/photo rectangles protect real content, and adjacent ads are separated.
  Resize, image/font loading and form-height changes recalculate placements;
  owner portals stay ad-free. Check 1024, 1280, 1366 and 1440px before publishing.
- The service agreement scroll box is 250px on phones and 350px on desktop.
  Acceptance stays disabled until the bottom is reached; agreement wording is
  unchanged.
- The barber customer demo has a gold explanatory banner, a continuous outer
  gold border, and a `Customer Demo` entry button.
- Gift-shop packing specifications appear within orders, not in a separate
  bottom inventory/specifications panel.

Publish the rebuilt public files to this repository; do not publish source
backups, tests, or private owner/admin files.