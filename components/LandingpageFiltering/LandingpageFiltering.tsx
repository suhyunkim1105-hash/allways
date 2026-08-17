import React, { useMemo, useState } from 'react';
import './LandingpageFiltering.css';
import logoUrl from './assets/allways-logo.png';

// ============================================================================
// LandingpageFiltering
//
// Button-navigated (no swipe), 4-step onboarding matching the AllWays
// reference screens: Back (top-left) + logo (top-right), a 4-dot progress
// indicator, list-style mobility options, a 2x2 travel-interest card grid,
// a range-select calendar, and a new Step 4 "Your preferences" summary
// screen before handing off to the (separately-built) Map/Main app page.
//
// Design decisions worth flagging:
//   - Steps 1 & 2 still require >=1 selection before advancing — this was
//     an explicit hard rule from earlier in this project ("only the travel
//     schedule may be skipped; everything else needs at least one pick").
//   - There's no Skip button anywhere, bottom bar or otherwise. Step 3
//     (schedule) is still fully optional — Continue is always enabled there,
//     so pressing it with no date picked simply advances with an empty
//     schedule; there's no separate "Skip this step" affordance anymore.
//   - Step 4 (summary) has two distinct exits: "Show my personalized
//     routes" (bottom-right) completes onboarding using the collected
//     filters; the in-card "Show all routes" link completes onboarding but
//     signals the host app to show every route, unfiltered. Both call
//     `onFinish` — only the `useFilters` flag in the payload differs.
//   - "← Back" only renders from Step 2 onward — there's nothing earlier
//     than Step 1 to return to.
//   - The logo and font are the real assets provided (assets/allways-logo.png,
//     assets/APHontRegular.woff2, assets/APHontBold.woff2) — brand colors in
//     the stylesheet were sampled directly from the logo file.
//   - The whole flow is centered (horizontally + vertically) in the
//     viewport as a moderately-sized card rather than stretched edge-to-edge,
//     with an enlarged type/spacing scale throughout.
// ============================================================================

// ----------------------------------------------------------------------------
// Types & static option data
// ----------------------------------------------------------------------------

export type AccessibilityCondition =
  | 'SENIOR'
  | 'PREGNANT_WOMAN'
  | 'STROLLER_INFANT_COMPANION'
  | 'WHEELCHAIR_USER'
  | 'HEARING_IMPAIRED';

export type TravelPreference =
  | 'HISTORY_HERITAGE'
  | 'ARTS_CULTURE'
  | 'NATURE_LEISURE'
  | 'SHOPPING_ENTERTAINMENT';

export interface TravelSchedule {
  startDate: string | null;
  endDate: string | null;
}

export interface OnboardingState {
  currentStep: number; // 0..3
  accessibilityConditions: AccessibilityCondition[];
  travelPreferences: TravelPreference[];
  travelSchedule: TravelSchedule;
  isComplete: boolean;
}

export interface OnboardingResult {
  state: OnboardingState;
  /** false when the user chose "Skip" / "Show all routes" on Step 4 */
  useFilters: boolean;
}

export interface Place {
  id: string;
  name: string;
  categories: TravelPreference[];
  accessibilityFeatures: AccessibilityCondition[];
}

const MOBILITY_OPTIONS: { value: AccessibilityCondition; label: string }[] = [
  { value: 'SENIOR', label: 'Seniors' },
  { value: 'PREGNANT_WOMAN', label: 'Pregnant people' },
  { value: 'STROLLER_INFANT_COMPANION', label: 'Caregivers with infants' },
  { value: 'WHEELCHAIR_USER', label: 'Wheelchair users' },
  { value: 'HEARING_IMPAIRED', label: 'Deaf or hard-of-hearing users' },
];

