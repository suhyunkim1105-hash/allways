# AllWaysOnboardingFlow

A button-navigated, 4-step onboarding component matching the AllWays
reference screens (mobility needs → travel interests → travel schedule →
preferences summary), using the real AllWays logo and APHont font. Ready to
drop into a GitHub repo as-is:

```
AllWaysOnboardingFlow.tsx
AllWaysOnboardingFlow.css
assets.d.ts              (lets `tsc` type-check the PNG import; most
                           bundlers — Vite/webpack/CRA — don't need this)
assets/
  allways-logo.png        (real logo, transparent background)
  APHontRegular.woff2      (font-weight: 400)
  APHontBold.woff2         (font-weight: 700)
```

Keep the folder structure as-is (the `.tsx`/`.css` reference `./assets/...`
by relative path) — copy the whole thing into your repo, e.g.
`src/components/AllWaysOnboardingFlow/`.

## Usage

```tsx
import { AllWaysOnboardingFlow } from './AllWaysOnboardingFlow';

<AllWaysOnboardingFlow
  onFinish={({ state, useFilters }) => {
    // state: the finished OnboardingState (selections + schedule)
    // useFilters: true if "Show my personalized routes" was pressed,
    //             false if "Show all routes" was pressed instead
    // navigate to the Map / Main app page here
  }}
/>
```

No Context/Provider or extra CSS setup is required — the component manages
its own state via `useState` and imports its own stylesheet.

## What's implemented

- **Step 1 — Mobility needs**: list-style rows (Seniors, Pregnant people,
  Caregivers with infants, Wheelchair users, Deaf or hard-of-hearing users),
  each togglable, selected rows turn blue with a "Selected" badge. At least
  one selection is required to advance.
- **Step 2 — Travel interests**: 2×2 icon card grid (History & Heritage,
  Arts & Culture, Nature & Leisure, Shopping & Entertainment). At least one
  selection is required to advance.
- **Step 3 — Travel schedule**: a real calendar (6-week grid, so the card
  height stays constant across months). Click once for a same-day trip,
  click a second day to extend into a range in either direction. Fully
  optional — Continue is always enabled here, so pressing it with nothing
  picked simply advances with an empty schedule.
- **Step 4 — Your preferences**: a summary card listing the selected
  mobility, category, and schedule pills, with a "Show all routes" link and
  a "Show my personalized routes" primary button.
- **Navigation**: `← Back` (top-left, from Step 2 onward only — there's
  nothing before Step 1 to return to) and a bottom-right `Continue` /
  `Show my personalized routes` pill button. There is no "Skip" button
  anywhere in the bottom bar.
- **Progress**: 4-dot indicator instead of a progress bar.
- **Layout**: the whole flow is centered — both horizontally and vertically
  — in the viewport as a moderately-sized card, at an enlarged type/spacing
  scale, rather than stretched edge-to-edge.
- **Filtering utility**: `filterPlaces`/`MOCK_PLACES` are exported (same
  critical rule as before — an empty Step 1/2 selection means that
  dimension doesn't exclude any place) for whichever page ends up consuming
  the finished state. This component itself never renders a route/results
  list — after Step 4 it shows a lightweight "Finding your routes…"
  placeholder and calls `onFinish`.

## Design decisions worth knowing about

- **Mandatory selection is preserved.** Steps 1 & 2 still require at least
  one pick before advancing — this was an explicit rule from earlier in
  the project, and the reference screens didn't contradict it (both
  screenshots already show selections made).
- **No Skip button anywhere** — not in the bottom bar, and not as a
  separate in-card link either. Step 3 (schedule) is still fully optional:
  Continue is always enabled there, so pressing it with nothing picked
  simply advances with an empty schedule.
- **Two distinct Step 4 exits.** "Show my personalized routes" completes
  onboarding using the collected filters (`useFilters: true`); the in-card
  "Show all routes" link completes onboarding requesting every route,
  unfiltered (`useFilters: false`).
- **"← Back" only renders from Step 2 onward** — there's nothing earlier
  than Step 1 to return to, so no `onExit` callback is needed.
- **Logo and font are the real assets**, not a recreation — `assets/allways-logo.png`
  (transparent background) is rendered directly via `<img>`, and
  `assets/APHontRegular.woff2` / `APHontBold.woff2` are wired up via
  `@font-face` in the stylesheet (font-weight 400/700 respectively — every
  other weight in the CSS is normalized to one of these two, since no other
  weights were provided). Brand colors (`--brand-blue: #0158f5`,
  `--brand-orange: #fd7237`) were sampled directly from the logo file's
  pixels, not eyeballed.
- Font-family stack is `"APHont", "Helvetica Neue", Helvetica, Arial,
  sans-serif`, scoped to `.allways-flow` so it doesn't leak onto a host page
  when embedded. Falls back gracefully if the woff2 files are ever missing.

## Demo

`demo.html` (delivered alongside this component) is a fully self-contained,
offline interactive demo — React, ReactDOM, Babel, the real logo, and both
font files are all embedded inline, so it opens and runs in any browser
with no build step and no network access. It's a demo convenience only;
use the `.tsx`/`.css`/`assets/` files above for your actual project.

## Verified

Type-checked with `tsc --noEmit` (in strict mode) and exercised end-to-end
with `react-test-renderer`: no Skip button/link exists anywhere on any
step, `← Back` is absent on Step 1 and present on Steps 2-4,
mandatory-selection gating on Steps 1-2, calendar range selection,
Continue advancing correctly with an empty schedule, and both ways to
leave Step 4 ("Show my personalized routes" / "Show all routes"). Also
confirmed visually with Playwright screenshots across all four steps for
the centered/enlarged layout and the real logo/font rendering correctly.
