import { el } from "./dom-utils.js";
import { formatPrice } from "./validators.js";

const PLACEHOLDER = {
  cattle: "assets/img/placeholder-cattle.svg",
  meat: "assets/img/placeholder-meat.svg",
};

function specLine(item) {
  const parts =
    item.type === "cattle"
      ? [item.breed, item.age, item.weight, item.size]
      : [item.cutType, item.sourceAnimal, item.estWeight];
  return parts.filter((p) => p && p.trim() !== "").join(" · ");
}

/**
 * Builds a listing card. All spreadsheet-derived text goes through
 * textContent (via el()'s "text" attr) — never innerHTML.
 * @param {object} item normalized listing from data-service.js
 */
export function buildListingCard(item) {
  const photo = item.photos[0] || PLACEHOLDER[item.type];
  const spec = specLine(item);

  return el("article", { class: "card" }, [
    el("a", { class: "card-media", href: `listing.html?type=${item.type}&id=${item.id}` }, [
      el("img", {
        src: photo,
        alt: item.title,
        loading: "lazy",
        width: "400",
        height: "300",
      }),
      el("span", { class: `badge badge-${item.status.key}`, text: item.status.label }),
    ]),
    el("div", { class: "card-body" }, [
      el("h3", { class: "card-title", text: item.title }),
      spec ? el("p", { class: "card-meta", text: spec }) : null,
      el("p", { class: "card-price", text: formatPrice(item.priceRaw) }),
      el(
        "a",
        { class: "btn btn-outline btn-small", href: `listing.html?type=${item.type}&id=${item.id}` },
        "View Details"
      ),
    ]),
  ]);
}
