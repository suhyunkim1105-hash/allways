/**
 * AllWays — Landing Page (First Screen)
 * Owner: Landing page module only.
 *
 * IMPORTANT
 * This file does NOT modify, import, or depend on
 * `landingpage-filtering.component` in any way. It only exposes
 * a single, clearly-marked integration point (see "START BUTTON
 * INTEGRATION" below) for whoever owns that component to wire up.
 */

(function () {
  'use strict';

  /* -----------------------------------------------------
     Rotating greetings
     "Welcome" translated across ~10 languages (환영합니다/Welcome),
     shown in Latin-alphabet / romanized form so all on-screen text
     stays in English/Latin script.
     ----------------------------------------------------- */
  var GREETINGS = [
    'Welcome',
    'Bienvenue',
    'Bienvenido',
    'Benvenuto',
    'Willkommen',
    'Bem-vindo',
    'Youkoso',
    'Huanying',
    'Hwanyeong',
    'Swagat'
  ];

  var ROTATE_INTERVAL_MS = 2200;
  var FADE_DURATION_MS = 450;

  function startGreetingRotator() {
    var el = document.getElementById('greetingText');
    if (!el) return;

    var index = 0;

    setInterval(function () {
      el.classList.add('is-hidden');

      setTimeout(function () {
        index = (index + 1) % GREETINGS.length;
        el.textContent = GREETINGS[index];
        el.classList.remove('is-hidden');
      }, FADE_DURATION_MS);
    }, ROTATE_INTERVAL_MS);
  }

  /* -----------------------------------------------------
     FILTERING-COMPONENT INTEGRATION (fires on successful sign-in)
     -----------------------------------------------------
     The exact link target for `landingpage-filtering.component`
     has not been finalized yet, so this deliberately does NOT
     hardcode a guessed URL, route, or tag name.

     Once sign-in succeeds, this does two things, either of which
     the filtering-component owner can hook into without this file
     needing to change again later:

     1. Dispatches a bubbling, cancelable custom event on
        `document`: "allways:start", with the Google credential
        (ID token) attached as `event.detail.credential`
          -> document.addEventListener('allways:start', fn)

     2. Calls `window.onAllWaysStart(credentialResponse)` if that
        function has been defined elsewhere (e.g. by the filtering
        component's own script, or a router/shell script) — so it
        can decide how to show/navigate to
        landingpage-filtering.component.

     TODO (whoever wires this up): once the real path / route /
     custom element tag for landingpage-filtering.component is
     confirmed, implement ONE of the two hooks above in that
     component's own file. Nothing in this file should need to
     change.
     ----------------------------------------------------- */
  function goToFiltering(credentialResponse) {
    var event = new CustomEvent('allways:start', {
      bubbles: true,
      cancelable: true,
      detail: { credential: credentialResponse ? credentialResponse.credential : null }
    });
    var notCancelled = document.dispatchEvent(event);

    if (notCancelled && typeof window.onAllWaysStart === 'function') {
      window.onAllWaysStart(credentialResponse);
    }

    if (notCancelled && typeof window.onAllWaysStart !== 'function') {
      // No integration hook registered yet — this is expected
      // until landingpage-filtering.component wires itself up.
      console.info(
        '[AllWays landing] Signed in. No integration hook found yet ' +
        '(listen for "allways:start" on document, or define ' +
        'window.onAllWaysStart) — connect landingpage-filtering.component here.'
      );
    }
  }

  /* -----------------------------------------------------
     GOOGLE SIGN-IN
     -----------------------------------------------------
     TODO: set the real Google OAuth Client ID below (from Google
     Cloud Console → APIs & Services → Credentials). Until it's
     set, Google's real button can't render, so the fallback
     button stays visible (styled the same, but not yet wired to
     Google — see comment on #googleFallbackBtn below).

     Also remember to add this site's real domain to
     "Authorized JavaScript origins" for that Client ID in Google
     Cloud Console once it's deployed — that step can't be done
     from this file.
     ----------------------------------------------------- */
  var GOOGLE_CLIENT_ID = ''; // TODO: paste the real Client ID here

  function handleCredentialResponse(credentialResponse) {
    goToFiltering(credentialResponse);
  }

  function initGoogleSignIn() {
    var fallbackButton = document.getElementById('googleFallbackBtn');
    var realButtonSlot = document.getElementById('gSignInBtn');

    if (!GOOGLE_CLIENT_ID) {
      console.info(
        '[AllWays landing] GOOGLE_CLIENT_ID is not set yet — showing the ' +
        'fallback "Sign in with Google" button only. Add the real Client ' +
        'ID in script.js to enable actual Google sign-in.'
      );
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      // Google Identity Services script hasn't loaded (offline preview,
      // ad blocker, etc). Fallback button stays visible.
      console.info(
        '[AllWays landing] Google Identity Services script did not load — ' +
        'showing the fallback button only.'
      );
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(realButtonSlot, {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left'
    });

    // Real Google button rendered successfully — hide the fallback.
    if (fallbackButton) {
      fallbackButton.style.display = 'none';
    }
  }

  function initFallbackButton() {
    var fallbackButton = document.getElementById('googleFallbackBtn');
    if (!fallbackButton) return;

    fallbackButton.addEventListener('click', function () {
      if (GOOGLE_CLIENT_ID && window.google && window.google.accounts && window.google.accounts.id) {
        google.accounts.id.prompt();
      } else {
        console.info(
          '[AllWays landing] Google sign-in not wired up yet (missing ' +
          'GOOGLE_CLIENT_ID) — this fallback click will not sign anyone in.'
        );
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    startGreetingRotator();
    initFallbackButton();
    initGoogleSignIn();
  });
})();
