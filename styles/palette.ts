/**
 * Shared palette — mirrors `styles/_variables.scss` for TypeScript (charts, inline styles).
 */

export const colors = {
  primary: '#501315',
  background: '#fffcf7',
  lavender: '#c1c4e3',
  gold: '#fae3b1',
  goldHover: '#f6d180',
  pink: '#fcd7da',
  pinkHover: '#fabdc2',
} as const;

/** Ordered series colors — all values from the design system (no off-palette accent). */
export const chartPalette = [
  colors.primary,
  colors.lavender,
  colors.gold,
  colors.pink,
  colors.pinkHover,
] as const;
