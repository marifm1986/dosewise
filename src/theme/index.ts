// DoseWise Design System — "Clinical Calm"
// Based on Stitch design: projects/6094613667603269583

export const Colors = {
  // Primary — Deep Trust Blue
  primary: '#0043a2',
  primaryContainer: '#2a5cbe',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#d1dcff',
  inversePrimary: '#b1c5ff',
  primaryFixed: '#dae2ff',
  primaryFixedDim: '#b1c5ff',

  // Secondary — Mint Vitality
  secondary: '#006a63',
  secondaryContainer: '#79f7ea',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#007169',
  secondaryFixed: '#79f7ea',
  secondaryFixedDim: '#5adace',

  // Tertiary — Cloud Grey
  tertiary: '#454a4d',
  tertiaryContainer: '#5c6165',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#d8dce0',

  // Surfaces
  surface: '#f9f9ff',
  surfaceDim: '#cfdaf1',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fa',
  onSurface: '#111c2c',
  onSurfaceVariant: '#434652',
  inverseSurface: '#263142',
  inverseOnSurface: '#ebf1ff',

  // Neutral
  outline: '#737784',
  outlineVariant: '#c3c6d5',
  background: '#f9f9ff',
  onBackground: '#111c2c',
  surfaceVariant: '#d8e3fa',

  // Status
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  warning: '#ed8936',
  warningContainer: '#fef3c7',
  success: '#006a63',
  successContainer: '#79f7ea',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Typography = {
  headlineLg: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  headlineLgMobile: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  headlineMd: {
    fontFamily: 'HankenGrotesk_600SemiBold',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  labelSm: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  containerMargin: 20,
  gutter: 16,
} as const;

export const Radius = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
