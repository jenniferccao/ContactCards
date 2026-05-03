
import React from 'react';

interface AppHeadingProps {
  compact?: boolean;
}

const AppHeading: React.FC<AppHeadingProps> = ({ compact = false }) => (
  <div className={`flex flex-col items-center text-center ${compact ? 'gap-1' : 'gap-3'}`}>
    {!compact && (
      <img src="/cc_pic.png" alt="Contact Cards Logo" className="h-28 w-auto drop-shadow-sm mb-5" />
    )}
    <h1
      className={`${compact ? 'text-2xl' : 'text-4xl'} leading-tight`}
      style={{ color: '#0d0d5e', fontFamily: "'Special Gothic Expanded One', sans-serif" }}
    >
      Mass-Create Contact Cards
    </h1>
    <p
      className={`${compact ? 'text-sm' : 'text-base'} font-normal`}
      style={{ color: '#2a2a7a', opacity: 0.75 }}
    >
      Simplify contact-adding for iMessage-based organizations
    </p>
  </div>
);

export default AppHeading;
