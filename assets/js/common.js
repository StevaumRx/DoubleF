// Tiny cross-page behavior shared by every HTML file. Plain script (not a
// module) so it can run without depending on the fetch-based data layer.
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Close the mobile nav when a link is tapped.
  const navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.checked = false;
      });
    });
  }
});
