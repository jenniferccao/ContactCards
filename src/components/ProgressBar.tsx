import React from 'react';
import type { AppStep } from '../types/contact';

const STEPS: AppStep[] = ['upload', 'mapping', 'preview', 'download'];

interface ProgressBarProps {
  currentStep: AppStep;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-xs mx-auto bg-[#0d0d5e]/10 h-1.5 rounded-full overflow-hidden mt-2">
      <div 
        className="h-full bg-[#0d0d5e] transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
