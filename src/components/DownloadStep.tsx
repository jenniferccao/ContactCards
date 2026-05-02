// ---------------------------------------------------------------------------
// DownloadStep.tsx — Step 3: Review summary and download the .vcf file
// ---------------------------------------------------------------------------

import React from 'react';
import type { ColumnMapping } from '../types/contact';

interface DownloadStepProps {
  /** All rows from the parsed spreadsheet */
  rows: Record<string, string>[];
  /** The confirmed field → column mapping */
  mapping: ColumnMapping;
  /** Allow the user to go back and adjust the mapping */
  onBack: () => void;
  /** Called when the user wants to start over with a new file */
  onReset: () => void;
}

/**
 * Step 3 — Show a summary (number of contacts, mapped fields) and a
 * "Download .vcf" button that triggers the file generation.
 *
 * TODO: implement
 *   - Display total contact count (rows.length)
 *   - List which fields are included in the export
 *   - "Download .vcf" button calls downloadVCF(rows, mapping)
 *   - "Back" button calls onBack()
 *   - "Start over" / "Upload new file" calls onReset()
 *   - Optional: show a small preview of the first vCard
 */
const DownloadStep: React.FC<DownloadStepProps> = ({
  rows: _rows,
  mapping: _mapping,
  onBack: _onBack,
  onReset: _onReset,
}) => {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      {/* Placeholder UI — replace during implementation */}
      <p className="text-white/40 text-sm">
        Download step — not yet implemented
      </p>
      <p className="text-white/20 text-xs">
        Will show contact count + download button here
      </p>
    </section>
  );
};

export default DownloadStep;
