import React from 'react';

// export const Heart = (p: React.SVGAttributes<SVGElement>) => (
//   <svg
//     {...p}
//     width='78'
//     height='58'
//     viewBox='0 0 78 58'
//     fill='none'
//     xmlns='http://www.w3.org/2000/svg'
//   >
//     <path
//       d='M57.0814 38.6199L38.541 20.0796L20.0007 38.6199L38.541 57.1603L57.0814 38.6199Z'
//       fill='currentColor'
//     />
//     <path
//       d='M37.0809 18.5403L18.5405 0L0.000188344 18.5403L18.5405 37.0807L37.0809 18.5403Z'
//       fill='currentColor'
//     />
//     <path
//       d='M77.1351 18.5667L58.5947 0.0263672L40.0544 18.5667L58.5947 37.107L77.1351 18.5667Z'
//       fill='currentColor'
//     />
//   </svg>
// );

export const Heart = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    {...p}
    width='79'
    height='53'
    viewBox='0 0 79 53'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* <path d='M52.22 0H26V26.22H52.22V0Z' fill='currentColor' /> */}
    <path d='M52.22 26H26V52.22H52.22V26Z' fill='currentColor' />
    <path d='M78.22 0H52V26.22H78.22V0Z' fill='currentColor' />
    <path d='M26.22 0H0V26.22H26.22V0Z' fill='currentColor' />
  </svg>
);
