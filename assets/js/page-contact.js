import { CONTACT } from "./config.js";

// This is a fully static site with no backend, so the contact form can't
// post anywhere on its own. As a zero-dependency fallback it opens the
// visitor's email client with the message pre-filled. To collect messages
// directly instead, swap this for a form service (e.g. Formspree, Netlify
// Forms) — that only requires changing the <form action> in contact.html.
const form = document.getElementById("contact-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = form.elements.namedItem("name").value.trim();
  const email = form.elements.namedItem("email").value.trim();
  const message = form.elements.namedItem("message").value.trim();

  const subject = `Website inquiry from ${name || "a visitor"}`;
  const body = `${message}\n\n— ${name}\n${email}`;

  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
});
