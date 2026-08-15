'use client';

/**
 * AllWays — Accessibility Rating Guide
 * Owner: Genie (this screen only)
 *
 * Explains why a place is rated All-Way / Step-Way / Re-Way, using the
 * team's confirmed 6-criterion table. Reuses the shared verdict badge's
 * exact design/labels via a scoped port (see verdictBadgePort.tsx for
 * why) — components/verdict-badge/* itself is not read or modified by
 * this file.
 *
 * This repo doesn't have an app/ or pages/ folder yet (see
 * README-NEXTJS.md next to components/LandingPage/), so — like
 * LandingPage.tsx — this file is a reusable component, not a page/route
 * itself. Whoever wires up the real route just needs:
 *
 *   import AccessibilityRatingGuide from '../components/accessibility-rating-guide/AccessibilityRatingGuide';
 *   export default function Page() { return <AccessibilityRatingGuide />; }
 *
 * Data note: every value in CRITERIA below is copied verbatim from the
 * team's confirmed criteria table. Do not edit a value here without an
 * updated table from the team.
 */

import { useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import styles from './AccessibilityRatingGuide.module.css';
import logo from './assets/allways-logo.png';
import { VerdictBadge, VerdictBadgeWithTooltip, VerdictStatus } from './verdictBadgePort';

const aphont = localFont({
  src: [
    { path: './assets/fonts/APHont-Regular.woff2', weight: '400', style: 'normal' },
    { path: './assets/fonts/APHont-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-aphont',
  display: 'swap',
});

const TIERS: VerdictStatus[] = ['accessible', 'caution', 'difficult'];

// Topic icons (what the row is about — not a verdict). Verdict icons stay
// inside verdictBadgePort.tsx and are never redrawn here.
function TopicIcon({ criterionKey }: { criterionKey: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (criterionKey) {
    case 'threshold':
      return (
        <svg {...common}>
          <path d="M3 17h4v-3h4v-3h4v-3h4" />
        </svg>
      );
    case 'slope':
      return (
        <svg {...common}>
          <path d="M3 18h18" />
          <path d="M3 18 15 6" />
          <path d="M15 6h4v4" />
        </svg>
      );
    case 'passage-width':
      return (
        <svg {...common}>
          <path d="M4 12h16" />
          <path d="M4 12 8 8" />
          <path d="M4 12 8 16" />
          <path d="M20 12 16 8" />
          <path d="M20 12 16 16" />
        </svg>
      );
    case 'door':
      return (
        <svg {...common}>
          <rect x={5} y={3} width={12} height={18} rx={1} />
          <circle cx={14} cy={12} r={1} fill="currentColor" stroke="none" />
        </svg>
      );
    case 'turning-space':
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 1 3 6.2" />
          <path d="M4 18v-4h4" />
        </svg>
      );
    case 'restroom':
      return (
        <svg {...common}>
          <circle cx={17} cy={5} r={2} />
          <path d="M13 21v-6H9l2-6.5c.3-1 1-1.5 2-1.5s1.7.5 2 1.5L17 15" />
          <path d="M7 13a5 5 0 1 0 5 5" />
        </svg>
      );
    default:
      return null;
  }
}

type Criterion = {
  key: string;
  label: string;
  tiers: Record<VerdictStatus, string>;
};

// Confirmed criteria table — values copied verbatim from the team's
// approved table. Do not edit without an updated table from the team.
const CRITERIA: Criterion[] = [
  {
    key: 'threshold',
    label: 'Entrance & Floor Threshold',
    tiers: { accessible: '≤ 1 cm', caution: '> 1–2 cm', difficult: '> 2 cm' },
  },
  {
    key: 'slope',
    label: 'Ramp Slope',
    tiers: {
      accessible: '≤ 1:18 (3.18°)',
      caution: '> 1:18–1:12 (4.76°)',
      difficult: '> 1:12',
    },
  },
  {
    key: 'passage-width',
    label: 'Passage Width',
    tiers: { accessible: '≥ 1.2 m', caution: '≥ 0.9–<1.2 m', difficult: '< 0.9 m' },
  },
  {
    key: 'door',
    label: 'Door Type & Space',
    tiers: {
      accessible: 'Automatic / step-free sliding',
      caution: 'Hinged door with ≥0.6 m side space',
      difficult: 'Revolving / insufficient space',
    },
  },
  {
    key: 'turning-space',
    label: 'Turning Space',
    tiers: {
      accessible: '≥ 1.5 × 1.5 m',
      caution: '≥ 1.4 × 1.4–<1.5 × 1.5 m',
      difficult: '< 1.4 × 1.4 m',
    },
  },
  {
    key: 'restroom',
    label: 'Accessible Restroom',
    tiers: {
      accessible: '1.6 × 2.0 m + turning space',
      caution: 'Relaxed standard 1.0 × 1.8 m',
      difficult: 'Width < 0.9 m / threshold etc.',
    },
  },
];

function CriterionCard({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={`${styles.cardHead} ${open ? styles.isOpen : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.cardIcon}>
          <TopicIcon criterionKey={criterion.key} />
        </span>
        <span className={styles.cardTitle}>{criterion.label}</span>
        <span className={styles.cardChevron} aria-hidden="true">
          ›
        </span>
      </button>

      <div className={styles.chips}>
        {TIERS.map((status) => (
          <div key={status} className={`${styles.chip} ${styles[`chip_${status}`]}`}>
            <span className={styles.chipBadge}>
              <VerdictBadge status={status} size="list" />
            </span>
            <span className={styles.chipValue}>{criterion.tiers[status]}</span>
          </div>
        ))}
      </div>

      {open && <div className={styles.detail}>Criterion: {criterion.label}</div>}
    </div>
  );
}

export default function AccessibilityRatingGuide() {
  return (
    <div
      className={`${styles.page} ${aphont.variable}`}
      style={{
        fontFamily:
          'var(--font-aphont), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <Image
            className={styles.logo}
            src={logo}
            alt="AllWays logo"
            width={1991}
            height={695}
            priority
            draggable={false}
          />
          <div>
            <h1 className={styles.title}>Accessibility Rating Guide</h1>
            <p className={styles.subtitle}>
              See exactly why a place is rated All-Way, Step-Way, or Re-Way.
            </p>
          </div>
        </header>

        <section className={styles.legend} aria-label="Rating legend">
          {TIERS.map((status) => (
            <div key={status} className={styles.legendItem}>
              <VerdictBadgeWithTooltip status={status} size="detail" />
            </div>
          ))}
        </section>

        <section className={styles.cards} aria-label="Accessibility rating criteria">
          {CRITERIA.map((criterion) => (
            <CriterionCard key={criterion.key} criterion={criterion} />
          ))}
        </section>
      </div>
    </div>
  );
}
