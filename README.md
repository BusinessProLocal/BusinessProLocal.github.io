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
  `See It In Action`: three shop-picture `Try Demo` cards plus a gold
  `Your Business Here` card linking to Get Started. The grid is four across
  at 1024px and above, two across on tablets, and stacked at 600px and below.
  The separate `Plans & Pricing` section below contains prices, features and
  Select/signup links only. Both sections work without Get Started, stored leads,
  or JavaScript. Each customer demo has gold pricing links near its top and
  bottom pointing to the homepage's `#plans`; owner portals stay unchanged.
  Tier cards stack on phones. Get Started remains
  in its original location and keeps its lead-saving and signup flow.
- Ads use centered cover pictures with a dark, gold-edged business-name/Shop now
  strip, a top-left Sponsored pill, a thin silver border and a soft shadow.
  Barber ads at 1024px and above mirror Seaside Treasures and Northway Auto Care
  on the left/right of Customer Demo with equal size and vertical alignment.
  Phones show approximately 2:1 banners, two per row below the shop photo.
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