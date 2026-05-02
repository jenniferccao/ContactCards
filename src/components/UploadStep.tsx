// ---------------------------------------------------------------------------
// UploadStep.tsx — Step 1: File type selection + upload
// ---------------------------------------------------------------------------

import React, { useRef, useState } from 'react';
import AppHeading from './AppHeading';
import { parseSpreadsheet } from '../utils/parseSpreadsheet';
import type { ParseResult } from '../utils/parseSpreadsheet';

interface UploadStepProps {
  onParsed: (result: ParseResult) => void;
}

/** Shared Tailwind classes for both format buttons */
const BTN =
  'w-36 py-4 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-transparent bg-[#0d0d5e] text-white ' +
  'transition-all duration-150 ' +
  'hover:bg-white hover:border-[#0d0d5e] hover:text-[#0d0d5e] ' +
  'active:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Step 1 — "Select spreadsheet type & upload"
 *
 * Each button opens a hidden <input type="file"> filtered to its own
 * extension. On selection the file is parsed via SheetJS and the result
 * is handed back to the parent via onParsed().
 */
const UploadStep: React.FC<UploadStepProps> = ({ onParsed }) => {
  const csvRef  = useRef<HTMLInputElement>(null);
  const xlsxRef = useRef<HTMLInputElement>(null);

  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── File handling ────────────────────────────────────────────────────────

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const result = await parseSpreadsheet(file);
      onParsed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  const onCsvChange  = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0]);

  const onXlsxChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-10">

      <AppHeading />

      {/* ── Step 1 workflow area ──────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5">
        <p
          className="text-sm font-bold tracking-wide"
          style={{ color: '#0d0d5e' }}
        >
          1. Select spreadsheet type &amp; upload
        </p>

        {/* Hidden file inputs */}
        <input
          ref={csvRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onCsvChange}
        />
        <input
          ref={xlsxRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={onXlsxChange}
        />

        {/* Visible format buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={loading}
            className={BTN}
            onClick={() => csvRef.current?.click()}
          >
            {loading ? '…' : '.CSV'}
          </button>
          <button
            type="button"
            disabled={loading}
            className={BTN}
            onClick={() => xlsxRef.current?.click()}
          >
            {loading ? '…' : '.XLSX'}
          </button>
        </div>

        {/* Inline error message */}
        {error && (
          <p className="text-xs font-medium" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}
      </div>

    </div>
  );
};

export default UploadStep;
