import React from 'react';

export const Mark = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    width='30'
    height='30'
    viewBox='0 0 30 30'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...p}
  >
    <path d='M30 0H0V30H30V0Z' fill='currentColor' />
  </svg>
);
