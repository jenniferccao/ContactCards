// ---------------------------------------------------------------------------
// ColumnMappingStep.tsx — Step 2: Confirm / fix column → field mappings
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import type { ColumnMapping, ContactField } from '../types/contact';
import { CONTACT_FIELDS, FIELD_LABELS } from '../utils/detectColumns';
import AppHeading from './AppHeading';

interface ColumnMappingStepProps {
  headers: string[];
  initialMapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

// ── Shared style tokens ──────────────────────────────────────────────────────

const NAVY = '#0d0d5e';

const selectCls =
  'w-full px-4 py-3 rounded-xl text-sm font-medium ' +
  'border-2 border-[#0d0d5e]/20 bg-white/60 ' +
  'text-[#0d0d5e] appearance-none cursor-pointer ' +
  'focus:outline-none focus:border-[#0d0d5e]/60 ' +
  'transition-colors duration-150';

const confirmBtnCls =
  'w-full py-4 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-transparent bg-[#0d0d5e] text-white ' +
  'transition-all duration-150 ' +
  'hover:bg-white hover:border-[#0d0d5e] hover:text-[#0d0d5e] ' +
  'active:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed';

const backBtnCls =
  'w-full py-4 rounded-2xl text-sm font-bold tracking-widest uppercase ' +
  'border-2 border-[#0d0d5e]/30 text-[#0d0d5e]/60 ' +
  'transition-all duration-150 ' +
  'hover:border-[#0d0d5e] hover:text-[#0d0d5e] ' +
  'active:opacity-70';

// ── Validation ────────────────────────────────────────────────────────────────

function validate(mapping: ColumnMapping): string | null {
  const hasName =
    mapping.fullName ||
    (mapping.firstName && mapping.lastName) ||
    mapping.firstName ||   // allow firstName alone
    mapping.lastName;      // allow lastName alone

  if (!hasName) {
    return 'Map at least one name field (Full Name, or First / Last Name).';
  }

  const hasContact = mapping.phone || mapping.email;
  if (!hasContact) {
    return 'Map at least Phone or Email.';
  }

  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  headers,
  initialMapping,
  onConfirm,
  onBack,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);
  const [error,   setError]   = useState<string | null>(null);

  const handleChange = (field: ContactField, value: string) => {
    setError(null);
    setMapping((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[field];
      } else {
        next[field] = value;
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const err = validate(mapping);
    if (err) { setError(err); return; }
    onConfirm(mapping);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Step label */}
        <p className="text-sm font-bold tracking-wide text-center" style={{ color: NAVY }}>
          2. Confirm contact fields
        </p>

        {/* Field rows */}
        <div className="flex flex-col gap-4">
          {CONTACT_FIELDS.map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label
                htmlFor={`map-${field}`}
                className="text-xs font-bold tracking-wide uppercase"
                style={{ color: NAVY, opacity: 0.6 }}
              >
                {FIELD_LABELS[field]}
              </label>

              {/* Wrapper for custom arrow */}
              <div className="relative">
                <select
                  id={`map-${field}`}
                  value={mapping[field] ?? ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={selectCls}
                >
                  <option value="">— skip —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <div
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: NAVY, opacity: 0.4 }}
                >
                  ▾
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation error */}
        {error && (
          <p className="text-xs font-medium text-center" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <button type="button" className={confirmBtnCls} onClick={handleConfirm}>
            Confirm →
          </button>
          <button type="button" className={backBtnCls} onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingStep;
