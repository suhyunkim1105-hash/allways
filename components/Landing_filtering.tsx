import React, { useMemo, useRef, useState } from 'react';

// ============================================================================
// Onboarding & Filtering Flow — single-file React/TypeScript component
//
// Self-contained TSX port of the plain HTML/JS demo: same state machine,
// same swipe-only navigation rules, same calendar/date-range logic, same
// critical filtering rule. No external CSS file or context/provider is
// required — styles are injected via a <style> tag scoped to this
// component's root class, and state lives in local `useState`.
//
// Usage:
//   import { OnboardingFlow } from './OnboardingFlow';
//   <OnboardingFlow onFinish={(state) => { /* navigate to Map/Main page */ }} />
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Types & static option data (English labels only)
// ----------------------------------------------------------------------------

export type AccessibilityCondition =
  | 'WHEELCHAIR_USER'
  | 'STROLLER_INFANT_COMPANION'
  | 'SENIOR'
  | 'PREGNANT_WOMAN'
  | 'HEARING_IMPAIRED';

export type TravelPreference =
  | 'HISTORY_HERITAGE'
  | 'ARTS_CULTURE'
  | 'NATURE_LEISURE'
  | 'SHOPPING_ENTERTAINMENT';

export interface TravelSchedule {
  startDate: string | null; // 'YYYY-MM-DD'
  endDate: string | null;
}

export interface OnboardingState {
  currentStep: number; // 0 | 1 | 2
  accessibilityConditions: AccessibilityCondition[];
  travelPreferences: TravelPreference[];
  travelSchedule: TravelSchedule;
  isComplete: boolean;
}

export interface Place {
  id: string;
  name: string;
  categories: TravelPreference[];
  accessibilityFeatures: AccessibilityCondition[];
}

interface OptionMeta<T extends string> {
  value: T;
  label: string;
}

const ACCESSIBILITY_OPTIONS: OptionMeta<AccessibilityCondition>[] = [
  { value: 'WHEELCHAIR_USER', label: 'Wheelchair User' },
  { value: 'STROLLER_INFANT_COMPANION', label: 'Stroller / Infant Companion' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'PREGNANT_WOMAN', label: 'Pregnant Woman' },
  { value: 'HEARING_IMPAIRED', label: 'Hearing Impaired' },
];

