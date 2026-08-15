'use client';

/**
 * AllWays — Landing Page (First Screen)
 * Owner: Landing page module only.
 *
 * IMPORTANT
 * This file does NOT modify, import, or depend on
 * `landingpage-filtering.component` (now `components/FilterBar.tsx`) in
 * any way. It only exposes a single, clearly-marked integration point
 * (see "FILTERING-COMPONENT INTEGRATION" below) for whoever owns that
 * component to wire up.
 *
 * This repo's `components/` folder holds each teammate's piece as a
 * plain component (see `components/verdict-badge/`, `components/FilterBar.tsx`)
 * rather than a full route — there's no `app/` or `pages/` folder checked
 * into this repo yet. So this file follows the same pattern: it's a
 * reusable <LandingPage /> component, not a page itself. Whoever wires up
 * the actual route (root `/`) just needs:
 *
 *   import LandingPage from '../components/LandingPage/LandingPage';
 *   export default function Page() { return <LandingPage />; }
 *
 * See README-NEXTJS.md for more on this and on the Pages Router fallback.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import localFont from 'next/font/local';
import styles from './LandingPage.module.css';
import logo from './assets/allways-logo.png';

const aphont = localFont({
  src: [
    { path: './fonts/APHont-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/APHont-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/APHont-Italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/APHont-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-aphont',
  display: 'swap',
});

/* -----------------------------------------------------
   "Welcome" translated across ~10 languages (환영합니다/Welcome),
   shown in Latin-alphabet / romanized form so all on-screen text
   stays in English/Latin script.
   ----------------------------------------------------- */
const GREETINGS = [
  'Welcome',
  'Bienvenue',
  'Bienvenido',
  'Benvenuto',
  'Willkommen',
  'Bem-vindo',
  'Youkoso',
  'Huanying',
  'Hwanyeong',
  'Swagat',
];

const ROTATE_INTERVAL_MS = 2200;
const FADE_DURATION_MS = 450;

/* -----------------------------------------------------
   GOOGLE SIGN-IN
   -----------------------------------------------------
   TODO: set the real Google OAuth Client ID below (from Google
   Cloud Console → APIs & Services → Credentials). Until it's set,
   Google's real button can't render, so the fallback button stays
   visible (styled the same, but not yet wired to Google).

   Also remember to add this site's real domain to "Authorized
   JavaScript origins" for that Client ID in Google Cloud Console
   once it's deployed — that step can't be done from this file.
   ----------------------------------------------------- */
const GOOGLE_CLIENT_ID = ''; // TODO: paste the real Client ID here

declare global {
  interface Window {
    google?: any;
    onAllWaysStart?: (credentialResponse?: any) => void;
  }
}

