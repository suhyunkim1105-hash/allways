/**
 * Accessibility Rating Guide — page logic
 * Owner: Genie
 *
 * Renders the confirmed 6-criterion comparison as one card per criterion,
 * with a chip per tier (All-Way / Step-Way / Re-Way). Every chip embeds
 * the shared VerdictBadge component (components/verdict-badge/, owner
 * 명진) exactly as published via VerdictBadge.render(...) — this file
 * does not modify that component or its markup/colors/labels in any way.
 * The chip's tinted background + the badge's own icon/color/label is what
 * makes each value scannable and judgeable at a glance, without needing
 * to read a plain grid of numbers.
 *
 * Common rule #4 applies here too: the numeric/qualitative values below are
 * copied verbatim from the confirmed criteria table and must not be edited
 * without an updated table from the team.
 *
 * Usage (no build step — plain <script> include, after verdict-badge.js):
 *   <link rel="stylesheet" href="../verdict-badge/verdict-badge.css">
 *   <link rel="stylesheet" href="./accessibility-rating-guide.css">
 *   <script src="../verdict-badge/verdict-badge.js"></script>
 *   <script src="./accessibility-rating-guide.js"></script>
 */
(function (global) {
  "use strict";

  // Tier keys match VerdictBadge's own status keys 1:1:
  //   accessible -> All-Way, caution -> Step-Way, difficult -> Re-Way
  var TIERS = ["accessible", "caution", "difficult"];

  // Small topic icons (not verdict icons — those stay inside VerdictBadge).
  // Purely decorative wayfinding for each criterion row; currentColor-based.
  var TOPIC_ICONS = {
    threshold:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 17h4v-3h4v-3h4v-3h4"/>' +
      "</svg>",
    slope:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 18h18"/><path d="M3 18 15 6"/><path d="M15 6h4v4"/>' +
      "</svg>",
    "passage-width":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 12h16"/><path d="M4 12 8 8"/><path d="M4 12 8 16"/><path d="M20 12 16 8"/><path d="M20 12 16 16"/>' +
      "</svg>",
    door:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="5" y="3" width="12" height="18" rx="1"/><circle cx="14" cy="12" r="1" fill="currentColor" stroke="none"/>' +
      "</svg>",
    "turning-space":
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 12a8 8 0 1 1 3 6.2"/><path d="M4 18v-4h4"/>' +
      "</svg>",
    restroom:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="17" cy="5" r="2"/><path d="M13 21v-6H9l2-6.5c.3-1 1-1.5 2-1.5s1.7.5 2 1.5L17 15"/><path d="M7 13a5 5 0 1 0 5 5"/>' +
      "</svg>",
  };

  // Confirmed criteria table — values copied verbatim, do not edit without
  // an updated table from the team.
  var CRITERIA = [
    {
      key: "threshold",
      label: "Entrance & Floor Threshold",
      tiers: {
        accessible: "≤ 1 cm",
        caution: "> 1–2 cm",
        difficult: "> 2 cm",
      },
    },
    {
      key: "slope",
      label: "Ramp Slope",
      tiers: {
        accessible: "≤ 1:18 (3.18°)",
        caution: "> 1:18–1:12 (4.76°)",
        difficult: "> 1:12",
      },
    },
    {
      key: "passage-width",
      label: "Passage Width",
      tiers: {
        accessible: "≥ 1.2 m",
        caution: "≥ 0.9–<1.2 m",
        difficult: "< 0.9 m",
      },
    },
    {
      key: "door",
      label: "Door Type & Space",
      tiers: {
        accessible: "Automatic / step-free sliding",
        caution: "Hinged door with ≥0.6 m side space",
        difficult: "Revolving / insufficient space",
      },
    },
    {
      key: "turning-space",
      label: "Turning Space",
      tiers: {
        accessible: "≥ 1.5 × 1.5 m",
        caution: "≥ 1.4 × 1.4–<1.5 × 1.5 m",
        difficult: "< 1.4 × 1.4 m",
      },
    },
    {
      key: "restroom",
      label: "Accessible Restroom",
      tiers: {
        accessible: "1.6 × 2.0 m + turning space",
        caution: "Relaxed standard 1.0 × 1.8 m",
        difficult: "Width < 0.9 m / threshold etc.",
      },
    },
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderLegend() {
    var el = document.getElementById("arg-legend");
    if (!el || !global.VerdictBadge) return;
    el.innerHTML = TIERS.map(function (status) {
      return (
        '<div class="arg-legend__item">' +
        global.VerdictBadge.renderWithTooltip(status, { size: "detail" }) +
        "</div>"
      );
    }).join("");
  }

  function buildCard(criterion) {
    var detailId = "arg-detail-" + criterion.key;

    var chips = TIERS.map(function (status) {
      return (
        '<div class="arg-chip arg-chip--' +
        status +
        '">' +
        '<span class="arg-chip__badge">' +
        global.VerdictBadge.render(status, { size: "list" }) +
        "</span>" +
        '<span class="arg-chip__value">' +
        escapeHtml(criterion.tiers[status]) +
        "</span>" +
        "</div>"
      );
    }).join("");

    var icon = TOPIC_ICONS[criterion.key] || "";

    return (
      '<div class="arg-card">' +
      '<button type="button" class="arg-card__head" aria-expanded="false" aria-controls="' +
      detailId +
      '">' +
      '<span class="arg-card__icon">' +
      icon +
      "</span>" +
      '<span class="arg-card__title">' +
      escapeHtml(criterion.label) +
      "</span>" +
      '<span class="arg-card__chevron" aria-hidden="true">›</span>' +
      "</button>" +
      '<div class="arg-chips">' +
      chips +
      "</div>" +
      '<div class="arg-detail" id="' +
      detailId +
      '" hidden>' +
      "Criterion: " +
      escapeHtml(criterion.label) +
      "</div>" +
      "</div>"
    );
  }

  function renderCards() {
    var el = document.getElementById("arg-cards");
    if (!el || !global.VerdictBadge) return;

    el.innerHTML = CRITERIA.map(buildCard).join("");

    var heads = el.querySelectorAll(".arg-card__head");
    for (var i = 0; i < heads.length; i++) {
      heads[i].addEventListener("click", function (e) {
        var btn = e.currentTarget;
        var willOpen = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(willOpen));
        btn.classList.toggle("is-open", willOpen);
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = !willOpen;
      });
    }
  }

  function init() {
    renderLegend();
    renderCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exposed for debugging/tests — not part of the public contract.
  global.AccessibilityRatingGuide = { CRITERIA: CRITERIA, TIERS: TIERS.slice() };
})(typeof window !== "undefined" ? window : this);