const TRAVEL_PREFERENCE_OPTIONS: OptionMeta<TravelPreference>[] = [
  { value: 'HISTORY_HERITAGE', label: 'History & Heritage' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
  { value: 'NATURE_LEISURE', label: 'Nature & Leisure' },
  { value: 'SHOPPING_ENTERTAINMENT', label: 'Shopping & Entertainment' },
];

const TOTAL_STEPS = 3;

interface StepMeta {
  title: string;
  subtitle: string;
  requiresSelection: boolean;
}

// Only the travel schedule (Step 3) is fully optional — every other step
// requires a minimum of one selection. Step 3 has no separate "Skip"
// action: its Continue button is simply always enabled regardless of what's
// picked. The subtitle text already states the "select at least one"
// requirement, so no separate validation-hint element is rendered below
// the cards.
const STEP_META: StepMeta[] = [
  {
    title: 'Select all mobility options that apply to you.',
    subtitle:
      'This helps us personalize accessible route recommendations. Select at least one option to continue.',
    requiresSelection: true,
  },
  {
    title: 'Select your travel preferences.',
    subtitle: 'Choose the categories you enjoy most. Select at least one option to continue.',
    requiresSelection: true,
  },
  {
    title: 'When are you traveling?',
    subtitle: 'Pick your travel dates, or continue without them.',
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
// 2. Mock domain data + the critical filter function
//
// Rule: an empty selection in Step 1 (or Step 2) means that dimension is NOT
// used to exclude any place. If BOTH are empty, ALL places are returned.
// Step 3 (dates) never participates in filtering, populated or not.
// When a dimension IS active: selections within it are OR'd; the two
// dimensions are AND'd together.
//
// There is no "Recommended Places" view rendered by this component — the
// real destination after onboarding is a separate Map / Main app page
// (see NextPagePlaceholder below). `filterPlaces`/`MOCK_PLACES` are
// exported here purely as a reusable utility for whichever page ends up
// consuming the finished OnboardingState.
// ----------------------------------------------------------------------------

export const MOCK_PLACES: Place[] = [
  {
    id: 'p1',
    name: 'Grand Historic Palace',
    categories: ['HISTORY_HERITAGE'],
    accessibilityFeatures: ['WHEELCHAIR_USER', 'SENIOR'],
  },
  {
    id: 'p2',
    name: 'Modern Art Museum',
    categories: ['ARTS_CULTURE'],
    accessibilityFeatures: ['WHEELCHAIR_USER', 'HEARING_IMPAIRED'],
  },
  {
    id: 'p3',
    name: 'Riverside Nature Trail',
    categories: ['NATURE_LEISURE'],
    accessibilityFeatures: ['STROLLER_INFANT_COMPANION', 'SENIOR'],
  },
  {
    id: 'p4',
    name: 'Downtown Shopping District',
    categories: ['SHOPPING_ENTERTAINMENT'],
    accessibilityFeatures: [],
  },
  {
    id: 'p5',
    name: 'Old Town Walking Route',
    categories: ['HISTORY_HERITAGE', 'ARTS_CULTURE'],
    accessibilityFeatures: ['PREGNANT_WOMAN'],
  },
  {
    id: 'p6',
    name: 'Botanical Gardens',
    categories: ['NATURE_LEISURE'],
    accessibilityFeatures: ['WHEELCHAIR_USER', 'STROLLER_INFANT_COMPANION', 'PREGNANT_WOMAN'],
  },
  {
    id: 'p7',
    name: 'Night Market Entertainment Street',
    categories: ['SHOPPING_ENTERTAINMENT'],
    accessibilityFeatures: ['HEARING_IMPAIRED'],
  },
  {
    id: 'p8',
    name: 'Contemporary Theater District',
    categories: ['ARTS_CULTURE', 'SHOPPING_ENTERTAINMENT'],
    accessibilityFeatures: [],
  },
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
// 3. Calendar / schedule logic — pure functions, no DOM (Step 3)
//
// Range-selection state machine:
//   - Clicking a day when nothing is selected (or when a completed
//     multi-day range already exists) starts a fresh single-day selection
//     — a lone day is itself a valid, complete "same-day" schedule if the
//     user stops there.
//   - Clicking a second day while exactly one day is selected extends the
//     choice into a continuous range covering every date in between,
//     regardless of direction.
//   - Clicking the same single day again is a no-op.
// ----------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toISODate(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function firstWeekdayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
}

export function selectScheduleDay(current: TravelSchedule, dateStr: string): TravelSchedule {
  const { startDate, endDate } = current;
  const nothingSelected = startDate === null;
  const hasCompleteRange = startDate !== null && endDate !== null && startDate !== endDate;

  if (nothingSelected || hasCompleteRange) {
    return { startDate: dateStr, endDate: dateStr };
  }

  // Exactly one day is currently selected (startDate === endDate) — extend.
  if (dateStr < startDate) {
    return { startDate: dateStr, endDate: startDate };
  }
  if (dateStr > startDate) {
    return { startDate, endDate: dateStr };
  }
  return { startDate, endDate: startDate }; // same day again — no-op
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function formatScheduleSummary(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return 'No travel dates selected yet.';
  if (startDate === endDate) return `Your travel schedule: ${formatDisplayDate(startDate)}`;
  return `Your travel schedule: ${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
}

// ----------------------------------------------------------------------------
// 4. Structural-only styles (+ APHont font stack), injected via a <style>
// tag scoped under `.onboarding-flow-root` so embedding this component
// doesn't leak rules onto the host page. No external CSS file needed.
// ----------------------------------------------------------------------------

const STYLES = `
.onboarding-flow-root {
  font-family: "APHont", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.onboarding-flow-root .onboarding-flow {
  min-height: 100vh; /* keeps the whole viewport a valid swipe/drag hit-area */
  display: flex;
  flex-direction: column;
}
.onboarding-flow-root .onboarding-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.onboarding-flow-root .progress-track {
  flex: 1;
  height: 4px;
}
.onboarding-flow-root .progress-fill {
  height: 100%;
}
.onboarding-flow-root .step-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.onboarding-flow-root .card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.onboarding-flow-root .selectable-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.onboarding-flow-root .selectable-card--full-width {
  grid-column: 1 / -1;
}
.onboarding-flow-root .check-icon {
  display: inline-block;
  min-width: 1em;
}
.onboarding-flow-root .bottom-actions {
  margin-top: auto;
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 8px;
}
.onboarding-flow-root .bottom-actions button {
  flex: 1;
}
/* A moderate, self-contained block — NOT stretched to fill the viewport.
   Capped width + centered, so it reads as one balanced component within
   the screen rather than an edge-to-edge grid. */
.onboarding-flow-root .calendar {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}
.onboarding-flow-root .calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.onboarding-flow-root .calendar-weekdays,
.onboarding-flow-root .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.onboarding-flow-root .calendar-cell {
  aspect-ratio: 1 / 1;
}
.onboarding-flow-root .calendar-cell--blank {
  visibility: hidden;
}
.onboarding-flow-root .swipe-hint {
  margin-top: auto;
}
`;

// ----------------------------------------------------------------------------
// 5. Small presentational subcomponents
// ----------------------------------------------------------------------------

interface CardGroupProps<T extends string> {
  options: OptionMeta<T>[];
  selectedValues: T[];
  onToggle: (value: T) => void;
  groupLabel: string;
}

function CardGroup<T extends string>({ options, selectedValues, onToggle, groupLabel }: CardGroupProps<T>) {
  const isOddCount = options.length % 2 !== 0;
  return (
    <div className="card-grid" role="group" aria-label={groupLabel}>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        const isLastOddItem = isOddCount && index === options.length - 1;
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            data-selected={isSelected}
            data-value={option.value}
            className={`selectable-card${isLastOddItem ? ' selectable-card--full-width' : ''}`}
            onClick={() => onToggle(option.value)}
          >
            <span>{option.label}</span>
            <span className="check-icon" aria-hidden="true">
              {isSelected ? '✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface CalendarProps {
  year: number;
  month: number; // 0-indexed
  schedule: TravelSchedule;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dateStr: string) => void;
}

function Calendar({ year, month, schedule, onPrevMonth, onNextMonth, onSelectDay }: CalendarProps) {
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayOfMonth(year, month);
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(<span key={`blank-${i}`} className="calendar-cell calendar-cell--blank" />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = toISODate(year, month, day);
    const isEndpoint = dateStr === schedule.startDate || dateStr === schedule.endDate;
    const isInRange =
      !!schedule.startDate && !!schedule.endDate && dateStr > schedule.startDate && dateStr < schedule.endDate;

    cells.push(
      <button
        key={dateStr}
        type="button"
        className="calendar-cell"
        data-testid={`calendar-day-${dateStr}`}
        data-selected={isEndpoint || isInRange}
        data-range-endpoint={isEndpoint}
        aria-pressed={isEndpoint || isInRange}
        onClick={() => onSelectDay(dateStr)}
      >
        {day}
        {isEndpoint ? ' ●' : isInRange ? ' -' : ''}
      </button>,
    );
  }

  return (
    <div className="calendar" data-testid="calendar">
      <div className="calendar-header">
        <button type="button" aria-label="Previous month" data-testid="calendar-prev" onClick={onPrevMonth}>
          ◀
        </button>
        <span>
          {MONTH_NAMES[month]} {year}
        </span>
        <button type="button" aria-label="Next month" data-testid="calendar-next" onClick={onNextMonth}>
          ▶
        </button>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid">{cells}</div>
    </div>
  );
}

// The real destination after onboarding is a separate Map / Main app page
// being built by another developer — it is not implemented in this
// deliverable. This placeholder simply confirms the transition fired.
function NextPagePlaceholder({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="onboarding-flow-root">
      <style>{STYLES}</style>
      <h2>Onboarding Complete</h2>
      <p data-testid="next-page-placeholder">
        This is a placeholder for the Map / Main app page, which is being built separately and is not yet
        implemented here.
      </p>
      <button type="button" onClick={onRestart}>
        Restart Onboarding
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 6. OnboardingFlow — the main component
//
// Navigation:
//   - Steps 1 & 2: swipe-only, no on-screen buttons. Swipe left advances
//     (gated by canAdvance — >=1 selection required); swipe right goes
//     back (never gated). Mouse drag works identically to a touch swipe,
//     for demoing on a desktop with no touchscreen.
//   - Step 3 (travel schedule): swipe left is DISABLED here — forward
//     navigation/completion on the final step is Continue-button-only.
//     Swipe right (back) still works. There's no "Skip" action — Step 3's
//     requiresSelection is false, so Continue is simply always enabled
//     there regardless of whether any dates were picked.
// ----------------------------------------------------------------------------

export interface OnboardingFlowProps {
  /** Invoked once when the user finishes the last step (Continue on Step 3) */
  onFinish?: (state: OnboardingState) => void;
}

const SWIPE_THRESHOLD = 50;

function getTodayView(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onFinish }) => {
  const [state, setState] = useState<OnboardingState>(createInitialState);
  const [calendarView, setCalendarView] = useState(getTodayView);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const isLastStep = state.currentStep === TOTAL_STEPS - 1;
  const currentMeta = STEP_META[state.currentStep];
  const progressPercent = ((state.currentStep + 1) / TOTAL_STEPS) * 100;

  // Only Step 3 (travel schedule) may be left empty. Every other step
  // requires at least one selection before the user can proceed.
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

  const setSchedule = (startDate: string | null, endDate: string | null) => {
    setState((prev) => ({ ...prev, travelSchedule: { startDate, endDate } }));
  };

  const handleSelectDay = (dateStr: string) => {
    const next = selectScheduleDay(state.travelSchedule, dateStr);
    setSchedule(next.startDate, next.endDate);
  };

  const goToPrevMonth = () => {
    setCalendarView((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 },
    );
  };

  const goToNextMonth = () => {
    setCalendarView((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 },
    );
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, currentStep: clampStep(prev.currentStep - 1) }));
  };

  // On the last step, "advancing" means completing onboarding: sets
  // isComplete and invokes onFinish with the final state. Called by the
  // Continue button's onClick, and (on Steps 1/2 only) by swipe-left.
  const advanceOrFinish = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      const finalState: OnboardingState = { ...state, isComplete: true };
      setState(finalState);
      onFinish?.(finalState);
    } else {
      setState((prev) => ({ ...prev, currentStep: clampStep(prev.currentStep + 1) }));
    }
  };

  const resetOnboarding = () => {
    setState(createInitialState());
    setCalendarView(getTodayView());
  };

  const resolveSwipe = (deltaX: number, deltaY: number) => {
    // Ignore short drags and mostly-vertical gestures (page scroll).
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      // swipe/drag left -> forward, but NOT on the final step — forward
      // navigation/completion there is Continue-button-only.
      if (!isLastStep) {
        advanceOrFinish();
      }
    } else {
      prevStep(); // swipe/drag right -> back (always allowed, every step)
    }
  };

  // Real touchstart/touchend events only fire on an actual touch screen (or
  // with DevTools touch emulation) — a plain mouse drag does NOT trigger
  // them. resolveSwipe() is wired to BOTH touch and mouse events so a
  // click-drag-release with the mouse performs the identical navigation,
  // for demoing on a desktop with no touchscreen.
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - dragStart.current.x;
    const deltaY = touch.clientY - dragStart.current.y;
    dragStart.current = null;
    resolveSwipe(deltaX, deltaY);
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    dragStart.current = null;
    resolveSwipe(deltaX, deltaY);
  };

  if (state.isComplete) {
    return <NextPagePlaceholder onRestart={resetOnboarding} />;
  }

  return (
    <div className="onboarding-flow-root">
      <style>{STYLES}</style>
      <div
        className="onboarding-flow"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* --- Header: progress bar only --- */}
        <div className="onboarding-header">
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${state.currentStep + 1} of ${TOTAL_STEPS}`}
          >
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* --- Title area --- */}
        <div className="step-heading">
          <h2>{currentMeta.title}</h2>
          <p>{currentMeta.subtitle}</p>
        </div>

        {/* --- Active step content --- */}
        {state.currentStep === 0 && (
          <CardGroup
            options={ACCESSIBILITY_OPTIONS}
            selectedValues={state.accessibilityConditions}
            onToggle={toggleAccessibility}
            groupLabel="Accessibility condition options"
          />
        )}
        {state.currentStep === 1 && (
          <CardGroup
            options={TRAVEL_PREFERENCE_OPTIONS}
            selectedValues={state.travelPreferences}
            onToggle={togglePreference}
            groupLabel="Travel preference options"
          />
        )}
        {state.currentStep === 2 && (
          <>
            <Calendar
              year={calendarView.year}
              month={calendarView.month}
              schedule={state.travelSchedule}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
              onSelectDay={handleSelectDay}
            />
            <p data-testid="schedule-summary">
              {formatScheduleSummary(state.travelSchedule.startDate, state.travelSchedule.endDate)}
            </p>
          </>
        )}

        {/* --- Navigation: swipe-only hint text on Steps 1 & 2 (no buttons);
             a single "Continue" button only on the final step (Step 3) --- */}
        {isLastStep ? (
          <>
            {state.currentStep > 0 && (
              <p className="swipe-hint" data-testid="swipe-hint">
                Swipe right to go back.
              </p>
            )}
            <div className="bottom-actions">
              <button
                type="button"
                onClick={advanceOrFinish}
                disabled={!canAdvance}
                aria-disabled={!canAdvance}
                data-testid="continue-button"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <p className="swipe-hint" data-testid="swipe-hint">
            {state.currentStep > 0 ? 'Swipe left to continue, swipe right to go back.' : 'Swipe left to continue.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
