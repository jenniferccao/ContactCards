// ---------------------------------------------------------------------------
// generateVCard.ts
//
// Converts structured Contact objects into vCard 3.0 format (.vcf) and
// triggers a browser download of the combined file.
//
// TODO: Implement the vCard serialisation and download logic.
// ---------------------------------------------------------------------------

import type { Contact, ColumnMapping } from '../types/contact';

/**
 * Build a Contact object from a raw spreadsheet row using the user's mapping.
 *
 * @param row     - One row from the parsed spreadsheet (header → raw value).
 * @param mapping - The confirmed ContactField → header mapping.
 */
export function rowToContact(
  _row: Record<string, string>,
  _mapping: ColumnMapping,
): Contact {
  // TODO: implementation
  //
  // For each key in `mapping`, look up the value in `row` and assign it to
  // the corresponding field on the Contact object.
  return {};
}

/**
 * Serialise a single Contact to vCard 3.0 format.
 *
 * @param contact - The contact to serialise.
 * @returns A vCard string, ready to be concatenated into a .vcf file.
 */
export function contactToVCard(_contact: Contact): string {
  // TODO: implementation
  //
  // vCard 3.0 skeleton:
  //   BEGIN:VCARD
  //   VERSION:3.0
  //   N:<lastName>;<firstName>;;;
  //   FN:<firstName> <lastName>
  //   ORG:<organization>
  //   TITLE:<title>
  //   TEL;TYPE=CELL:<phone>
  //   EMAIL:<email>
  //   URL:<website>
  //   ADR;TYPE=HOME:;;;<address>;;;
  //   END:VCARD
  return '';
}

/**
 * Generate a combined .vcf blob from all rows and trigger a browser download.
 *
 * @param rows    - All spreadsheet rows.
 * @param mapping - The confirmed column mapping.
 * @param filename - The name of the downloaded file (default: "contacts.vcf").
 */
export function downloadVCF(
  _rows: Record<string, string>[],
  _mapping: ColumnMapping,
  _filename = 'contacts.vcf',
): void {
  // TODO: implementation
  //
  // 1. Map each row through rowToContact() + contactToVCard()
  // 2. Join all vCard strings with '\n'
  // 3. Create a Blob with type 'text/vcard'
  // 4. Use URL.createObjectURL + a temporary <a> click to trigger download
  // 5. Revoke the object URL afterwards
  throw new Error('downloadVCF: not yet implemented');
}
