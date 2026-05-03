// ---------------------------------------------------------------------------
// App.tsx — Root component; owns global state and controls step progression
// ---------------------------------------------------------------------------

import React, { useState } from 'react';

import UploadStep from './components/UploadStep';
import ColumnMappingStep from './components/ColumnMappingStep';
import PreviewStep from './components/PreviewStep';
import DownloadStep from './components/DownloadStep';

import { detectColumns } from './utils/detectColumns';
import type { ParseResult } from './utils/parseSpreadsheet';
import type { AppStep, ColumnMapping } from './types/contact';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AppData {
  headers: string[];
  rows: Record<string, string>[];
  mapping: ColumnMapping;
}

const INITIAL_DATA: AppData = {
  headers: [],
  rows: [],
  mapping: {},
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [data, setData] = useState<AppData>(INITIAL_DATA);

  // ----- Step 1 → 2 -------------------------------------------------------

  const handleParsed = (result: ParseResult) => {
    const detected = detectColumns(result.headers);

    // Convert DetectionResult (null for misses) → ColumnMapping (omit nulls)
    const autoMapping: ColumnMapping = Object.fromEntries(
      Object.entries(detected).filter(([, v]) => v != null),
    ) as ColumnMapping;

    setData({ headers: result.headers, rows: result.rows, mapping: autoMapping });
    setStep('mapping');
  };

  // ----- Step 2 → 3 -------------------------------------------------------

  const handleMappingConfirmed = (confirmedMapping: ColumnMapping) => {
    setData((prev) => ({ ...prev, mapping: confirmedMapping }));
    setStep('preview');
  };

  // ----- Step 3 → 4 -------------------------------------------------------

  const handlePreviewConfirmed = () => {
    setStep('download');
  };

  // ----- Back navigation --------------------------------------------------

  const handleBackToUpload = () => setStep('upload');
  const handleBackToMapping = () => setStep('mapping');

  // ----- Reset ------------------------------------------------------------

  const handleReset = () => {
    setData(INITIAL_DATA);
    setStep('upload');
  };

  // ----- Render -----------------------------------------------------------

  return (
    /*
     * Full-viewport container. The radial lavender gradient is applied on
     * <body> in index.css so it covers the entire page regardless of content
     * height. This wrapper simply centres the active step vertically.
     */
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <main className="w-full max-w-2xl">
        {step === 'upload' && (
          <UploadStep onParsed={handleParsed} />
        )}

        {step === 'mapping' && (
          <ColumnMappingStep
            headers={data.headers}
            initialMapping={data.mapping}
            onConfirm={handleMappingConfirmed}
            onBack={handleBackToUpload}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            rows={data.rows}
            mapping={data.mapping}
            onNext={handlePreviewConfirmed}
            onBack={handleBackToMapping}
          />
        )}

        {step === 'download' && (
          <DownloadStep
            rows={data.rows}
            mapping={data.mapping}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default App;
