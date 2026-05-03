
import React, { useState } from 'react';

import UploadStep from './components/UploadStep';
import ColumnMappingStep from './components/ColumnMappingStep';
import PreviewStep from './components/PreviewStep';
import DownloadStep from './components/DownloadStep';
import Footer from './components/Footer';

import { detectColumns } from './utils/detectColumns';
import type { ParseResult } from './utils/parseSpreadsheet';
import type { AppStep, ColumnMapping } from './types/contact';


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


const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [data, setData] = useState<AppData>(INITIAL_DATA);



  const handleParsed = (result: ParseResult) => {
    const detected = detectColumns(result.headers);

    const autoMapping: ColumnMapping = Object.fromEntries(
      Object.entries(detected).filter(([, v]) => v != null),
    ) as ColumnMapping;

    setData({ headers: result.headers, rows: result.rows, mapping: autoMapping });
    setStep('mapping');
  };



  const handleMappingConfirmed = (confirmedMapping: ColumnMapping) => {
    setData((prev) => ({ ...prev, mapping: confirmedMapping }));
    setStep('preview');
  };



  const handlePreviewConfirmed = () => {
    setStep('download');
  };



  const handleBackToUpload = () => setStep('upload');
  const handleBackToMapping = () => setStep('mapping');



  const handleReset = () => {
    setData(INITIAL_DATA);
    setStep('upload');
  };



  return (

    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <main className="w-full max-w-2xl mb-24 sm:mb-0">
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

      <div className="fixed bottom-6 left-6 flex">
        <Footer />
      </div>
    </div>
  );
};

export default App;
