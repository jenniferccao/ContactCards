// ---------------------------------------------------------------------------
// parseSpreadsheet.ts — Parse CSV or XLSX files using SheetJS
// ---------------------------------------------------------------------------

import * as XLSX from 'xlsx';

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse a CSV or XLSX File into structured row data.
 *
 * Uses SheetJS for both formats — consistent behaviour, no separate CSV
 * parser needed.
 *
 * @param file - The File object from an <input type="file"> element.
 * @returns A promise resolving to { headers, rows }.
 * @throws If the file is empty or has no parseable rows.
 */
export async function parseSpreadsheet(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // sheet_to_json with header:1 gives us a 2D array (string[][])
  const raw = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',   // fill empty cells with '' rather than undefined
    raw: false,   // coerce all values to strings
  });

  if (raw.length === 0) {
    throw new Error('The spreadsheet appears to be empty.');
  }

  // First row is headers; remaining rows are data
  const [headerRow, ...dataRows] = raw;
  const headers = headerRow.map((h) => String(h).trim()).filter(Boolean);

  if (headers.length === 0) {
    throw new Error('No column headers found in the first row.');
  }

  const rows: Record<string, string>[] = dataRows
    // Skip fully blank rows
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, i) => {
        record[header] = String(row[i] ?? '').trim();
      });
      return record;
    });

  return { headers, rows };
}
