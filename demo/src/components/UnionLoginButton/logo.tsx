import React from 'react';

export const Logo = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    {...p}
    width='16'
    height='16'
    viewBox='0 0 87 87'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M58 58H29V87H58V58Z' fill='currentColor' />
    <path d='M87 0H58V29H87V0Z' fill='currentColor' />
    <path d='M87 29H58V58H87V29Z' fill='currentColor' />
    <path d='M29 0H0V29H29V0Z' fill='currentColor' />
    <path d='M29 29H0V58H29V29Z' fill='currentColor' />
    <path d='M29 58H0V87H29V58Z' fill='currentColor' />
  </svg>
  );
