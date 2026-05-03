// ---------------------------------------------------------------------------
// PreviewStep.tsx — Preview contact cards before downloading
// ---------------------------------------------------------------------------

import React from 'react';
import type { ColumnMapping } from '../types/contact';
import { rowToContact } from '../utils/generateVCard';
import { btnPrimary, btnSecondary, NAVY } from '../styles/buttons';
import AppHeading from './AppHeading';

interface PreviewStepProps {
  rows: Record<string, string>[];
  mapping: ColumnMapping;
  onNext: () => void;
  onBack: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ rows, mapping, onNext, onBack }) => {
  // Take up to the first 3 valid rows to preview
  const previewContacts = rows
    .map((row) => rowToContact(row, mapping))
    .filter((c) => {
      const hasName = c.fullName || c.firstName || c.lastName;
      const hasContact = c.phone || c.email;
      // Also filter out completely blank objects
      const isBlank = Object.keys(c).length === 0;
      return !isBlank && hasName && hasContact;
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <p className="text-sm font-bold tracking-wide text-center" style={{ color: NAVY }}>
          3. Preview contact cards
        </p>

        {previewContacts.length === 0 ? (
          <p className="text-xs text-center leading-relaxed" style={{ color: NAVY, opacity: 0.6 }}>
            No valid contacts found. Please go back and ensure you've mapped name and contact info columns.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {previewContacts.map((c, i) => {
              const displayName = c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ');
              return (
                <div
                  key={i}
                  className="rounded-2xl px-5 py-4 flex flex-col gap-1 text-left"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(13,13,94,0.12)' }}
                >
                  <p className="text-base font-bold tracking-tight" style={{ color: NAVY }}>
                    {displayName || 'Unnamed Contact'}
                  </p>
                  {c.title || c.company ? (
                    <p className="text-xs font-semibold" style={{ color: NAVY, opacity: 0.7 }}>
                      {[c.title, c.company].filter(Boolean).join(' at ')}
                    </p>
                  ) : null}
                  <div className="flex flex-col mt-1">
                    {c.email && (
                      <p className="text-xs font-medium" style={{ color: NAVY, opacity: 0.6 }}>
                        {c.email}
                      </p>
                    )}
                    {c.phone && (
                      <p className="text-xs font-medium" style={{ color: NAVY, opacity: 0.6 }}>
                        {c.phone}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {rows.length > 3 && (
              <p className="text-xs font-semibold text-center mt-2" style={{ color: NAVY, opacity: 0.5 }}>
                + {rows.length - 3} more
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            className={btnPrimary}
            onClick={onNext}
            disabled={previewContacts.length === 0}
          >
            Looks good
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
