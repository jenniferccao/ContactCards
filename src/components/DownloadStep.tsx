// ---------------------------------------------------------------------------
// DownloadStep.tsx — Step 3: Download the generated .vcf file
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import type { ColumnMapping } from '../types/contact';
import { downloadVCF } from '../utils/generateVCard';
import { btnPrimary, btnSecondary, NAVY } from '../styles/buttons';
import AppHeading from './AppHeading';

interface DownloadStepProps {
  rows: Record<string, string>[];
  mapping: ColumnMapping;
  onReset: () => void;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  rows,
  mapping,
  onReset,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState<number | null>(null);

  const handleDownload = () => {
    setError(null);
    try {
      const result = downloadVCF(rows, mapping, 'contacts.vcf');
      setExported(result.exported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate file.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <p className="text-sm font-bold tracking-wide text-center" style={{ color: NAVY }}>
          4. Download contact cards
        </p>

        <div className="text-center text-sm" style={{ color: NAVY, opacity: 0.6 }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''} ready to export
        </div>

        {exported !== null && (
          <div
            className="rounded-2xl px-5 py-4 flex flex-col items-center gap-1.5 text-center"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(13,13,94,0.12)' }}
          >
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              {exported} contact{exported !== 1 ? 's' : ''} saved
            </span>
            <span
              className="text-xs font-medium leading-relaxed"
              style={{ color: NAVY, opacity: 0.55 }}
            >
              Open the .vcf file and share it in an iMessage group chat. Recipients will be able to save everyone at once.
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-center" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            id="btn-download"
            type="button"
            className={btnPrimary}
            onClick={handleDownload}
          >
            Download VCF
          </button>

          <button
            id="btn-start-over"
            type="button"
            className={btnSecondary}
            onClick={onReset}
          >
            Upload a different file
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadStep;
