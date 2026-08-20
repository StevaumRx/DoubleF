// Minimal, dependency-free RFC4180-style CSV parser.
// Handles quoted fields, commas/newlines inside quotes, escaped "" quotes,
// \r\n or \n line endings, and ragged/empty rows without throwing.

/**
 * @param {string} text raw CSV text
 * @returns {string[][]} array of rows, each row an array of cell strings
 */
export function parseCSV(text) {
  const rows = [];
  if (typeof text !== "string" || text.length === 0) return rows;

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush the final field/row (files don't always end with a newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Converts parsed CSV rows into objects keyed by the header row.
 * - Header keys are trimmed, lowercased, and spaces become underscores.
 * - Rows that are entirely empty are skipped.
 * - Short rows are padded with "", long rows are truncated to the header length.
 * @param {string[][]} rows
 * @returns {Record<string, string>[]}
 */
export function rowsToObjects(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const headers = rows[0].map((h) =>
    String(h ?? "").trim().toLowerCase().replace(/\s+/g, "_")
  );

  const objects = [];
  for (let r = 1; r < rows.length; r++) {
    const rawRow = rows[r];
    const isBlank = rawRow.every((cell) => String(cell ?? "").trim() === "");
    if (isBlank) continue;

    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      obj[key] = String(rawRow[c] ?? "").trim();
    }
    objects.push(obj);
  }

  return objects;
}
