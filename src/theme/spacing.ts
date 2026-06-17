export const Spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  base:  16,
  lg:    20,
  xl:    24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const Radius = {
  // Legacy names (keep for existing code)
  small:  8,
  medium: 16,
  large:  24,
  pill:   100,

  // New semantic names
  xs:   6,
  sm:   12,
  md:   16,
  lg:   24,
  xl:   32,
  full: 999,
} as const;

export const Shadow = {
  // Legacy names (keep for existing code)
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

  // New semantic names
  sm: {
    shadowColor: 'rgba(44,74,62,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(44,74,62,0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: 'rgba(44,74,62,0.16)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
