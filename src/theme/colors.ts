export const Colors = {
  terra: '#E8734A',
  forest: '#2C4A3E',
  yellow: '#F5C842',
  cream: '#FDFAF6',
  cream2: '#F2EDE6',
  text: '#1A1A2E',
  gray: '#8A8A9A',
  white: '#FFFFFF',
  success: '#4CAF7D',
  error: '#E85D4A',

  // Derived / opacity variants
  terraLight: '#F5A882',
  terraDim: 'rgba(232,115,74,0.12)',
  forestDim: 'rgba(44,74,62,0.08)',
  forestShadow: 'rgba(44,74,62,0.10)',
  forestDeep: 'rgba(44,74,62,0.80)',
  overlay: 'rgba(26,26,46,0.45)',
  overlayDark: 'rgba(26,26,46,0.72)',

  // Tab / UI
  border: '#E8E3DC',
  inputBg: '#F2EDE6',
  placeholder: '#B5B0AB',

  // Gradients (used with LinearGradient arrays)
  gradientForest: ['#2C4A3E', '#1A2E28'] as const,
  gradientCard: ['transparent', 'rgba(26,26,46,0.82)'] as const,
  gradientHero: ['rgba(26,26,46,0)', 'rgba(26,26,46,0.90)'] as const,
} as const;

export type ColorKey = keyof typeof Colors;
