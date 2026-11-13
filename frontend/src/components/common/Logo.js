import React from 'react';

export default function Logo({ className = '', width = 138, height = 42 }) {
  return (
    <img
      src="/images/logo/logo-black.svg"
      alt="KINETICS Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}

