// ---------------------------------------------------------------------------
// contact.ts — shared types for the ContactCards app
// ---------------------------------------------------------------------------

/**
 * All recognised vCard fields the app can map spreadsheet columns to.
 */
export type ContactField =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'company'
  | 'title';

/**
 * A single parsed contact. Every field is optional because not every
 * spreadsheet will include all of them.
 */
export interface Contact {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
}

/**
 * Maps a ContactField to the raw spreadsheet column header the user
 * selected (or that was auto-detected).
 *
 * e.g. { firstName: 'First Name', email: 'Email Address' }
 */
export type ColumnMapping = Partial<Record<ContactField, string>>;

/**
 * The sequential steps in the app workflow.
 */
export type AppStep = 'upload' | 'mapping' | 'preview' | 'download';

/**
 * Top-level application state passed between steps.
 */
export interface AppState {
  /** Raw column headers from the uploaded spreadsheet */
  headers: string[];
  /** All parsed rows as key→value records */
  rows: Record<string, string>[];
  /** User-confirmed field→column mapping */
  mapping: ColumnMapping;
  /** Which step the user is currently on */
  step: AppStep;
}
