// ---------------------------------------------------------------------------
// ColumnMappingStep.tsx — Step 2: Confirm / fix column → field mappings
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import type { ColumnMapping, ContactField } from '../types/contact';
import { CONTACT_FIELDS, FIELD_LABELS } from '../utils/detectColumns';
import { btnPrimary, btnSecondary, btnRemove, NAVY } from '../styles/buttons';
import AppHeading from './AppHeading';

interface ColumnMappingStepProps {
  headers: string[];
  initialMapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

// ── Select style ──────────────────────────────────────────────────────────────

const selectCls =
  'w-full px-4 py-3 rounded-xl text-sm font-medium ' +
  'border-2 border-[#0d0d5e]/20 bg-white/60 ' +
  'text-[#0d0d5e] appearance-none cursor-pointer ' +
  'focus:outline-none focus:border-[#0d0d5e]/60 ' +
  'transition-colors duration-150';

const addSelectCls =
  'w-full px-4 py-3 rounded-xl text-sm font-medium ' +
  'border-2 border-dashed border-[#0d0d5e]/20 bg-transparent ' +
  'text-[#0d0d5e]/50 appearance-none cursor-pointer ' +
  'focus:outline-none focus:border-[#0d0d5e]/40 ' +
  'transition-colors duration-150';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initActiveFields(initialMapping: ColumnMapping): ContactField[] {
  const detected = CONTACT_FIELDS.filter((f) => !!initialMapping[f]);
  const extras: ContactField[] = [];
  const hasName = detected.some((f) =>
    ['firstName', 'lastName', 'fullName'].includes(f),
  );
  if (!hasName)                    extras.push('fullName');
  if (!detected.includes('email')) extras.push('email');
  if (!detected.includes('phone')) extras.push('phone');
  const combined = new Set([...detected, ...extras]);
  return CONTACT_FIELDS.filter((f) => combined.has(f));
}

function validate(mapping: ColumnMapping): string | null {
  if (!mapping.fullName && !mapping.firstName && !mapping.lastName) {
    return 'Map at least one name field (Full Name, or First / Last Name).';
  }
  if (!mapping.phone && !mapping.email) {
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
  const [mapping,      setMapping]      = useState<ColumnMapping>(initialMapping);
  const [activeFields, setActiveFields] = useState<ContactField[]>(() =>
    initActiveFields(initialMapping),
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: ContactField, value: string) => {
    setError(null);
    setMapping((prev) => {
      const next = { ...prev };
      if (value === '') delete next[field];
      else next[field] = value;
      return next;
    });
  };

  const handleRemove = (field: ContactField) => {
    setActiveFields((prev) => prev.filter((f) => f !== field));
    setMapping((prev) => { const next = { ...prev }; delete next[field]; return next; });
    setError(null);
  };

  const handleAdd = (field: ContactField) => {
    setActiveFields((prev) =>
      CONTACT_FIELDS.filter((f) => prev.includes(f) || f === field),
    );
  };

  const handleConfirm = () => {
    const err = validate(mapping);
    if (err) { setError(err); return; }
    onConfirm(mapping);
  };

  const inactiveFields = CONTACT_FIELDS.filter((f) => !activeFields.includes(f));

  return (
    <div className="flex flex-col items-center gap-10">
      <AppHeading />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <p className="text-sm font-bold tracking-wide text-center" style={{ color: NAVY }}>
          2. Confirm contact fields
        </p>

        {/* No-detection warning — shown when the file had no recognisable headers */}
        {Object.keys(initialMapping).length === 0 && (
          <div
            className="rounded-2xl px-5 py-4 flex flex-col gap-3 text-center"
            style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(13,13,94,0.12)' }}
          >
            <p className="text-sm font-semibold" style={{ color: NAVY }}>
              No columns detected
            </p>
            <p className="text-xs leading-relaxed" style={{ color: NAVY, opacity: 0.6 }}>
              Make sure your spreadsheet has a header row as the first row with labels like{' '}
              <em>First Name, Last Name, Email, Phone</em>. You can still map columns manually below.
            </p>
            <button
              type="button"
              className={btnSecondary}
              onClick={onBack}
            >
              Upload a different file
            </button>
          </div>
        )}

        {/* Field rows */}
        <div className="flex flex-col gap-4">
          {activeFields.map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`map-${field}`}
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: NAVY, opacity: 0.6 }}
                >
                  {FIELD_LABELS[field]}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(field)}
                  className={btnRemove}
                  style={{ color: NAVY, opacity: 0.3 }}
                  aria-label={`Remove ${FIELD_LABELS[field]}`}
                >
                  remove
                </button>
              </div>

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
                <div
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: NAVY, opacity: 0.4 }}
                >
                  ▾
                </div>
              </div>
            </div>
          ))}

          {/* Add field */}
          {inactiveFields.length > 0 && (
            <div className="relative">
              <select
                value=""
                onChange={(e) => { if (e.target.value) handleAdd(e.target.value as ContactField); }}
                className={addSelectCls}
              >
                <option value="">Add a field</option>
                {inactiveFields.map((f) => (
                  <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                ))}
              </select>
              <div
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: NAVY, opacity: 0.3 }}
              >
                ▾
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-center" style={{ color: '#c0392b' }}>
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button id="btn-confirm" type="button" className={btnPrimary} onClick={handleConfirm}>
            Confirm fields
          </button>
          <button id="btn-back" type="button" className={btnSecondary} onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingStep;
