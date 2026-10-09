# BusinessProLocal.github.io

Public output is built from `BusinessPro_Platform` with the sibling
`build-public.ps1` script into `PUBLIC_SITE`. Edit the source, not the generated
pages. Back up changed source files first and retain the newest three backups.
The build also retains three public-site snapshots and preserves the root
`CNAME` custom-domain file.

Search discovery files live in source `WEBSITE/sitemap.xml` and `WEBSITE/robots.txt`
and are copied to the public root. The sitemap lists only the homepage, signup,
and three customer demo home pages; update each `lastmod` when that page changes,
not merely when rebuilding. Robots allows public content and excludes OWNER,
ADMIN and the gift demo's owner-only Orders URL. Standalone owner/admin sources
and demo Orders have `noindex` metadata; switching a shared demo URL into its
owner dashboard adds `noindex`, and returning to customer content removes it.
OWNER and ADMIN are still not published. Robots/noindex control discovery, not
access permissions. Submit `https://businessprolocal.com/sitemap.xml` in the
verified Search Console property after publication.

Before publishing, run `node --test CUSTOMER/demo-core.test.js` from the source
platform and check phone, tablet and desktop layouts:

- The homepage's supplied gold-bar `View Demos` image link sits centered near
  the bottom of the hero: 36% width (maximum 520px), 80% on phones, with a subtle
  shared gold float/glow hover and no CSS background or border. It scrolls to public
  `See It In Action`: three shop-picture `Try Demo` cards plus a gold
  `Your Business Here` card linking to Get Started. The grid is four across
  at 1024px and above, two across on tablets, and stacked at 600px and below.
  The separate `Plans & Pricing` section contains prices, features and
  Select/signup links only. Both sections work without Get Started, stored leads,
  or JavaScript. Each customer demo has gold pricing links near its top and
  bottom pointing to the homepage's `#plans`.
  Tier cards stack on phones. The section order after My Story is demos,
  Get Started, then pricing; the lead-saving and signup flow is unchanged.
- Gold-colored headings use the shared gold-word image renderer on the homepage,
  signup page, and demo customer pages. Body text, owner-portal typography, and
  advertisement strips are excluded. Real text remains
  accessible/searchable, words wrap only between words, and unsupported
  characters use local Cinzel. The 43 original glyph PNGs live only in
  `WEBSITE/images/gold-letters` in source; the build publishes them and rewrites
  their URL for the public site. Marketing retains the original alphabet sheet.
- Gold buttons, including outlined gold controls and owner-demo buttons, use
  the shared `gold-buttons.js` / `gold-buttons.css` renderer. The blank gold bar
  is applied with nine-slice border-image (60 100 130 100 fill), preserving
  original button content, geometry, event handlers, disabled states, and
  accessible names. Engraved labels use dark-brown Cinzel caps with a warm
  highlight, wrapping/fitting within the unchanged button. Ads and the
  introductory splash are excluded. The hero retains its supplied View Demos
  image. Hover lifts 6px, bobs another 2px on a 2-second loop, and fades in two
  warm gold drop shadows over .3 seconds; reduced motion keeps lift/glow without
  bobbing. Selected calendar days and active owner tabs retain a dark outline.
  The build publishes the shared renderer and `goldbar-blank.png`, rewriting
  the stylesheet image URL for the public directory layout.
- View Demos has a mouse-only magnetic hover within 180px of its resting
  center. Leaving or pulling beyond that radius releases it with a .4s ease;
  the existing float/glow and link remain. Fine-pointer capability and
  no-reduced-motion preference are required; touch events never activate it.
- Ads use centered cover pictures with a dark, gold-edged business-name/Shop now
  strip, a top-left Sponsored pill, a thin silver border and a soft shadow.
  The barber customer page tests Seaside Treasures using its supplied 4:3
  bullet-hole image, without extra card chrome or a second Sponsored tag.
  Above phone width it uses an existing open gap below the hero photo and above
  Services, retaining 4:3 and permitting a smaller image without moving content.
  Contact is centered in its original single column. Northway Auto Care retains
  the right-hand Customer Demo banner position.
  Clicking Seaside still opens its original popup.
  Phones show approximately 2:1 banners, two per row below the shop photo.
  The barber Seaside test instead spans the full phone row at 4:3.
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
  gold border, and a `Customer Demo` entry button. Customer barber photos use
  matching square gold-edged frames and centered cover-cropped uploaded photos.
  The main owner Dashboard follows the real dashboard's order: greeting,
  three statistic cards, Today's Appointments, then Time-Off Requests. Each
  barber has a 48px round saved photo/silhouette beside the name with times below.
  Uploading lives in Employees, not on the main dashboard; saved images remain
  shared with the customer site. One Pending personal-day request for next
  Friday opens the read-only preview popup. The sidebar business name has no
  visible trim; transparent borders preserve its original dimensions.
  `Try Booking Your Customer's Appointment` contains all five booking steps in
  one continuous gold-bordered panel; steps retain accessible fieldset legends
  with thin dividers rather than individual boxes.
- Gift-shop packing specifications appear within orders, not in a separate
  bottom inventory/specifications panel.

Publish the rebuilt public files to this repository; do not publish source
backups, tests, or private owner/admin files.