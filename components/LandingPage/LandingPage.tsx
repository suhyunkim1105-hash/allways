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
 * rather than a full route.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import styles from './LandingPage.module.css';

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

const GOOGLE_CLIENT_ID = '';

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

  function goToFiltering(credentialResponse?: any) {
    const event = new CustomEvent('allways:start', {
      bubbles: true,
      cancelable: true,
      detail: {
        credential: credentialResponse?.credential ?? null,
      },
    });

    const notCancelled = document.dispatchEvent(event);

    if (
      notCancelled &&
      typeof window.onAllWaysStart === 'function'
    ) {
      window.onAllWaysStart(credentialResponse);
    }

    if (
      notCancelled &&
      typeof window.onAllWaysStart !== 'function'
    ) {
      console.info(
        '[AllWays landing] Signed in. No integration hook found yet ' +
          '(listen for "allways:start" on document, or define ' +
          'window.onAllWaysStart) — connect landingpage-filtering.component here.'
      );
    }
  }

  function handleGoogleScriptLoad() {
    if (
      !GOOGLE_CLIENT_ID ||
      !window.google?.accounts?.id ||
      !gSignInBtnRef.current
    ) {
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

    window.google.accounts.id.renderButton(
      gSignInBtnRef.current,
      {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
      }
    );

    setShowFallbackButton(false);
  }

  function handleFallbackClick() {
    if (
      GOOGLE_CLIENT_ID &&
      window.google?.accounts?.id
    ) {
      window.google.accounts.id.prompt();
      return;
    }

    console.info(
      '[AllWays landing] GOOGLE_CLIENT_ID not set yet — proceeding to the ' +
        'next screen without a real Google credential. Once the Client ID ' +
        'is added, this button will do real Google sign-in instead.'
    );

    goToFiltering();
  }

  return (
    <main className={styles.hero}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={handleGoogleScriptLoad}
      />

      <div className={styles.heroInner}>
        <Image
          className={styles.heroLogo}
          src="/allways-logo.png"
          alt="AllWays"
          width={160}
          height={40}
          priority
          draggable={false}
        />

        <h1 className={styles.heroSlogan}>
          Always, AllWays.
        </h1>

        <div
          className={styles.greeting}
          aria-live="polite"
        >
          <span
            ref={greetingRef}
            className={`${styles.greetingText} ${
              greetingHidden
                ? styles.greetingTextHidden
                : ''
            }`}
          >
            {GREETINGS[greetingIndex]}
          </span>
        </div>

        <div className={styles.googleSignin}>
          <div ref={gSignInBtnRef} />

          {showFallbackButton && (
            <button
              className={styles.googleBtnFallback}
              type="button"
              onClick={handleFallbackClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.6154z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5831-5.0359-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.9641 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9641 10.71z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9641 7.29C4.6718 5.1627 6.6564 3.5795 9 3.5795z"
                />
              </svg>

              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        <p className={styles.heroStats}>
          n people around the world have joined.
        </p>
      </div>

      <svg
        className={styles.heroMapBg}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="#C7CCD6"
          strokeWidth="1.5"
          opacity="0.16"
          strokeLinecap="round"
        >
          <path d="M -50 120 L 300 120 L 300 260 L 700 260 L 700 140 L 1500 140" />
          <path d="M -50 380 L 220 380 L 220 500 L 600 500 L 600 420 L 1000 420 L 1000 560 L 1500 560" />
          <path d="M -50 700 L 400 700 L 400 640 L 850 640 L 850 760 L 1500 760" />
          <path d="M 150 -50 L 150 300 L 260 300 L 260 700 L 150 700 L 150 950" />
          <path d="M 480 -50 L 480 220 L 600 220 L 600 600 L 520 600 L 520 950" />
          <path d="M 820 -50 L 820 350 L 920 350 L 920 750 L 1000 750 L 1000 950" />
          <path d="M 1150 -50 L 1150 260 L 1080 260 L 1080 620 L 1200 620 L 1200 950" />
        </g>

        <path
          d="M -50 500 L 1500 260"
          fill="none"
          stroke="#C7CCD6"
          strokeWidth="1.5"
          opacity="0.14"
        />

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

        <g
          transform="translate(160 268) scale(0.85)"
          opacity="0.45"
        >
          <path
            d="M0 0C-11 0-20 9-20 20c0 15 20 36 20 36s20-21 20-36C20 9 11 0 0 0z"
            fill="#FF8040"
          />
          <circle
            cx="0"
            cy="19"
            r="7"
            fill="#F0F2F5"
          />
        </g>

        <g
          transform="translate(1290 608) scale(0.85)"
          opacity="0.45"
        >
          <path
            d="M0 0C-11 0-20 9-20 20c0 15 20 36 20 36s20-21 20-36C20 9 11 0 0 0z"
            fill="#0046FF"
          />
          <circle
            cx="0"
            cy="19"
            r="7"
            fill="#F0F2F5"
          />
        </g>

        <circle
          cx="60"
          cy="600"
          r="5"
          fill="#FF8040"
          opacity="0.4"
        />
      </svg>
    </main>
  );
}
