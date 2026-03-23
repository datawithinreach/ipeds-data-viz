/**
 * Shared color palette — mirrors _variables.scss for use in TypeScript.
 * All chart colors are assigned from this file automatically.
 */

const colors = {
  primary: '#501315',
  accent: '#3b82f6',
  navbar: '#c1c4e3',
  button: '#fae3b1',
  buttonSecondary: '#fabdc2',
  background: '#fffcf7',
  foreground: '#171717',
} as const;

/** Ordered sequence used by charts — each group / series gets the next color. */
export const chartPalette = [
  colors.primary,
  colors.accent,
  colors.navbar,
  colors.button,
  colors.buttonSecondary,
] as const;
