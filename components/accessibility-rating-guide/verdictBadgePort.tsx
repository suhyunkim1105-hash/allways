/**
 * Verdict badge — scoped React port
 * Ported from: components/verdict-badge/verdict-badge.js + verdict-badge.css
 * (owner 명진). That component is plain JS/CSS with no build step, meant to
 * be dropped in via <script>/<link> or as a <verdict-badge> custom element.
 *
 * WHY THIS FILE EXISTS INSTEAD OF JUST IMPORTING THE ORIGINAL:
 * Next.js only allows importing *global* (non-Module) CSS from the root
 * App/Layout file. This repo doesn't have one yet (no app/ or pages/
 * folder — see README-NEXTJS.md), so a component nested under
 * components/ can't do `import '../verdict-badge/verdict-badge.css'`
 * without breaking the build. This file re-creates verdict-badge's
 * render()/renderWithTooltip() output as CSS-Module-scoped React
 * components instead — same status keys, labels, descriptions, icons,
 * colors, and sizes, byte-for-byte.
 *
 * DO NOT change a value here on its own — if verdict-badge.js/.css
 * changes, mirror the change here too. Once the team adds a root layout
 * that loads verdict-badge.css globally, this port can be deleted and
 * swapped for the real <verdict-badge> element or VerdictBadge.render().
 */
import styles from './verdictBadgePort.module.css';

export type VerdictStatus = 'accessible' | 'caution' | 'difficult';
export type VerdictSize = 'list' | 'card' | 'detail';

const VERDICTS: Record<VerdictStatus, { shortLabel: string; title: string; desc: string }> = {
  accessible: {
    shortLabel: 'All-Way',
    title: 'Accessible',
    desc: 'Fully accessible independently for all people.',
  },
  caution: {
    shortLabel: 'Step-Way',
    title: 'Caution needed',
    desc: 'Accessible, but assistance or caution may be required.',
  },
  difficult: {
    shortLabel: 'Re-Way',
    title: 'Difficult',
    desc: 'Restricted access due to barriers.',
  },
};

// Inline icon paths, copied 1:1 from verdict-badge.js's ICONS map.
function Icon({ status }: { status: VerdictStatus }) {
  if (status === 'accessible') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx={12} cy={12} r={10} fill="currentColor" />
        <path
          d="M7.2 12.5 10.3 15.6 17 8.6"
          fill="none"
          stroke="#fff"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'caution') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.7 22.3 21H1.7L12 2.7Z" fill="currentColor" />
        <rect x={11.05} y={8.6} width={1.9} height={6.2} rx={0.95} fill="#fff" />
        <rect x={11.05} y={16.2} width={1.9} height={1.9} rx={0.95} fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx={12} cy={12} r={10} fill="currentColor" />
      <rect x={6.5} y={11} width={11} height={2} rx={1} fill="#fff" />
    </svg>
  );
}

function sizeClass(size: VerdictSize) {
  return styles[`size_${size}`];
}
function statusClass(status: VerdictStatus) {
  return styles[`badge_${status}`];
}

function Pill({
  status,
  size = 'card',
  muted,
}: {
  status: VerdictStatus;
  size?: VerdictSize;
  muted?: boolean;
}) {
  const v = VERDICTS[status];
  return (
    <span
      className={[styles.badge, statusClass(status), sizeClass(size), muted ? styles.muted : '']
        .filter(Boolean)
        .join(' ')}
      tabIndex={0}
      role="status"
      aria-label={v.title}
    >
      <span className={styles.icon}>
        <Icon status={status} />
      </span>
      <span className={styles.label}>{v.shortLabel}</span>
    </span>
  );
}

/** Badge only — matches VerdictBadge.render(status, opts). */
export function VerdictBadge({
  status,
  size = 'card',
  muted,
}: {
  status: VerdictStatus;
  size?: VerdictSize;
  muted?: boolean;
}) {
  return <Pill status={status} size={size} muted={muted} />;
}

/** Badge + hover/focus detail tooltip — matches VerdictBadge.renderWithTooltip(status, opts). */
export function VerdictBadgeWithTooltip({
  status,
  size = 'card',
}: {
  status: VerdictStatus;
  size?: VerdictSize;
}) {
  const v = VERDICTS[status];
  return (
    <span className={styles.wrap}>
      <Pill status={status} size={size} />
      <span className={styles.tip} role="tooltip">
        <p className={styles.tipTitle}>{v.title}</p>
        <p className={styles.tipDesc}>{v.desc}</p>
        <span className={styles.tipBadgeRow}>
          <Pill status={status} size={size} />
        </span>
      </span>
    </span>
  );
}
