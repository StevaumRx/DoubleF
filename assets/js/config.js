// Site-wide configuration. No secrets here — this is a static, client-side site,
// so anything in this file is public. Never add API keys or credentials here.

// Publish each Google Sheet tab as CSV:
// File > Share > Publish to web > select the tab > Comma-separated values (.csv)
// Paste the resulting URL below (it looks like:
// https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv)
export const SHEETS = {
  liveCattle: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6D_mE70CulM_UlP0E7V78mwhil6P17-xZ1YdEUobxAwYyU4MBcDcd7ExQx_BkEYZ_9m8qw7hywZrN/pub?gid=0&single=true&output=csv",
  meatCuts: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6D_mE70CulM_UlP0E7V78mwhil6P17-xZ1YdEUobxAwYyU4MBcDcd7ExQx_BkEYZ_9m8qw7hywZrN/pub?gid=2144461203&single=true&output=csv",
};

// Only Stripe Payment Links starting with one of these prefixes are ever
// rendered as a "Pay Now" button. Anything else is treated as invalid.
export const STRIPE_ALLOWED_PREFIXES = [
  "https://buy.stripe.com",
  "https://checkout.stripe.com",
];

export const CONTACT = {
  phone: "(555) 123-4567",
  phoneHref: "+15551234567",
  email: "info@doublef-ranch.example",
};

// How long fetched sheet data is cached in sessionStorage before re-fetching.
export const CACHE_TTL_MS = 5 * 60 * 1000;