export default function LandingPage() {
  const greetingRef = useRef<HTMLSpanElement>(null);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [greetingHidden, setGreetingHidden] = useState(false);
  const gSignInBtnRef = useRef<HTMLDivElement>(null);
  const [showFallbackButton, setShowFallbackButton] = useState(true);

  // Rotating greetings
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingHidden(true);
      setTimeout(() => {
        setGreetingIndex((i) => (i + 1) % GREETINGS.length);
        setGreetingHidden(false);
      }, FADE_DURATION_MS);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  /* -----------------------------------------------------
     FILTERING-COMPONENT INTEGRATION (fires on successful sign-in)
     -----------------------------------------------------
     The exact link target for `landingpage-filtering.component` has
     not been finalized yet, so this deliberately does NOT hardcode a
     guessed route or import path.

     Once sign-in succeeds, this does two things, either of which the
     filtering-component owner can hook into without this file
     needing to change again later:

     1. Dispatches a bubbling, cancelable custom event on `document`:
        "allways:start", with the Google credential (ID token)
        attached as `event.detail.credential`
          -> document.addEventListener('allways:start', fn)
     2. Calls `window.onAllWaysStart(credentialResponse)` if that
        function has been defined elsewhere (e.g. by the filtering
        component's own code, or a shared app shell/router) — so it
        can decide how to navigate to landingpage-filtering.component
        (e.g. router.push('/filtering') in a useEffect elsewhere).

     TODO (whoever wires this up): once the real route / component
     for landingpage-filtering.component is confirmed, implement ONE
     of the two hooks above there. Nothing in this file should need
     to change.
     ----------------------------------------------------- */
  function goToFiltering(credentialResponse?: any) {
    const event = new CustomEvent('allways:start', {
      bubbles: true,
      cancelable: true,
      detail: { credential: credentialResponse?.credential ?? null },
    });
    const notCancelled = document.dispatchEvent(event);

    if (notCancelled && typeof window.onAllWaysStart === 'function') {
      window.onAllWaysStart(credentialResponse);
    }

    if (notCancelled && typeof window.onAllWaysStart !== 'function') {
      // No integration hook registered yet — expected until
      // landingpage-filtering.component wires itself up.
      console.info(
        '[AllWays landing] Signed in. No integration hook found yet ' +
          '(listen for "allways:start" on document, or define ' +
          'window.onAllWaysStart) — connect landingpage-filtering.component here.'
      );
    }
  }

  function handleGoogleScriptLoad() {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id || !gSignInBtnRef.current) {
      console.info(
        '[AllWays landing] GOOGLE_CLIENT_ID not set yet (or Google script ' +
          'unavailable) — showing the fallback "Sign in with Google" button only.'
      );
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: goToFiltering,
    });

    window.google.accounts.id.renderButton(gSignInBtnRef.current, {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
    });

    setShowFallbackButton(false);
  }

  function handleFallbackClick() {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // GOOGLE_CLIENT_ID isn't set yet, so real Google sign-in can't run.
    // Per the current requirement ("for now, just implement the
    // connection to the next screen"), the button still moves the user
    // forward — it calls the exact same goToFiltering() hook the real
    // Google callback will use later, just with no credential attached.
    // Once GOOGLE_CLIENT_ID is set, this branch stops being reachable
    // (the real Google button takes over) and no code here needs to change.
    console.info(
      '[AllWays landing] GOOGLE_CLIENT_ID not set yet — proceeding to the ' +
        'next screen without a real Google credential. Once the Client ID ' +
        'is added, this button will do real Google sign-in instead.'
    );
    goToFiltering();
  }

  return (
    <main className={`${styles.hero} ${aphont.variable}`} style={{ fontFamily: 'var(--font-aphont), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif' }}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleGoogleScriptLoad}
      />

      <div className={styles.heroInner}>
        <Image
          className={styles.heroLogo}
          src={logo}
          alt="AllWays logo"
          width={1991}
          height={695}
          priority
          draggable={false}
        />

        <h1 className={styles.heroSlogan}>Always, AllWays.</h1>

        <div className={styles.greeting} aria-live="polite">
          <span
            ref={greetingRef}
            className={`${styles.greetingText} ${greetingHidden ? styles.greetingTextHidden : ''}`}
          >
            {GREETINGS[greetingIndex]}
          </span>
        </div>

        <div className={styles.googleSignin}>
          {/* Real Google-rendered button goes here once Identity
              Services loads successfully (see GOOGLE_CLIENT_ID above). */}
          <div ref={gSignInBtnRef} />

          {/* Fallback button: shown until the real Google button
              renders. Matches Google's official button style; do not
              recolor the "G" logo. */}
          {showFallbackButton && (
            <button
              className={styles.googleBtnFallback}
              type="button"
              onClick={handleFallbackClick}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.6154z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/>
                <path fill="#FBBC05" d="M3.9641 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z"/>
                <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6564 3.5795 9 3.5795z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        <p className={styles.heroStats}>n people around the world have joined.</p>
      </div>

      {/* Faint background map — nods to AllWays being a "ways/routes"
          brand. Streets/river are neutral pale gray (no brand
          blue/orange in the linework); only the two pin markers + one
          small dot use accent color, kept small so nothing competes
          with the logo, slogan, or buttons in front. */}
      <svg className={styles.heroMapBg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="#C7CCD6" strokeWidth="1.5" opacity="0.16" strokeLinecap="round">
          <path d="M -50 120 L 300 120 L 300 260 L 700 260 L 700 140 L 1500 140" />
          <path d="M -50 380 L 220 380 L 220 500 L 600 500 L 600 420 L 1000 420 L 1000 560 L 1500 560" />
          <path d="M -50 700 L 400 700 L 400 640 L 850 640 L 850 760 L 1500 760" />
          <path d="M 150 -50 L 150 300 L 260 300 L 260 700 L 150 700 L 150 950" />
          <path d="M 480 -50 L 480 220 L 600 220 L 600 600 L 520 600 L 520 950" />
          <path d="M 820 -50 L 820 350 L 920 350 L 920 750 L 1000 750 L 1000 950" />
          <path d="M 1150 -50 L 1150 260 L 1080 260 L 1080 620 L 1200 620 L 1200 950" />
        </g>
        <path d="M -50 500 L 1500 260" fill="none" stroke="#C7CCD6" strokeWidth="1.5" opacity="0.14" />

        <path
          d="M -50 560 C 200 480, 350 630, 600 550 S 950 470, 1200 530 S 1400 570, 1500 530"
          fill="none"
          stroke="#CFE0F5"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.3"
        />

        <path
          d="M 160 300 C 100 400, 260 460, 210 560 C 160 660, 300 700, 1290 640"
          fill="none"
          stroke="#9AA2B0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1.5 10"
          opacity="0.32"
        />

        <g transform="translate(160 268) scale(0.85)" opacity="0.45">
          <path d="M0 0C-11 0-20 9-20 20c0 15 20 36 20 36s20-21 20-36C20 9 11 0 0 0z" fill="#FF8040" />
          <circle cx="0" cy="19" r="7" fill="#F0F2F5" />
        </g>
        <g transform="translate(1290 608) scale(0.85)" opacity="0.45">
          <path d="M0 0C-11 0-20 9-20 20c0 15 20 36 20 36s20-21 20-36C20 9 11 0 0 0z" fill="#0046FF" />
          <circle cx="0" cy="19" r="7" fill="#F0F2F5" />
        </g>

        <circle cx="60" cy="600" r="5" fill="#FF8040" opacity="0.4" />
      </svg>
    </main>
  );
}
