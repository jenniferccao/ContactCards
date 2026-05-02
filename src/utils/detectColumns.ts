// ---------------------------------------------------------------------------
// detectColumns.ts — Robust, scoring-based column auto-detection
// ---------------------------------------------------------------------------
//
// Strategy
// --------
// 1. Normalize every header: strip emojis/symbols, lowercase, remove filler
//    words, collapse whitespace.
// 2. Score each (field, header) pair by summing keyword match weights.
// 3. For each field, pick the header with the highest score (ties broken by
//    shortest header — shorter = less noise).
// 4. Post-process: if both firstName AND lastName are confidently detected,
//    clear fullName; if only one "name" column exists, prefer fullName.
// ---------------------------------------------------------------------------

import type { ColumnMapping, ContactField } from '../types/contact';

// ── 1. Normalisation ────────────────────────────────────────────────────────

/** Words that add no semantic value in form headers. */
const FILLER_WORDS = [
  'your', 'please', 'enter', 'provide', 'give', 'type',
  'what', 'is', 'are', 'the', 'a', 'an',
  'full', // kept only for specific "full name" logic — stripped as filler elsewhere
  'best', 'preferred', 'primary', 'personal', 'work', 'school',
  'contact', 'information', 'info', 'details', 'address',
  'number', // removed as filler so "phone number" → "phone" not "phone number"
];

/**
 * Normalise a raw header string for scoring:
 *  - strip emojis / non-ASCII symbols
 *  - lowercase + trim
 *  - remove punctuation
 *  - remove filler words
 *  - collapse whitespace
 */
function normalize(raw: string): string {
  return raw
    // strip emoji and non-letter/digit/space characters
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    // lowercase
    .toLowerCase()
    .trim()
    // collapse multiple spaces
    .replace(/\s+/g, ' ')
    // remove filler words (whole words only)
    .split(' ')
    .filter((w) => w.length > 0 && !FILLER_WORDS.includes(w))
    .join(' ');
}

/**
 * A lighter normalisation that keeps "full" and "number" so we can still
 * detect "full name" and "phone number" as compound phrases before filler
 * removal. Used only for phrase-level matching.
 */
