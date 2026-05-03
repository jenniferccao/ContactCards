// ---------------------------------------------------------------------------
// UploadStep.tsx — Step 1: File type selection + upload
// ---------------------------------------------------------------------------

import React, { useRef, useState } from 'react';
import AppHeading from './AppHeading';
import { parseSpreadsheet } from '../utils/parseSpreadsheet';
import type { ParseResult } from '../utils/parseSpreadsheet';
import { btnPill, NAVY } from '../styles/buttons';

interface UploadStepProps {
  onParsed: (result: ParseResult) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onParsed }) => {
  const csvRef = useRef<HTMLInputElement>(null);
  const xlsxRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const onCsvChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0]);
  const onXlsxChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFile(e.target.files?.[0]);

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="flex flex-col items-center gap-5">
        <p
          className="text-sm font-bold tracking-wide"
          style={{ color: NAVY }}
        >
          1. Select spreadsheet type &amp; upload
        </p>

        {/* Hidden file inputs */}
        <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={onCsvChange} />
        <input ref={xlsxRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onXlsxChange} />

        {/* Format buttons */}
        <div className="flex items-center gap-4">
          <button
            id="btn-csv"
            type="button"
            disabled={loading}
            className={btnPill}
            onClick={() => csvRef.current?.click()}
          >
            {loading ? 'Loading' : '.CSV'}
          </button>
          <button
            id="btn-xlsx"
            type="button"
            disabled={loading}
            className={btnPill}
            onClick={() => xlsxRef.current?.click()}
          >
            {loading ? 'Loading' : '.XLSX'}
          </button>
        </div>

        {error && (
          <p className="text-xs font-medium" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}

        {/* Formatting tip */}
        <p
          className="text-xs text-center leading-relaxed max-w-xs"
          style={{ color: NAVY, opacity: 0.6 }}
        >
          Your spreadsheet must have a header row as the first row.
          <br />
          <br />
          ex. <em>First Name, Last Name, Email, Phone</em>.
        </p>
      </div>
    </div>
  );
};

export default UploadStep;
