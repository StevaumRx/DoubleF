import { getMeatCuts, friendlyErrorMessage } from "./data-service.js";
import { buildListingCard } from "./cards.js";
import { clearNode } from "./dom-utils.js";

const grid = document.getElementById("listing-grid");
const status = document.getElementById("listing-status");

async function init() {
  try {
    const items = await getMeatCuts();

    if (items.length === 0) {
      status.textContent = "No meat listings available right now — check back soon.";
      return;
    }

    clearNode(status);
    status.hidden = true;
    items.forEach((item) => grid.appendChild(buildListingCard(item)));
  } catch (err) {
    status.textContent = friendlyErrorMessage(err);
  }
}

init();
