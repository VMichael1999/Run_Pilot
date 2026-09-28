import { Palette, ThemeColors } from '../colors';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Pares texto/fondo que la UI usa de verdad. Minimo WCAG AA para texto normal.
const TEXT_PAIRS = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['onPrimary', 'primary'],
  ['onSignal', 'signal'],
  ['online', 'onlineSoft'],
  ['cash', 'cashSoft'],
  ['pickup', 'pickupSoft'],
  ['digital', 'digitalSoft'],
  ['danger', 'surface'],
  ['danger', 'dangerSoft'],
  ['onDanger', 'danger'],
] as const;

describe('ThemeColors', () => {
  it('claro y oscuro definen los mismos roles', () => {
    expect(Object.keys(ThemeColors.dark).sort()).toEqual(Object.keys(ThemeColors.light).sort());
  });

  describe.each(['light', 'dark'] as const)('%s', (mode) => {
    const theme = ThemeColors[mode];
    it.each(TEXT_PAIRS)('%s sobre %s tiene contraste >= 4.5', (fg, bg) => {
      expect(contrast(theme[fg], theme[bg])).toBeGreaterThanOrEqual(4.5);
    });
  });
});

it('SOS: texto blanco sobre rojo y sobre el relleno de carga con contraste >= 4.5', () => {
  expect(contrast(Palette.white, Palette.sos)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(Palette.white, Palette.sosHold)).toBeGreaterThanOrEqual(4.5);
});
