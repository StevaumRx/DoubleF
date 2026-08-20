# DoubleF Ranch Website

A static site for a cattle ranching business — live cattle and meat/cuts
listings pulled client-side from two Google Sheets, hosted on GitHub Pages.
No build step, no backend, no database.

## Project structure

```
index.html          Home
live-cattle.html     Live Cattle grid
meat-cuts.html        Meat & Cuts grid
listing.html          Shared listing detail template (?type=cattle|meat&id=N)
about.html
contact.html
404.html
assets/css/style.css
assets/js/
  config.js            Sheet URLs, Stripe allowlist, contact info
  csv-parser.js        Dependency-free CSV parser
  validators.js         Stripe link check, photo URL check, status/price formatting
  dom-utils.js           Safe element creation (textContent, never innerHTML)
  data-service.js        Fetch + parse + cache + normalize each sheet
  cards.js               Shared listing card renderer
  page-*.js               Per-page bootstrap scripts
  common.js               Footer year, mobile nav close (non-module)
assets/img/            Placeholder SVGs (logo, cattle, meat, hero)
```

## Connecting the Google Sheets

1. Create a Google Sheet with two tabs: one for Live Cattle, one for Meat &
   Cuts.
2. **Live Cattle** columns (exact header names, any case/spacing):
   `title, type, breed, age, weight, size, price, status, available_date, description, photo_urls, stripe_link`
3. **Meat & Cuts** columns:
   `product_name, cut_type, source_animal, est_weight, price, availability, ready_date, description, photo_urls, stripe_link`
4. For `photo_urls`, put one or more image URLs in the cell separated by a
   `|` or `,` (e.g. `https://example.com/a.jpg|https://example.com/b.jpg`).
5. For `stripe_link`, paste a Stripe **Payment Link** URL. It's only shown
   as a "Pay Now" button if it starts with `https://buy.stripe.com` or
   `https://checkout.stripe.com` — anything else is silently skipped.
6. In each tab: **File → Share → Publish to web**, select that specific
   sheet/tab, choose **Comma-separated values (.csv)**, and publish.
7. Copy the published URL into `assets/js/config.js`:
   ```js
   export const SHEETS = {
     liveCattle: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv",
     meatCuts: "https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv",
   };
   ```

The sheet must stay **published to the web** for the site to read it — this
is a public, read-only CSV feed, so don't put anything in these sheets you
don't want visible to site visitors.

## Local development

Because pages fetch the CSV via `fetch()` and use ES modules, they need to
be served over HTTP — opening the HTML files directly via `file://` will
fail due to browser CORS/module restrictions. From the project root:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

Push this repo to GitHub and enable Pages (Settings → Pages → Deploy from
branch → `main` → `/root`). No build step is required.

## Security notes

- Spreadsheet-sourced text is always rendered via `textContent`
  (`assets/js/dom-utils.js`'s `el()` helper), never `innerHTML` — a staff
  member typing HTML/script into a cell can't inject anything.
- Image and Stripe URLs from the sheet are validated before use
  (`assets/js/validators.js`): only `http(s)` protocols for photos, and only
  the two Stripe domains for the Pay Now button.
- There are no API keys or credentials anywhere in this project — the
  Google Sheets are read via their public published-CSV URL, and the
  contact form falls back to opening the visitor's email client (`mailto:`)
  since there's no backend to submit to.