const INTEREST_OPTIONS: {
  value: TravelPreference;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
}[] = [
  {
    value: 'HISTORY_HERITAGE',
    title: 'History & Heritage',
    description: 'Landmarks, ancient ruins, museums',
    icon: '🏛️',
    iconBg: '#ffe6d6',
  },
  {
    value: 'ARTS_CULTURE',
    title: 'Arts & Culture',
    description: 'Galleries, theaters, local craft',
    icon: '🖼️',
    iconBg: '#e4f3e6',
  },
  {
    value: 'NATURE_LEISURE',
    title: 'Nature & Leisure',
    description: 'Parks, coastal walks, botanics',
    icon: '🌿',
    iconBg: '#e4f3e6',
  },
  {
    value: 'SHOPPING_ENTERTAINMENT',
    title: 'Shopping & Entertainment',
    description: 'Boutiques, cinemas, markets',
    icon: '🛍️',
    iconBg: '#fde3ec',
  },
];

const TOTAL_STEPS = 4;

interface StepMeta {
  title: string;
  subtitle: string;
  requiresSelection: boolean;
}

const STEP_META: StepMeta[] = [
  { title: 'What are your mobility needs?', subtitle: 'Select all that apply', requiresSelection: true },
  { title: 'What interests you?', subtitle: 'Choose your preferred categories', requiresSelection: true },
  { title: 'When are you visiting?', subtitle: 'Optional — skip if you prefer', requiresSelection: false },
  {
    title: 'Your preferences',
    subtitle: 'We have customized your routes based on your profile',
    requiresSelection: false,
  },
];

function createInitialState(): OnboardingState {
  return {
    currentStep: 0,
    accessibilityConditions: [],
    travelPreferences: [],
    travelSchedule: { startDate: null, endDate: null },
    isComplete: false,
  };
}

function clampStep(step: number): number {
  return Math.min(Math.max(step, 0), TOTAL_STEPS - 1);
}

// ----------------------------------------------------------------------------
// Mock domain data + the critical filter function (kept as a utility for
// whichever page ends up consuming the finished OnboardingState — this
// component itself never renders a results/route list).
// ----------------------------------------------------------------------------

export const MOCK_PLACES: Place[] = [
  { id: 'p1', name: 'Grand Historic Palace', categories: ['HISTORY_HERITAGE'], accessibilityFeatures: ['WHEELCHAIR_USER', 'SENIOR'] },
  { id: 'p2', name: 'Modern Art Museum', categories: ['ARTS_CULTURE'], accessibilityFeatures: ['WHEELCHAIR_USER', 'HEARING_IMPAIRED'] },
  { id: 'p3', name: 'Riverside Nature Trail', categories: ['NATURE_LEISURE'], accessibilityFeatures: ['STROLLER_INFANT_COMPANION', 'SENIOR'] },
  { id: 'p4', name: 'Downtown Shopping District', categories: ['SHOPPING_ENTERTAINMENT'], accessibilityFeatures: [] },
  { id: 'p5', name: 'Old Town Walking Route', categories: ['HISTORY_HERITAGE', 'ARTS_CULTURE'], accessibilityFeatures: ['PREGNANT_WOMAN'] },
  { id: 'p6', name: 'Botanical Gardens', categories: ['NATURE_LEISURE'], accessibilityFeatures: ['WHEELCHAIR_USER', 'STROLLER_INFANT_COMPANION', 'PREGNANT_WOMAN'] },
  { id: 'p7', name: 'Night Market Entertainment Street', categories: ['SHOPPING_ENTERTAINMENT'], accessibilityFeatures: ['HEARING_IMPAIRED'] },
  { id: 'p8', name: 'Contemporary Theater District', categories: ['ARTS_CULTURE', 'SHOPPING_ENTERTAINMENT'], accessibilityFeatures: [] },
];

export interface FilterResult {
  places: Place[];
  appliedAccessibilityFilter: boolean;
  appliedCategoryFilter: boolean;
}

