
import * as XLSX from 'xlsx';

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Clean up text extracted from the spreadsheet:
 * - Replace non-breaking spaces with normal spaces
 * - Remove hidden directional marks (LRE, PDF, LRM, RLM) often found in copied phone numbers
 * - Remove Zero-Width spaces and BOMs
 */
function cleanString(val: string): string {
  return val
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .trim();
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

  // codepage: 65001 forces UTF-8 for CSV files missing a Byte Order Mark.
  // This prevents UTF-8 characters (like directional markers) from turning
  // into Mojibake (e.g. â€¬).
  const workbook = XLSX.read(buffer, { type: 'array', codepage: 65001 });
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
  
  const validHeaders: { name: string; index: number }[] = [];
  headerRow.forEach((h, index) => {
    const name = cleanString(String(h));
    if (name) validHeaders.push({ name, index });
  });

  if (validHeaders.length === 0) {
    throw new Error('No column headers found in the first row.');
  }

  const headers = validHeaders.map((vh) => vh.name);

  const rows: Record<string, string>[] = dataRows
    // Skip fully blank rows
    .filter((row) => row.some((cell) => cleanString(String(cell)) !== ''))
    .map((row) => {
      const record: Record<string, string> = {};
      validHeaders.forEach(({ name, index }) => {
        record[name] = cleanString(String(row[index] ?? ''));
      });
      return record;
    });

  return { headers, rows };
}
