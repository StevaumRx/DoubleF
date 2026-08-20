import { getLiveCattle, getMeatCuts, friendlyErrorMessage } from "./data-service.js";
import { buildListingCard } from "./cards.js";
import { clearNode } from "./dom-utils.js";

const grid = document.getElementById("featured-grid");
const status = document.getElementById("featured-status");

async function init() {
  try {
    const [cattle, meat] = await Promise.all([getLiveCattle(), getMeatCuts()]);
    const featured = [...cattle.slice(0, 3), ...meat.slice(0, 3)];

    if (featured.length === 0) {
      status.textContent = "No listings available right now — check back soon.";
      return;
    }

    clearNode(status);
    status.hidden = true;
    featured.forEach((item) => grid.appendChild(buildListingCard(item)));
  } catch (err) {
    status.textContent = friendlyErrorMessage(err);
  }
}

init();
