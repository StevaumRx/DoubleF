import { SHEETS, CACHE_TTL_MS } from "./config.js";
import { parseCSV, rowsToObjects } from "./csv-parser.js";
import { parsePhotoUrls, normalizeStatus } from "./validators.js";

// In-memory fallback in case sessionStorage is unavailable (e.g. private
// browsing in some browsers throws on access).
const memoryCache = new Map();

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  }
}

function writeCache(key, data) {
  const entry = { timestamp: Date.now(), data };
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    memoryCache.set(key, entry);
  }
}

function isConfigured(url) {
  return typeof url === "string" && url.trim() !== "" && !url.includes("PASTE_");
}

async function fetchRawRows(url, cacheKey) {
  if (!isConfigured(url)) {
    const err = new Error("Sheet URL is not configured.");
    err.code = "CONFIG_MISSING";
    throw err;
  }

  const cached = readCache(cacheKey);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    const err = new Error("Network request failed.");
    err.code = "FETCH_FAILED";
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`Sheet fetch failed with status ${response.status}.`);
    err.code = "FETCH_FAILED";
    throw err;
  }

  const text = await response.text();
  const rows = rowsToObjects(parseCSV(text));
  writeCache(cacheKey, rows);
  return rows;
}

function normalizeLiveCattleRow(raw, index) {
  return {
    id: index,
    type: "cattle",
    title: raw.title || "Unlisted Animal",
    animalType: raw.type || "",
    breed: raw.breed || "",
    age: raw.age || "",
    weight: raw.weight || "",
    size: raw.size || "",
    priceRaw: raw.price || "",
    status: normalizeStatus(raw.status),
    availableDate: raw.available_date || "",
    description: raw.description || "",
    photos: parsePhotoUrls(raw.photo_urls),
    stripeLink: (raw.stripe_link || "").trim(),
  };
}

function normalizeMeatCutRow(raw, index) {
  return {
    id: index,
    type: "meat",
    title: raw.product_name || "Unlisted Product",
    cutType: raw.cut_type || "",
    sourceAnimal: raw.source_animal || "",
    estWeight: raw.est_weight || "",
    priceRaw: raw.price || "",
    status: normalizeStatus(raw.availability),
    readyDate: raw.ready_date || "",
    description: raw.description || "",
    photos: parsePhotoUrls(raw.photo_urls),
    stripeLink: (raw.stripe_link || "").trim(),
  };
}

export async function getLiveCattle() {
  const rows = await fetchRawRows(SHEETS.liveCattle, "doublef:live-cattle");
  return rows.map(normalizeLiveCattleRow);
}

export async function getMeatCuts() {
  const rows = await fetchRawRows(SHEETS.meatCuts, "doublef:meat-cuts");
  return rows.map(normalizeMeatCutRow);
}

export async function getListingById(type, id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) return undefined;
  const items = type === "cattle" ? await getLiveCattle() : await getMeatCuts();
  return items.find((item) => item.id === numericId);
}

/**
 * Maps a caught error to a friendly, non-technical message for display.
 * @param {any} err
 */
export function friendlyErrorMessage(err) {
  if (err && err.code === "CONFIG_MISSING") {
    return "Listings aren't connected yet. Add your Google Sheet CSV links in assets/js/config.js.";
  }
  return "We couldn't load listings right now. Please try again in a moment.";
}
