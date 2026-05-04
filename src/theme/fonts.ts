export const FontFamily = {
  regular: 'GeneralSans-Regular',
  italic: 'GeneralSans-Italic',
  bold: 'GeneralSans-Bold',
  boldItalic: 'GeneralSans-BoldItalic',
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