export function filterPlaces(state: OnboardingState, allPlaces: Place[]): FilterResult {
  const { accessibilityConditions, travelPreferences } = state;
  const appliedAccessibilityFilter = accessibilityConditions.length > 0;
  const appliedCategoryFilter = travelPreferences.length > 0;

  if (!appliedAccessibilityFilter && !appliedCategoryFilter) {
    return { places: [...allPlaces], appliedAccessibilityFilter, appliedCategoryFilter };
  }

  const places = allPlaces.filter((place) => {
    const matchesAccessibility =
      !appliedAccessibilityFilter ||
      accessibilityConditions.some((condition) => place.accessibilityFeatures.includes(condition));
    const matchesCategory =
      !appliedCategoryFilter || travelPreferences.some((pref) => place.categories.includes(pref));
    return matchesAccessibility && matchesCategory;
  });

  return { places, appliedAccessibilityFilter, appliedCategoryFilter };
}

// ----------------------------------------------------------------------------
// Calendar / schedule logic
// ----------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toISODate(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function selectScheduleDay(current: TravelSchedule, dateStr: string): TravelSchedule {
  const { startDate, endDate } = current;
  const nothingSelected = startDate === null;
  const hasCompleteRange = startDate !== null && endDate !== null && startDate !== endDate;

  if (nothingSelected || hasCompleteRange) {
    return { startDate: dateStr, endDate: dateStr };
  }
  if (dateStr < startDate) {
    return { startDate: dateStr, endDate: startDate };
  }
  if (dateStr > startDate) {
    return { startDate, endDate: dateStr };
  }
  return { startDate, endDate: startDate };
}

/** Compact "Aug 18–25, 2026" / "Aug 18, 2026" style summary for the Step 4 pill. */
export function formatScheduleCompact(startDate: string | null, endDate: string | null): string | null {
  if (!startDate || !endDate) return null;
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  if (startDate === endDate) return `${MONTH_SHORT[sm - 1]} ${sd}, ${sy}`;
  if (sy === ey && sm === em) return `${MONTH_SHORT[sm - 1]} ${sd}–${ed}, ${sy}`;
  if (sy === ey) return `${MONTH_SHORT[sm - 1]} ${sd} – ${MONTH_SHORT[em - 1]} ${ed}, ${sy}`;
  return `${MONTH_SHORT[sm - 1]} ${sd}, ${sy} – ${MONTH_SHORT[em - 1]} ${ed}, ${ey}`;
}

/** Full 6-week (42-cell) grid so the card height stays constant across months. */
function getCalendarGridDays(year: number, monthIndex: number): Date[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startWeekday);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

// ----------------------------------------------------------------------------
// Logo — the real AllWays wordmark (assets/allways-logo.png, transparent
// background). Brand colors used throughout this stylesheet (--brand-blue,
// --brand-orange) were sampled directly from this file.
// ----------------------------------------------------------------------------

function AllWaysLogo() {
  return <img src={logoUrl} alt="AllWays" className="allways-logo-img" />;
}

// ----------------------------------------------------------------------------
// Presentational subcomponents
// ----------------------------------------------------------------------------

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="allways-progress-dots" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`allways-progress-dots__dot${i === current ? ' allways-progress-dots__dot--active' : ''}`} />
      ))}
    </div>
  );
}

function MobilityStep({
  selected,
  onToggle,
}: {
  selected: AccessibilityCondition[];
  onToggle: (value: AccessibilityCondition) => void;
}) {
  return (
    <div className="allways-list" role="group" aria-label="Mobility need options">
      {MOBILITY_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            data-value={option.value}
            className={`allways-list-row${isSelected ? ' allways-list-row--selected' : ''}`}
            onClick={() => onToggle(option.value)}
          >
            <span className="allways-list-row__left">
              <span className="allways-list-row__radio" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span>{option.label}</span>
            </span>
            {isSelected && <span className="allways-list-row__badge">Selected</span>}
          </button>
        );
      })}
    </div>
  );
}

