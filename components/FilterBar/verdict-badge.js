/**
 * Verdict Badge — shared component
 * Owner: 명진
 *
 * Built from the approved design files:
 *   아이콘_판정배지_기본.svg        -> default pill (no border)
 *   아이콘_판정배지_커서 댔을 떄.svg -> hover pill (adds 1px border, same color)
 *   아이콘_판정배지_상세정보.svg     -> hover tooltip (title + description),
 *                                     shown only for accessible / caution / difficult
 *
 * Common rule #2: a verdict is always icon + label + color, as one unit.
 * Common rule #3: label text is English only.
 * Common rule #4: never invent a value. Missing/unrecognized status always
 *   resolves to "not-surveyed" — it does not guess.
 *
 * Usage (no build step required — plain <script> include):
 *
 *   <link rel="stylesheet" href="components/verdict-badge/verdict-badge.css">
 *   <script src="components/verdict-badge/verdict-badge.js"></script>
 *
 *   // 1) Badge only (pill, no tooltip)
 *   el.innerHTML = VerdictBadge.render('accessible', { size: 'card' });
 *
 *   // 2) Badge + hover tooltip (accessible/caution/difficult only —
 *   //    not-surveyed never gets a tooltip, there's nothing to explain)
 *   el.innerHTML = VerdictBadge.renderWithTooltip('caution', { size: 'card' });
 *
 *   // 3) Web component — auto-registered, upgrades in place
 *   <verdict-badge status="difficult" size="detail" tooltip></verdict-badge>
 *   <verdict-badge></verdict-badge> <!-- no status -> "Not surveyed" -->
 */
