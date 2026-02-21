import { SPACING as SHARED_SPACING } from '@repo/config';

const toNumber = (value: string): number => Number.parseInt(value, 10);

export const SPACING = {
  XS: toNumber(SHARED_SPACING.XS),
  SM: toNumber(SHARED_SPACING.SM),
  MD: toNumber(SHARED_SPACING.MD),
  LG: toNumber(SHARED_SPACING.LG),
  XL: toNumber(SHARED_SPACING.XL),
  XXL: toNumber(SHARED_SPACING.XXL),
} as const;
