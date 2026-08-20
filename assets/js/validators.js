import { STRIPE_ALLOWED_PREFIXES } from "./config.js";
import { isSafeHttpUrl } from "./dom-utils.js";

/**
 * A Stripe Payment Link is only trusted if it starts with an approved
 * Stripe domain. Anything else means the "Pay Now" button is skipped.
 * @param {string} url
 */
export function isValidStripeLink(url) {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!isSafeHttpUrl(trimmed)) return false;
  return STRIPE_ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/**
 * Splits a photo_urls cell (pipe- or comma-separated) into a list of
 * verified http(s) image URLs. Anything unsafe or malformed is dropped.
 * @param {string} value
 * @returns {string[]}
 */
export function parsePhotoUrls(value) {
  if (typeof value !== "string" || value.trim() === "") return [];
  return value
    .split(/[|,]/)
    .map((u) => u.trim())
    .filter((u) => u.length > 0 && isSafeHttpUrl(u));
}

const SOLD_PATTERN = /sold/i;
const RESERVED_PATTERN = /reserv|pending|hold|pre-?order/i;
const AVAILABLE_PATTERN = /avail|in stock|ready/i;

/**
 * Normalizes the free-text status/availability column into a consistent
 * { key, label } badge, defaulting to "unknown" rather than guessing.
 * @param {string} value
 */
export function normalizeStatus(value) {
  const text = String(value ?? "").trim();
  if (text === "") return { key: "unknown", label: "Status Unknown" };
  if (SOLD_PATTERN.test(text)) return { key: "sold", label: "Sold" };
  if (RESERVED_PATTERN.test(text)) return { key: "reserved", label: "Reserved" };
  if (AVAILABLE_PATTERN.test(text)) return { key: "available", label: "Available" };
  return { key: "unknown", label: text };
}

/**
 * Formats a price cell for display. Falls back gracefully when the value
 * isn't a plain number, since staff may type "$1,200", "Call for price", etc.
 * @param {string} value
 */
export function formatPrice(value) {
  const text = String(value ?? "").trim();
  if (text === "") return "Price on request";
  const numeric = text.replace(/[$,]/g, "");
  if (/^\d+(\.\d+)?$/.test(numeric)) {
    const amount = Number(numeric);
    return `$${amount.toLocaleString("en-US")}`;
  }
  return text;
}