function normalizeLight(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// ── 2. Columns to always ignore ─────────────────────────────────────────────

const IGNORE_PATTERNS = [
  /timestamp/,
  /\bdate\b/,
  /\btime\b/,
  /\bid\b/,
  /\brow\b/,
  /comment/,
  /note/,
  /other/,
  /preference/,
  /feedback/,
  /response/,
  /\bq\d+\b/,   // Q1, Q2 …
];

function shouldIgnore(raw: string): boolean {
  const lc = raw.toLowerCase();
  return IGNORE_PATTERNS.some((re) => re.test(lc));
}

// ── 3. Scoring tables ───────────────────────────────────────────────────────

/**
 * Each entry: [keyword, score].
 * Scored against the *normalised* header (filler removed).
 * Higher score = stronger signal.
 */
type ScoredKeywords = [keyword: string, score: number][];

const SCORES: Record<ContactField, ScoredKeywords> = {
  // ── fullName ──────────────────────────────────────────────────────────────
  // Phrase matching is done against the light-normalised string (before filler
  // removal) so "full name" and "your name" still fire.
  fullName: [
    ['full name',          10],
    ['fullname',           10],
    ['legal name',          9],
    ['student name',        9],
    ['participant name',    9],
    ['member name',         9],
    ['attendee name',       9],
    ['name',                5],   // generic fallback
  ],

  // ── firstName ─────────────────────────────────────────────────────────────
  firstName: [
    ['first name',         10],
    ['firstname',          10],
    ['given name',         10],
    ['givenname',          10],
    ['forename',            9],
    ['fname',               9],
    ['first',               7],
    ['given',               7],
  ],

  // ── lastName ──────────────────────────────────────────────────────────────
  lastName: [
    ['last name',          10],
    ['lastname',           10],
    ['family name',        10],
    ['familyname',         10],
    ['surname',             9],
    ['lname',               9],
    ['last',                7],
    ['family',              7],
    ['sur',                 6],
  ],

  // ── email ─────────────────────────────────────────────────────────────────
  email: [
    ['email address',      10],
    ['email',               9],
    ['e-mail',              9],
    ['emailaddress',        9],
    ['mail',                5],
  ],

  // ── phone ─────────────────────────────────────────────────────────────────
  phone: [
    ['phone number',       10],
    ['mobile number',      10],
    ['cell number',        10],
    ['contact number',     10],
    ['phone',               9],
    ['mobile',              9],
    ['cell',                8],
    ['telephone',           8],
    ['whatsapp',            8],
    ['tel',                 7],
    ['reach',               4],   // "best number to reach you"
    ['call',                4],
  ],

  // ── company ───────────────────────────────────────────────────────────────
  company: [
    ['company name',       10],
    ['organization name',  10],
    ['organisation name',  10],
    ['company',             9],
    ['organization',        9],
    ['organisation',        9],
    ['employer',            9],
    ['workplace',           9],
    ['university',          8],
    ['school',              7],
    ['club',                7],
    ['team',                7],
    ['group',               7],
  ],
};

// ── 4. Penalty rules ────────────────────────────────────────────────────────

/**
 * Subtract from a field's score when the header contains these tokens.
 * Prevents "First Name" from matching fullName.
 */
const PENALTIES: Partial<Record<ContactField, string[]>> = {
  fullName: ['first', 'last', 'given', 'family', 'surname', 'fname', 'lname'],
  firstName: ['last', 'family', 'surname'],
  lastName:  ['first', 'given', 'forename'],
};

const PENALTY_AMOUNT = 8;

// ── 5. Score one (field, header) pair ───────────────────────────────────────

function scoreHeader(field: ContactField, raw: string): number {
  if (shouldIgnore(raw)) return 0;

  const norm      = normalize(raw);
  const normLight = normalizeLight(raw);   // for phrase detection
  let score = 0;

  for (const [kw, pts] of SCORES[field]) {
    // Check both the light form (catches "full name") and the stripped form
    if (normLight.includes(kw) || norm.includes(kw)) {
      score += pts;
    }
  }

  // Apply penalties
  const penaltyWords = PENALTIES[field] ?? [];
  for (const pw of penaltyWords) {
    if (norm.includes(pw) || normLight.includes(pw)) {
      score -= PENALTY_AMOUNT;
    }
  }

  return Math.max(score, 0);
}

// ── 6. Pick best header per field ───────────────────────────────────────────

const MIN_SCORE = 5; // below this threshold → no match

function pickBest(
  field: ContactField,
  headers: string[],
  taken: Set<string>,
): string | null {
  let bestHeader: string | null = null;
  let bestScore = MIN_SCORE - 1;

  for (const h of headers) {
    if (taken.has(h) || !h.trim()) continue;
    const s = scoreHeader(field, h);
    if (
      s > bestScore ||
      (s === bestScore && bestHeader !== null && h.length < bestHeader.length)
    ) {
      bestScore  = s;
      bestHeader = h;
    }
  }

  return bestHeader;
}

// ── 7. Public API ────────────────────────────────────────────────────────────

export interface DetectionResult {
  firstName: string | null;
  lastName:  string | null;
  fullName:  string | null;
  phone:     string | null;
  email:     string | null;
  company:   string | null;
}

/**
 * Auto-detect which spreadsheet column header best matches each ContactField.
 *
 * Returns null for any field that cannot be confidently detected.
 * The mapping UI lets the user correct mistakes.
 */
export function detectColumns(headers: string[]): DetectionResult {
  // Score all six fields independently (greedy top-pick per field)
  const taken = new Set<string>(); // headers already claimed

  // Score fields in priority order: specific before generic
  const order: ContactField[] = [
    'email',
    'phone',
    'company',
    'firstName',
    'lastName',
    'fullName',
  ];

  const raw: Partial<Record<ContactField, string | null>> = {};

  for (const field of order) {
    const winner = pickBest(field, headers, taken);
    raw[field] = winner;
    if (winner) taken.add(winner);
  }

  // ── Post-processing: name field logic ─────────────────────────────────────
  const hasFirst = raw.firstName != null;
  const hasLast  = raw.lastName  != null;

  if (hasFirst && hasLast) {
    // Both split name fields found → suppress fullName to avoid duplication
    raw.fullName = null;
  } else if (!hasFirst && !hasLast && raw.fullName == null) {
    // Neither split nor full name detected → try fullName with no penalty
    // (catches a lone "Name" column that scored below MIN_SCORE due to low weight)
    const looseNameHeader = headers.find((h) => {
      const n = normalizeLight(h);
      return (
        (n.includes('name') || normalize(h).includes('name')) &&
        !shouldIgnore(h) &&
        !taken.has(h)
      );
    });
    raw.fullName = looseNameHeader ?? null;
  }

  return {
    firstName: raw.firstName ?? null,
    lastName:  raw.lastName  ?? null,
    fullName:  raw.fullName  ?? null,
    phone:     raw.phone     ?? null,
    email:     raw.email     ?? null,
    company:   raw.company   ?? null,
  };
}

// ── 8. UI metadata ───────────────────────────────────────────────────────────

/** All ContactField keys in the order they should appear in the mapping UI. */
export const CONTACT_FIELDS: ContactField[] = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'company',
];

/** Human-readable labels for each ContactField, used in the mapping UI. */
export const FIELD_LABELS: Record<ContactField, string> = {
  firstName: 'First Name',
  lastName:  'Last Name',
  fullName:  'Full Name',
  email:     'Email',
  phone:     'Phone',
  company:   'Company / Org',
};
