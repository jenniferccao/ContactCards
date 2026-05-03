
import React, { useState } from 'react';
import type { ColumnMapping } from '../types/contact';
import { downloadVCF, generateVCF } from '../utils/generateVCard';
import { btnPrimary, btnSecondary, NAVY } from '../styles/buttons';
import AppHeading from './AppHeading';
import ProgressBar from './ProgressBar';

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
  const [canShare, setCanShare] = useState<boolean>(false);

  React.useEffect(() => {
    if (navigator.canShare) {
      try {
        const mockFile = new File([''], 'test.vcf', { type: 'text/vcard' });
        if (navigator.canShare({ files: [mockFile] })) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCanShare(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleDownload = () => {
    setError(null);
    try {
      const result = downloadVCF(rows, mapping, 'contacts.vcf');
      setExported(result.exported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate file.');
    }
  };

  const handleShare = async () => {
    setError(null);
    try {
      const result = generateVCF(rows, mapping);
      const file = new File([result.vcfContent!], 'contacts.vcf', { type: 'text/vcard' });
      
      await navigator.share({
        files: [file],
        title: 'Contact Cards',
      });
      setExported(result.exported);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'AbortError') {
          // User cancelled share, don't show error
          return;
        }
        if (err.name === 'NotAllowedError') {
          // Browser (like macOS Chrome) blocked the share despite canShare returning true.
          // Fallback to downloading instead.
          handleDownload();
          return;
        }
      }
      setError(err instanceof Error ? err.message : 'Failed to share file.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <p className="text-sm font-bold tracking-wide text-center" style={{ color: NAVY }}>
          4. Download your contact cards
        </p>
        <ProgressBar currentStep="download" />

        <div className="text-center text-sm" style={{ color: NAVY, opacity: 0.6 }}>
          {rows.length} row{rows.length !== 1 ? 's' : ''} ready to export
        </div>

        {exported !== null && (
          <div
            className="rounded-2xl px-5 py-4 flex flex-col items-center gap-1.5 text-center"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(13,13,94,0.12)' }}
          >
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              {exported} contact{exported !== 1 ? 's' : ''} created
            </span>
            <span
              className="text-xs font-medium leading-relaxed"
              style={{ color: NAVY, opacity: 0.55 }}
            >
              Share the .vcf file in an iMessage group chat. Recipients will be able to save everyone at once.
            </span>
          </div>
        )}

        {error && (
          <p className="text-xs font-medium text-center" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {canShare && (
            <button
              id="btn-share"
              type="button"
              className={btnPrimary}
              onClick={handleShare}
            >
              Share via iMessage
            </button>
          )}

          <button
            id="btn-download"
            type="button"
            className={btnPrimary}
            onClick={handleDownload}
          >
            Download .VCF
          </button>

          <button
            id="btn-start-over"
            type="button"
            className={btnSecondary}
            onClick={onReset}
          >
            Upload a new sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadStep;
