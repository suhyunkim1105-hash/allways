'use client';

/**
 * AllWays — Common Error Screen
 * Owner: Error state module only.
 *
 * This file does NOT modify, import, or depend on any other teammate's
 * file (LandingPage, FilterBar, verdict-badge, etc.). It follows the same
 * pattern as `components/LandingPage/`: a self-contained, reusable
 * component with its own local `assets/` and `fonts/`, meant to be
 * dropped into this repo's `components/` folder as-is.
 *
 * USAGE
 *   import ErrorScreen from '../components/ErrorScreen/ErrorScreen';
 *   export default function GlobalError() { return <ErrorScreen />; }
 *
 * This is a single, reusable "common error state" screen — not a specific
 * 404 page. Whoever wires up error boundaries / failed-load states across
 * the app (Next.js `error.tsx`, a fetch-failure fallback, etc.) can render
 * this same component everywhere, optionally overriding the copy and the
 * retry handler via props. Defaults match the approved copy exactly.
 */

import Image from 'next/image';
import localFont from 'next/font/local';
import styles from './ErrorScreen.module.css';
import logo from './assets/allways-logo.png';

const aphont = localFont({
  src: [
    { path: './fonts/APHont-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/APHont-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-aphont',
  display: 'swap',
});

export interface ErrorScreenProps {
  /** Heading text. Defaults to the approved copy. */
  title?: string;
  /** Supporting line under the heading. Defaults to the approved copy. */
  description?: string;
  /** Button label. Defaults to the approved copy. */
  buttonLabel?: string;
  /**
   * Called when the button is pressed. If not provided, the button falls
   * back to reloading the current page — the safest generic "try again"
   * behavior for a common error state with no page-specific context.
   */
  onRetry?: () => void;
}

export default function ErrorScreen({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  buttonLabel = 'Try Again',
  onRetry,
}: ErrorScreenProps) {
  function handleRetry() {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  }

  return (
    <main
      className={`${styles.errorScreen} ${aphont.variable}`}
      style={{
        fontFamily:
          'var(--font-aphont), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Helvetica, Arial, sans-serif',
      }}
    >
      <div className={styles.inner}>
        <Image
          className={styles.logo}
          src={logo}
          alt="AllWays logo"
          width={1991}
          height={695}
          priority
          draggable={false}
        />

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <button
          className={styles.retryButton}
          type="button"
          onClick={handleRetry}
        >
          {buttonLabel}
        </button>
      </div>
    </main>
  );
}
