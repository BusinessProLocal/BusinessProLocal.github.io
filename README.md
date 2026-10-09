# BusinessProLocal.github.io

Public output is built from `BusinessPro_Platform` with the sibling
`build-public.ps1` script into `PUBLIC_SITE`. Edit the source, not the generated
pages. Back up changed source files first and retain the newest three backups.
The build also retains three public-site snapshots and preserves the root
`CNAME` custom-domain file.

Before publishing, run `node --test CUSTOMER/demo-core.test.js` from the source
platform and check phone and desktop layouts:

- Phone ads are two short banners per row below the main shop photo; desktop
  photo-ad rails are unchanged.
- The service agreement scroll box is 250px on phones and 350px on desktop.
  Acceptance stays disabled until the bottom is reached; agreement wording is
  unchanged.
- The barber customer demo has a gold explanatory banner, a continuous outer
  gold border, and a `Customer Demo` entry button.
- Gift-shop packing specifications appear within orders, not in a separate
  bottom inventory/specifications panel.

Publish the rebuilt public files to this repository; do not publish source
backups, tests, or private owner/admin files.