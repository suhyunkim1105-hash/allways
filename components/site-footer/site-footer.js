/**
 * Site Footer — shared component
 * Owner: 명진
 *
 * The common band shown at the bottom of every screen: logo + slogan +
 * a data line (team name · KF event name · data survey date).
 *
 * This file is optional. For a static footer, just write the markup by
 * hand (see the block comment at the top of site-footer.css) and skip
 * this file entirely. Use this only when a screen needs to build the
 * footer from data (e.g. several screens sharing one config object), or
 * wants the <site-footer> custom element.
 *
 * Common rule: never fabricate the data line. If a value is missing,
 * this renders "—" for that slot rather than guessing a date/team name.
 *
 * Usage (no build step required — plain <script> include):
 *
 *   <link rel="stylesheet" href="components/site-footer/site-footer.css">
 *   <script src="components/site-footer/site-footer.js"></script>
 *
 *   // 1) Build the markup from data
 *   el.innerHTML = SiteFooter.render({
 *     logoSrc: 'assets/allways-logo.png',
 *     team: 'Team Ctrl+K',
 *     event: '2026 KF Digital Public Diplomacy Academy',
 *     date: 'Data surveyed Aug 2026',
 *   });
 *
 *   // 2) Web component — auto-registered, upgrades in place
 *   <site-footer
 *     logo-src="assets/allways-logo.png"
 *     team="Team Ctrl+K"
 *     event="2026 KF Digital Public Diplomacy Academy"
 *     date="Data surveyed Aug 2026"
 *   ></site-footer>
 */
(function (global) {
  "use strict";

  var DEFAULT_SLOGAN = "Always, AllWays.";
  var FALLBACK = "—"; // never fabricate a missing value

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safe(value) {
    var str = value === null || value === undefined ? "" : String(value).trim();
    return str.length ? str : FALLBACK;
  }

  /**
   * Build just the data line (team · event · date).
   * @param {object} opts
   * @param {string} [opts.team]
   * @param {string} [opts.event]
   * @param {string} [opts.date]
   * @returns {string} HTML markup, ready for innerHTML
   */
  function renderInfo(opts) {
    opts = opts || {};
    var team = escapeHtml(safe(opts.team));
    var event = escapeHtml(safe(opts.event));
    var date = escapeHtml(safe(opts.date));

    return (
      '<div class="site-footer__info">' +
      '<span class="site-footer__info-item site-footer__info-item--team">' + team + "</span>" +
      '<span class="site-footer__info-sep">·</span>' +
      '<span class="site-footer__info-item">' + event + "</span>" +
      '<span class="site-footer__info-sep">·</span>' +
      '<span class="site-footer__info-item">' + date + "</span>" +
      "</div>"
    );
  }

  /**
   * Build the full footer (logo + slogan + divider + data line).
   * @param {object} opts
   * @param {string} opts.logoSrc - path to assets/allways-logo.png, relative to the including page
   * @param {string} [opts.slogan] - defaults to "Always, AllWays."
   * @param {string} [opts.team]
   * @param {string} [opts.event]
   * @param {string} [opts.date]
   * @returns {string} HTML markup, ready for innerHTML
   */
  function render(opts) {
    opts = opts || {};
    var logoSrc = escapeHtml(opts.logoSrc || "");
    var slogan = escapeHtml(opts.slogan || DEFAULT_SLOGAN);

    return (
      '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
      (logoSrc
        ? '<img class="site-footer__logo" src="' + logoSrc + '" alt="AllWays" />'
        : "") +
      '<p class="site-footer__slogan">' + slogan + "</p>" +
      '<div class="site-footer__divider"></div>' +
      renderInfo(opts) +
      "</div>" +
      "</footer>"
    );
  }

  var SiteFooter = {
    DEFAULT_SLOGAN: DEFAULT_SLOGAN,
    render: render,
    renderInfo: renderInfo,
  };

  global.SiteFooter = SiteFooter;

  // --- Optional web component wrapper -------------------------------
  if (global.customElements && !global.customElements.get("site-footer")) {
    var SiteFooterElement = function () {
      var el = Reflect.construct(HTMLElement, [], SiteFooterElement);
      return el;
    };
    SiteFooterElement.prototype = Object.create(HTMLElement.prototype);
    SiteFooterElement.prototype.constructor = SiteFooterElement;

    SiteFooterElement.observedAttributes = ["logo-src", "slogan", "team", "event", "date"];

    SiteFooterElement.prototype.connectedCallback = function () {
      this._render();
    };
    SiteFooterElement.prototype.attributeChangedCallback = function () {
      this._render();
    };
    SiteFooterElement.prototype._render = function () {
      this.innerHTML = render({
        logoSrc: this.getAttribute("logo-src"),
        slogan: this.getAttribute("slogan"),
        team: this.getAttribute("team"),
        event: this.getAttribute("event"),
        date: this.getAttribute("date"),
      });
    };

    global.customElements.define("site-footer", SiteFooterElement);
  }
})(typeof window !== "undefined" ? window : this);
