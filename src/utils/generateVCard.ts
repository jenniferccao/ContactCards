
import type { Contact, ColumnMapping } from '../types/contact';



/**
 * Extract a Contact from one spreadsheet row using the confirmed mapping.
 * Returns an object with only the fields that have a non-empty value.
 */
export function rowToContact(
  row: Record<string, string>,
  mapping: ColumnMapping,
): Contact {
  const get = (field: keyof ColumnMapping): string => {
    const col = mapping[field];
    return col ? (row[col] ?? '').trim() : '';
  };

  const contact: Contact = {};

  const fn  = get('firstName');
  const ln  = get('lastName');
  const full = get('fullName');
  const email   = get('email');
  const phone   = get('phone');
  const company = get('company');
  const title   = get('title');

  if (fn)      contact.firstName = fn;
  if (ln)      contact.lastName  = ln;
  if (full)    contact.fullName  = full;
  if (email)   contact.email     = email;
  if (phone)   contact.phone     = phone;
  if (company) contact.company   = company;
  if (title)   contact.title     = title;

  return contact;
}



/** True if the row is effectively blank (all mapped values empty). */
function isBlankRow(contact: Contact): boolean {
  return Object.values(contact).every((v) => !v || v.trim() === '');
}

/** True if we have enough name info to identify the contact. */
function hasUsableName(c: Contact): boolean {
  return Boolean(c.fullName || c.firstName || c.lastName);
}

/** True if the contact has at least one reachable channel. */
function hasContact(c: Contact): boolean {
  return Boolean(c.phone || c.email);
}



/**
 * Escape a value for use in a vCard text property.
 * Per RFC 2426 §5, the characters \, ; and , must be escaped.
 * Newlines within a field become literal \n (not a line break).
 */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')   // backslash first
    .replace(/;/g,  '\\;')
    .replace(/,/g,  '\\,')
    .replace(/\n/g, '\\n');
}



/**
 * Serialise one Contact to a vCard 3.0 block.
 *
 * Name resolution (in priority order):
 *  - If firstName + lastName → FN = "first last", N = "last;first;;;"
 *  - If only firstName       → FN = firstName,    N = ";first;;;"
 *  - If only lastName        → FN = lastName,     N = "last;;;;"
 *  - If fullName             → FN = fullName,     N = ";;;;" (no split)
 *  - fullName always overrides FN when present
 */
export function contactToVCard(contact: Contact): string {
  const { firstName = '', lastName = '', fullName = '', email = '', phone = '', company = '', title = '' } = contact;

  // Derive FN (formatted/display name)
  let fn: string;
  if (fullName) {
    fn = fullName;
  } else if (firstName && lastName) {
    fn = `${firstName} ${lastName}`;
  } else {
    fn = firstName || lastName;
  }

  // Derive N property: last;first;middle;prefix;suffix
  let nProp: string;
  if (firstName || lastName) {
    nProp = `${esc(lastName)};${esc(firstName)};;;`;
  } else {
    // fullName only — leave N components blank
    nProp = ';;;;';
  }

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${nProp}`,
    `FN:${esc(fn)}`,
  ];

  if (phone)   lines.push(`TEL;TYPE=CELL:${esc(phone)}`);
  if (email)   lines.push(`EMAIL;TYPE=INTERNET:${esc(email)}`);
  if (company) lines.push(`ORG:${esc(company)}`);
  if (title)   lines.push(`TITLE:${esc(title)}`);

  lines.push('END:VCARD');

  return lines.join('\r\n');
}



export interface GenerateResult {
  /** Number of contacts successfully written to the .vcf */
  exported: number;
  /** Number of rows skipped (blank / no name / no contact info) */
  skipped: number;
}

/**
 * Convert all rows to vCard 3.0, bundle them into a single .vcf Blob, and
 * trigger a browser download.
 *
 * @returns A summary of how many rows were exported vs skipped.
 */
export function downloadVCF(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  filename = 'contacts.vcf',
): GenerateResult {
  const cards: string[] = [];
  let skipped = 0;

  for (const row of rows) {
    const contact = rowToContact(row, mapping);

    if (isBlankRow(contact))      { skipped++; continue; }
    if (!hasUsableName(contact))  { skipped++; continue; }
    if (!hasContact(contact))     { skipped++; continue; }

    cards.push(contactToVCard(contact));
  }

  if (cards.length === 0) {
    throw new Error(
      'No valid contacts found. Check that name and phone/email columns are mapped correctly.',
    );
  }

  // vCard files use CRLF line endings; blocks are separated by a blank line
  const vcfContent = cards.join('\r\n\r\n') + '\r\n';

  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Delay revoke slightly so the browser has time to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { exported: cards.length, skipped };
}
