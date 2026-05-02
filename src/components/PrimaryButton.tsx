// ---------------------------------------------------------------------------
// PrimaryButton.tsx — Reusable CTA button component
// ---------------------------------------------------------------------------

import React from 'react';

interface PrimaryButtonProps {
  /** Button label */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether the button is disabled (e.g. waiting for user input) */
  disabled?: boolean;
  /** Native button type — defaults to "button" to avoid accidental form submits */
  type?: 'button' | 'submit' | 'reset';
  /** Optional extra Tailwind classes */
  className?: string;
}

/**
 * Shared primary action button used across all steps.
 * Style and behaviour will be refined during implementation.
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-semibold transition-all
        bg-indigo-600 text-white
        hover:bg-indigo-500
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
