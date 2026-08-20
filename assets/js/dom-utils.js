// Small DOM helpers used instead of innerHTML so that spreadsheet-sourced
// text is always inserted as text (via textContent), never parsed as markup.

/**
 * Create an element without ever touching innerHTML.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]
 * @param {Array<Node|string|null|undefined>|Node|string} [children]
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }

  return node;
}

export function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/**
 * True only for absolute http(s) URLs. Rejects javascript:, data:, blob:, etc.
 * @param {string} url
 */
export function isSafeHttpUrl(url) {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