(function (global) {
  "use strict";

  // Inline SVG per state — currentColor picks up the badge's text color,
  // so color + icon shape always stay in sync (rule #2). White accents are
  // fixed white on purpose (contrast against the colored shape, not the
  // page background).
  var ICONS = {
    // check-circle (matches 아이콘_판정배지 "All-Way" glyph)
    accessible:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
      '<path d="M7.2 12.5 10.3 15.6 17 8.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>",
    // warning triangle with "!" (matches "Step-Way" glyph)
    caution:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.7 22.3 21H1.7L12 2.7Z" fill="currentColor"/>' +
      '<rect x="11.05" y="8.6" width="1.9" height="6.2" rx="0.95" fill="#fff"/>' +
      '<rect x="11.05" y="16.2" width="1.9" height="1.9" rx="0.95" fill="#fff"/>' +
      "</svg>",
    // no-entry / minus circle (matches "Re-Way" glyph)
    difficult:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
      '<rect x="6.5" y="11" width="11" height="2" rx="1" fill="#fff"/>' +
      "</svg>",
    // confused face + "?" (matches "Not surveyed" glyph)
    "not-surveyed":
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="10.5" cy="12.5" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="7.6" cy="10.8" r="0.9" fill="currentColor"/>' +
      '<circle cx="13.4" cy="10.8" r="0.9" fill="currentColor"/>' +
      '<path d="M7.6 15.8c1.1-1.3 2.9-1.3 4.2-.2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
      '<circle cx="17.2" cy="5.6" r="4.1" fill="currentColor"/>' +
      '<path d="M15.9 4.75a1.25 1.25 0 1 1 1.85 1.15c-.35.25-.55.42-.55.8" fill="none" stroke="#fff" stroke-width="0.85" stroke-linecap="round"/>' +
      '<circle cx="17.2" cy="7.75" r="0.32" fill="#fff"/>' +
      "</svg>",
  };

  // VERDICTS[status] = {
  //   shortLabel: what shows ON the pill itself,
  //   title:      full state name, shown as the tooltip heading,
  //   desc:       one-sentence explanation, shown in the tooltip body.
  //               "not-surveyed" has no desc/tooltip on purpose.
  // }
  var VERDICTS = {
    accessible: {
      shortLabel: "All-Way",
      title: "Accessible",
      desc: "Fully accessible independently for all people.",
    },
    caution: {
      shortLabel: "Step-Way",
      title: "Caution needed",
      desc: "Accessible, but assistance or caution may be required.",
    },
    difficult: {
      shortLabel: "Re-Way",
      title: "Difficult",
      desc: "Restricted access due to barriers.",
    },
    "not-surveyed": {
      shortLabel: "Not surveyed",
      title: null,
      desc: null,
    },
  };

  var SIZES = ["list", "card", "detail"];
  var DEFAULT_SIZE = "card";

  // Accepts a handful of reasonable aliases so upstream data naming
  // ("caution_needed", "Not Surveyed", etc.) doesn't silently fall through.
  // Anything not recognized here becomes "not-surveyed" — never a guess.
  var ALIASES = {
    accessible: "accessible",
    "all-way": "accessible",
    allway: "accessible",
    ok: "accessible",
    pass: "accessible",
    caution: "caution",
    "caution-needed": "caution",
    caution_needed: "caution",
    "step-way": "caution",
    stepway: "caution",
    warning: "caution",
    difficult: "difficult",
    "re-way": "difficult",
    reway: "difficult",
    fail: "difficult",
    "not-surveyed": "not-surveyed",
    not_surveyed: "not-surveyed",
    unsurveyed: "not-surveyed",
    unknown: "not-surveyed",
    null: "not-surveyed",
    undefined: "not-surveyed",
    "": "not-surveyed",
  };

  function normalizeStatus(rawStatus) {
    if (rawStatus === null || rawStatus === undefined) return "not-surveyed";
    var key = String(rawStatus).trim().toLowerCase();
    return ALIASES.hasOwnProperty(key) ? ALIASES[key] : "not-surveyed";
  }

  function normalizeSize(rawSize) {
    var key = String(rawSize || "").trim().toLowerCase();
    return SIZES.indexOf(key) !== -1 ? key : DEFAULT_SIZE;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * Build just the pill badge (icon + short label + color).
   * @param {string} rawStatus - accessible/caution/difficult/not-surveyed
   *   (aliases allowed, see ALIASES). Missing/unrecognized -> not-surveyed.
   * @param {object} [opts]
   * @param {"list"|"card"|"detail"} [opts.size] - defaults to "card"
   * @param {boolean} [opts.muted] - visually de-emphasize (secondary column)
   * @returns {string} HTML markup, ready for innerHTML
   */
  function render(rawStatus, opts) {
    opts = opts || {};
    var status = normalizeStatus(rawStatus);
    var size = normalizeSize(opts.size);
    var v = VERDICTS[status];

    var classes = [
      "verdict-badge",
      "verdict-badge--" + status,
      "verdict-badge--" + size,
    ];
    if (opts.muted) classes.push("verdict-badge--muted");

    return (
      '<span class="' +
      classes.join(" ") +
      '" data-verdict-status="' +
      status +
      '" data-verdict-size="' +
      size +
      '" tabindex="0" role="status" aria-label="' +
      escapeHtml(v.title || v.shortLabel) +
      '">' +
      '<span class="verdict-badge__icon">' +
      ICONS[status] +
      "</span>" +
      '<span class="verdict-badge__label">' +
      escapeHtml(v.shortLabel) +
      "</span>" +
      "</span>"
    );
  }

  /**
   * Build the pill badge wrapped with a hover/focus detail tooltip.
   * For "not-surveyed" this just returns the plain badge (no tooltip) —
   * there is nothing to explain about data that doesn't exist yet.
   * @param {string} rawStatus
   * @param {object} [opts] - same as render()
   * @returns {string} HTML markup, ready for innerHTML
   */
  function renderWithTooltip(rawStatus, opts) {
    var status = normalizeStatus(rawStatus);
    var v = VERDICTS[status];
    var badgeHtml = render(rawStatus, opts);

    if (!v.title) {
      // not-surveyed: no tooltip by design
      return badgeHtml;
    }

    return (
      '<span class="verdict-badge-wrap">' +
      badgeHtml +
      '<span class="verdict-badge-tip" role="tooltip">' +
      '<p class="verdict-badge-tip__title">' +
      escapeHtml(v.title) +
      "</p>" +
      '<p class="verdict-badge-tip__desc">' +
      escapeHtml(v.desc) +
      "</p>" +
      '<span class="verdict-badge-tip__badge-row">' +
      render(rawStatus, opts) +
      "</span>" +
      "</span>" +
      "</span>"
    );
  }

  var VerdictBadge = {
    STATES: Object.keys(VERDICTS), // ["accessible","caution","difficult","not-surveyed"]
    SIZES: SIZES.slice(), // ["list","card","detail"]
    normalize: normalizeStatus,
    render: render,
    renderWithTooltip: renderWithTooltip,
  };

  global.VerdictBadge = VerdictBadge;

  // --- Optional web component wrapper -------------------------------
  if (global.customElements && !global.customElements.get("verdict-badge")) {
    var VerdictBadgeElement = function () {
      var el = Reflect.construct(HTMLElement, [], VerdictBadgeElement);
      return el;
    };
    VerdictBadgeElement.prototype = Object.create(HTMLElement.prototype);
    VerdictBadgeElement.prototype.constructor = VerdictBadgeElement;

    VerdictBadgeElement.observedAttributes = ["status", "size", "muted", "tooltip"];

    VerdictBadgeElement.prototype.connectedCallback = function () {
      this._render();
    };
    VerdictBadgeElement.prototype.attributeChangedCallback = function () {
      this._render();
    };
    VerdictBadgeElement.prototype._render = function () {
      var opts = {
        size: this.getAttribute("size"),
        muted: this.hasAttribute("muted"),
      };
      this.innerHTML = this.hasAttribute("tooltip")
        ? renderWithTooltip(this.getAttribute("status"), opts)
        : render(this.getAttribute("status"), opts);
    };

    global.customElements.define("verdict-badge", VerdictBadgeElement);
  }
})(typeof window !== "undefined" ? window : this);
