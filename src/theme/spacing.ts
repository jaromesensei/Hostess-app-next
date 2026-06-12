export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Radius = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 100,
} as const;

export const Shadow = {
  soft: {
    shadowColor: 'rgba(44,74,62,0.10)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: 'rgba(44,74,62,0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  strong: {
    shadowColor: 'rgba(44,74,62,0.22)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 14,
  },
} as const;