function InterestsStep({
  selected,
  onToggle,
}: {
  selected: TravelPreference[];
  onToggle: (value: TravelPreference) => void;
}) {
  return (
    <div className="allways-card-grid" role="group" aria-label="Travel interest options">
      {INTEREST_OPTIONS.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            data-value={option.value}
            className={`allways-icon-card${isSelected ? ' allways-icon-card--selected' : ''}`}
            onClick={() => onToggle(option.value)}
          >
            <span className="allways-icon-card__check" aria-hidden="true">
              {isSelected ? '✓' : ''}
            </span>
            <span className="allways-icon-card__icon" style={{ background: option.iconBg }} aria-hidden="true">
              {option.icon}
            </span>
            <span className="allways-icon-card__title">{option.title}</span>
            <span className="allways-icon-card__desc">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScheduleStep({
  schedule,
  onSelectDay,
}: {
  schedule: TravelSchedule;
  onSelectDay: (dateStr: string) => void;
}) {
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const days = useMemo(() => getCalendarGridDays(view.year, view.month), [view.year, view.month]);

  const goToPrevMonth = () =>
    setView((prev) => (prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }));
  const goToNextMonth = () =>
    setView((prev) => (prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }));

  return (
    <>
      <div className="allways-calendar-card">
        <div className="allways-calendar-header">
          <button type="button" className="allways-calendar-nav-btn" aria-label="Previous month" data-testid="calendar-prev" onClick={goToPrevMonth}>
            ‹
          </button>
          <span>
            {MONTH_NAMES[view.month]} {view.year}
          </span>
          <button type="button" className="allways-calendar-nav-btn" aria-label="Next month" data-testid="calendar-next" onClick={goToNextMonth}>
            ›
          </button>
        </div>
        <div className="allways-calendar-weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="allways-calendar-grid" data-testid="calendar">
          {days.map((d) => {
            const isCurrentMonth = d.getMonth() === view.month;
            const dateStr = toISODate(d.getFullYear(), d.getMonth(), d.getDate());
            const isEndpoint = dateStr === schedule.startDate || dateStr === schedule.endDate;
            const isInRange =
              !!schedule.startDate && !!schedule.endDate && dateStr > schedule.startDate && dateStr < schedule.endDate;
            const classNames = [
              'allways-calendar-day',
              !isCurrentMonth && 'allways-calendar-day--muted',
              isInRange && 'allways-calendar-day--in-range',
              isEndpoint && 'allways-calendar-day--endpoint',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={dateStr}
                type="button"
                className={classNames}
                data-testid={`calendar-day-${dateStr}`}
                disabled={!isCurrentMonth}
                onClick={() => isCurrentMonth && onSelectDay(dateStr)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function SummaryStep({
  state,
  onShowAllRoutes,
}: {
  state: OnboardingState;
  onShowAllRoutes: () => void;
}) {
  const mobilityLabels = MOBILITY_OPTIONS.filter((o) => state.accessibilityConditions.includes(o.value)).map((o) => o.label);
  const interestLabels = INTEREST_OPTIONS.filter((o) => state.travelPreferences.includes(o.value)).map((o) => o.title);
  const scheduleLabel = formatScheduleCompact(state.travelSchedule.startDate, state.travelSchedule.endDate);

  return (
    <>
      <div className="allways-summary-card" data-testid="summary-card">
        <div className="allways-summary-section">
          <div className="allways-summary-section__label">Mobility</div>
          <div className="allways-summary-pills">
            {mobilityLabels.length > 0 ? (
              mobilityLabels.map((label) => (
                <span key={label} className="allways-pill">
                  {label}
                </span>
              ))
            ) : (
              <span className="allways-pill allways-pill--muted">No mobility needs selected</span>
            )}
          </div>
        </div>
        <div className="allways-summary-section">
          <div className="allways-summary-section__label">Categories</div>
          <div className="allways-summary-pills">
            {interestLabels.length > 0 ? (
              interestLabels.map((label) => (
                <span key={label} className="allways-pill">
                  {label}
                </span>
              ))
            ) : (
              <span className="allways-pill allways-pill--muted">No categories selected</span>
            )}
          </div>
        </div>
        <div className="allways-summary-section">
          <div className="allways-summary-section__label">Schedule</div>
          <div className="allways-summary-pills">
            <span className={`allways-pill${scheduleLabel ? '' : ' allways-pill--muted'}`}>
              {scheduleLabel ?? 'No dates selected'}
            </span>
          </div>
        </div>
      </div>
      <div className="allways-summary-footer">
        <button type="button" className="allways-summary-footer__link" data-testid="show-all-routes-link" onClick={onShowAllRoutes}>
          Show all routes
        </button>
        <p className="allways-summary-footer__hint">You can change these anytime in Settings</p>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------------

export interface LandingpageFilteringProps {
  /** Called once onboarding finishes — either via "Show my personalized
   * routes" (useFilters: true) or "Show all routes" (useFilters: false). */
  onFinish?: (result: OnboardingResult) => void;
}

export const LandingpageFiltering: React.FC<LandingpageFilteringProps> = ({ onFinish }) => {
  const [state, setState] = useState<OnboardingState>(createInitialState);
  const [useFilters, setUseFilters] = useState(true);

  const currentMeta = STEP_META[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === TOTAL_STEPS - 1;

  const canAdvance = useMemo(() => {
    if (!currentMeta.requiresSelection) return true;
    if (state.currentStep === 0) return state.accessibilityConditions.length > 0;
    if (state.currentStep === 1) return state.travelPreferences.length > 0;
    return true;
  }, [currentMeta.requiresSelection, state.currentStep, state.accessibilityConditions, state.travelPreferences]);

  const toggleAccessibility = (value: AccessibilityCondition) => {
    setState((prev) => ({
      ...prev,
      accessibilityConditions: prev.accessibilityConditions.includes(value)
        ? prev.accessibilityConditions.filter((v) => v !== value)
        : [...prev.accessibilityConditions, value],
    }));
  };

  const togglePreference = (value: TravelPreference) => {
    setState((prev) => ({
      ...prev,
      travelPreferences: prev.travelPreferences.includes(value)
        ? prev.travelPreferences.filter((v) => v !== value)
        : [...prev.travelPreferences, value],
    }));
  };

  const handleSelectDay = (dateStr: string) => {
    setState((prev) => ({ ...prev, travelSchedule: selectScheduleDay(prev.travelSchedule, dateStr) }));
  };

  const goBack = () => {
    setState((prev) => ({ ...prev, currentStep: clampStep(prev.currentStep - 1) }));
  };

  const finish = (filtersOn: boolean) => {
    const finalState: OnboardingState = { ...state, isComplete: true };
    setUseFilters(filtersOn);
    setState(finalState);
    onFinish?.({ state: finalState, useFilters: filtersOn });
  };

  const handleContinue = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      finish(true);
    } else {
      setState((prev) => ({ ...prev, currentStep: clampStep(prev.currentStep + 1) }));
    }
  };

  if (state.isComplete) {
    return (
      <div className="allways-flow">
        <div className="allways-flow__page">
          <div className="allways-redirect" data-testid="redirect-screen">
            <h2>Finding your routes…</h2>
            <p>{useFilters ? 'Applying your personalized preferences.' : 'Showing every available route.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="allways-flow">
      <div className="allways-flow__page">
        <div className="allways-header">
          {!isFirstStep && (
            <button type="button" className="allways-back" onClick={goBack} data-testid="back-button">
              ← Back
            </button>
          )}
          <AllWaysLogo />
        </div>

        <ProgressDots current={state.currentStep} total={TOTAL_STEPS} />

        <div className="allways-title-block">
          <h2>{currentMeta.title}</h2>
          <p>{currentMeta.subtitle}</p>
        </div>

        {state.currentStep === 0 && <MobilityStep selected={state.accessibilityConditions} onToggle={toggleAccessibility} />}
        {state.currentStep === 1 && <InterestsStep selected={state.travelPreferences} onToggle={togglePreference} />}
        {state.currentStep === 2 && (
          <ScheduleStep schedule={state.travelSchedule} onSelectDay={handleSelectDay} />
        )}
        {state.currentStep === 3 && (
          <SummaryStep state={state} onShowAllRoutes={() => finish(false)} />
        )}

        <div className="allways-bottom-bar">
          <button
            type="button"
            className="allways-continue-btn"
            data-testid="continue-button"
            disabled={!canAdvance}
            onClick={handleContinue}
          >
            {isLastStep ? 'Show my personalized routes' : 'Continue'} ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingpageFiltering;
