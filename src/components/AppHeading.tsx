// ---------------------------------------------------------------------------
// AppHeading.tsx — App title and subtitle heading group
// ---------------------------------------------------------------------------

import React from 'react';

const AppHeading: React.FC = () => (
  <div className="flex flex-col items-center gap-3 text-center">
    <h1
      className="text-4xl font-bold leading-tight"
      style={{ color: '#0d0d5e', fontFamily: "'Space Mono', 'Courier New', monospace" }}
    >
      Mass-Create Contact Cards
    </h1>
    <p
      className="text-base font-normal"
      style={{ color: '#2a2a7a', opacity: 0.75 }}
    >
      Simplify contact-adding for iMessage-based organizations
    </p>
  </div>
);

export default AppHeading;
