// ---------------------------------------------------------------------------
// buttons.ts — Shared button class strings used across all steps
//
// Three tiers:
//   btnPrimary  — solid navy, lavender hover (main CTA)
//   btnSecondary — ghost outline, fills on hover (back / secondary action)
//   btnText      — no border, faint text (low-priority action)
// ---------------------------------------------------------------------------

export const NAVY = '#0d0d5e';

/** Full-width primary action button */
export const btnPrimary =
  'w-full py-3.5 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-transparent bg-[#0d0d5e] text-white ' +
  'transition-all duration-150 ' +
  'hover:bg-[#e9e9f7] hover:border-[#0d0d5e] hover:text-[#0d0d5e] ' +
  'active:scale-[0.98] active:opacity-80 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

/** Full-width secondary / back button */
export const btnSecondary =
  'w-full py-3.5 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-[#0d0d5e]/25 text-[#0d0d5e]/55 ' +
  'transition-all duration-150 ' +
  'hover:border-[#0d0d5e]/70 hover:text-[#0d0d5e] ' +
  'active:scale-[0.98] active:opacity-80';

/** Inline text-only tertiary button (no border, no background) */
export const btnText =
  'text-xs font-semibold py-2 ' +
  'transition-opacity duration-150 hover:opacity-100';

/** Narrow fixed-width pill button — used for format selection (CSV / XLSX) */
export const btnPill =
  'w-36 py-3.5 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-transparent bg-[#0d0d5e] text-white ' +
  'transition-all duration-150 ' +
  'hover:bg-[#e9e9f7] hover:border-[#0d0d5e] hover:text-[#0d0d5e] ' +
  'active:scale-[0.98] active:opacity-80 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

/** Tiny inline remove button next to a field label */
export const btnRemove =
  'text-[10px] font-semibold uppercase tracking-wider ' +
  'transition-all duration-150 ' +
  'hover:opacity-100';
