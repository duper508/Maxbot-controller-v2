/**
 * Pip-Boy theme configuration
 */

import { THEME, TYPOGRAPHY, SPACING, ANIMATION } from '@repo/config';

export const pipboyTheme = {
  colors: {
    ...THEME,
    background: THEME.DARK_BG,
    text: THEME.TEXT_COLOR,
    border: THEME.BORDER_COLOR,
    primary: THEME.PRIMARY_GREEN,
    accent: THEME.ACCENT_GREEN,
    muted: THEME.MUTED_TEXT,
    error: THEME.ERROR_RED,
    success: THEME.SUCCESS_GREEN,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  animation: ANIMATION,
  effects: {
    scanlines: `
      background-image: linear-gradient(
        0deg,
        transparent 24%,
        rgba(0, 255, 65, 0.05) 25%,
        rgba(0, 255, 65, 0.05) 26%,
        transparent 27%,
        transparent 74%,
        rgba(0, 255, 65, 0.05) 75%,
        rgba(0, 255, 65, 0.05) 76%,
        transparent 77%,
        transparent
      );
      background-size: 100% 4px;
    `,
    crt: `
      text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
    `,
    glow: `
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 10px rgba(0, 255, 65, 0.1);
    `,
  },
} as const;

export type PipboyTheme = typeof pipboyTheme;
