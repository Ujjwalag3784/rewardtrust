import React from 'react';

// Lightweight inline line-icon set (stroke = currentColor), Tabler-style.
const PATHS = {
  home: ['M5 12l-2 0l9 -9l9 9l-2 0', 'M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1 -1v-7', 'M9 21v-6a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6'],
  sparkles: ['M12 3l1.6 4.8l4.8 1.6l-4.8 1.6l-1.6 4.8l-1.6 -4.8l-4.8 -1.6l4.8 -1.6z', 'M19 3v3', 'M20.5 4.5h-3'],
  clock: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 7v5l3 2'],
  shield: ['M12 3l7 3v5c0 4 -2.6 6.9 -7 8c-4.4 -1.1 -7 -4 -7 -8v-5z', 'M9.5 12l2 2l3.5 -4'],
  user: ['M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M5 21v-1a5 5 0 0 1 5 -5h4a5 5 0 0 1 5 5v1'],
  bell: ['M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3l1.5 3h-15l1.5 -3v-3a7 7 0 0 1 4 -6', 'M9.5 20a2.5 2.5 0 0 0 5 0'],
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  camera: ['M5 8h2l1.5 -2h7l1.5 2h2a1 1 0 0 1 1 1v9a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-9a1 1 0 0 1 1 -1z', 'M12 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'],
  receipt: ['M6 3v18l2 -1.5l2 1.5l2 -1.5l2 1.5l2 -1.5l2 1.5v-18l-2 1.5l-2 -1.5l-2 1.5l-2 -1.5l-2 1.5z', 'M9 8h6', 'M9 12h6'],
  arrowLeft: ['M5 12h14', 'M5 12l6 6', 'M5 12l6 -6'],
  arrowRight: ['M5 12h14', 'M13 18l6 -6', 'M13 6l6 6'],
  check: ['M5 12l5 5l9 -9'],
  x: ['M6 6l12 12', 'M6 18l12 -12'],
};

export default function Icon({ name, size = 22, stroke = 1.75, className }) {
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
