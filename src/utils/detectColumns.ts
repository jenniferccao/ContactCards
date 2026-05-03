
import type { ColumnMapping, ContactField } from '../types/contact';


const FILLER_WORDS = [
  'your', 'please', 'enter', 'provide', 'give', 'type',
  'what', 'is', 'are', 'the', 'a', 'an',
  'full', // kept only for specific "full name" logic — stripped as filler elsewhere
  'best', 'preferred', 'primary', 'personal', 'work', 'school',
  'contact', 'information', 'info', 'details', 'address',
  'number', // removed as filler so "phone number" → "phone" not "phone number"
];


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


function normalizeLight(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}



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


type ScoredKeywords = [keyword: string, score: number][];

const SCORES: Record<ContactField, ScoredKeywords> = {
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

  email: [
    ['email address',      10],
    ['email',               9],
    ['e-mail',              9],
    ['emailaddress',        9],
    ['mail',                5],
  ],

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

  title: [
    ['job title',          10],
    ['jobtitle',           10],
    ['position',            9],
    ['designation',         9],
    ['occupation',          8],
    ['profession',          8],
    ['role',                8],
    ['job',                 7],
    ['title',               9],
  ],
};


const PENALTIES: Partial<Record<ContactField, string[]>> = {
  fullName: ['first', 'last', 'given', 'family', 'surname', 'fname', 'lname'],
  firstName: ['last', 'family', 'surname'],
  lastName:  ['first', 'given', 'forename'],
};

const PENALTY_AMOUNT = 8;



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

export interface DetectionResult {
  firstName: string | null;
  lastName:  string | null;
  fullName:  string | null;
  phone:     string | null;
  email:     string | null;
  company:   string | null;
  title:     string | null;
}

export function detectColumns(headers: string[]): DetectionResult {
  // Score all six fields independently (greedy top-pick per field)
  const taken = new Set<string>(); // headers already claimed

  // Score fields in priority order: specific before generic
  const order: ContactField[] = [
    'email',
    'phone',
    'title',
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
    title:     raw.title     ?? null,
  };
}


export const CONTACT_FIELDS: ContactField[] = [
  'firstName',
  'lastName',
  'fullName',
  'email',
  'phone',
  'company',
  'title',
];

export const FIELD_LABELS: Record<ContactField, string> = {
  firstName: 'First Name',
  lastName:  'Last Name',
  fullName:  'Full Name',
  email:     'Email',
  phone:     'Phone',
  company:   'Company / Org',
  title:     'Job Title',
};

