import { getListingById, friendlyErrorMessage } from "./data-service.js";
import { el, clearNode } from "./dom-utils.js";
import { formatPrice, isValidStripeLink } from "./validators.js";
import { CONTACT } from "./config.js";

const PLACEHOLDER = {
  cattle: "assets/img/placeholder-cattle.svg",
  meat: "assets/img/placeholder-meat.svg",
};

const LISTING_PAGE = {
  cattle: "live-cattle.html",
  meat: "meat-cuts.html",
};

const main = document.getElementById("listing-main");

function specRows(item) {
  if (item.type === "cattle") {
    return [
      ["Type", item.animalType],
      ["Breed", item.breed],
      ["Age", item.age],
      ["Weight", item.weight],
      ["Size", item.size],
      ["Available", item.availableDate],
    ];
  }
  return [
    ["Cut Type", item.cutType],
    ["Source Animal", item.sourceAnimal],
    ["Est. Weight", item.estWeight],
    ["Ready Date", item.readyDate],
  ];
}

function renderNotFound() {
  clearNode(main);
  main.appendChild(
    el("div", { class: "state-message" }, [
      el("h1", { text: "Listing Not Found" }),
      el("p", { text: "This listing may have been sold or the link may be out of date." }),
      el("a", { class: "btn btn-primary", href: "index.html" }, "Back to Home"),
    ])
  );
}

function renderError(message) {
  clearNode(main);
  main.appendChild(
    el("div", { class: "state-message" }, [
      el("h1", { text: "Something Went Wrong" }),
      el("p", { text: message }),
      el("a", { class: "btn btn-primary", href: "index.html" }, "Back to Home"),
    ])
  );
}

function renderListing(item) {
  clearNode(main);
  document.title = `${item.title} · Double F Cattle Company`;

  const photos = item.photos.length > 0 ? item.photos : [PLACEHOLDER[item.type]];

  const mainImg = el("img", {
    id: "gallery-main-img",
    src: photos[0],
    alt: item.title,
    width: "800",
    height: "600",
  });

  const thumbs = el(
    "div",
    { class: "gallery-thumbs" },
    photos.map((src, i) =>
      el("button", {
        type: "button",
        class: "gallery-thumb",
        "aria-label": `Show photo ${i + 1}`,
        onclick: () => {
          mainImg.src = src;
        },
      }, [el("img", { src, alt: "", width: "100", height: "75" })])
    )
  );

  const specs = el(
    "dl",
    { class: "spec-list" },
    specRows(item)
      .filter(([, value]) => value && value.trim() !== "")
      .flatMap(([label, value]) => [
        el("dt", { text: label }),
        el("dd", { text: value }),
      ])
  );

  const reserveSection = el("div", { class: "cta-group" }, [
    el(
      "a",
      { class: "btn btn-secondary", href: `tel:${CONTACT.phoneHref}` },
      `Call to Reserve`
    ),
    el(
      "a",
      {
        class: "btn btn-secondary",
        href: `mailto:${CONTACT.email}?subject=${encodeURIComponent(
          `Reserve: ${item.title}`
        )}`,
      },
      "Email to Reserve"
    ),
  ]);

  if (isValidStripeLink(item.stripeLink)) {
    reserveSection.appendChild(
      el(
        "a",
        {
          class: "btn btn-primary",
          href: item.stripeLink,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "Pay Now ↗"
      )
    );
  }

  main.appendChild(
    el("a", { class: "back-link", href: LISTING_PAGE[item.type] }, "← Back to Listings")
  );

  main.appendChild(
    el("div", { class: "listing-layout" }, [
      el("div", { class: "listing-gallery" }, [mainImg, photos.length > 1 ? thumbs : null]),
      el("div", { class: "listing-info" }, [
        el("span", { class: `badge badge-${item.status.key}`, text: item.status.label }),
        el("h1", { text: item.title }),
        el("p", { class: "listing-price", text: formatPrice(item.priceRaw) }),
        specs,
        item.description
          ? el("p", { class: "listing-description", text: item.description })
          : null,
        reserveSection,
        isValidStripeLink(item.stripeLink)
          ? el("p", {
              class: "stripe-note",
              text: "Clicking “Pay Now” opens Stripe in a new tab to complete your secure payment.",
            })
          : null,
      ]),
    ])
  );
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const id = params.get("id");

  if (type !== "cattle" && type !== "meat") {
    renderNotFound();
    return;
  }

  try {
    const item = await getListingById(type, id);
    if (!item) {
      renderNotFound();
      return;
    }
    renderListing(item);
  } catch (err) {
    renderError(friendlyErrorMessage(err));
  }
}

init();
