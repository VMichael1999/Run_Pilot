import type { TextStyle } from 'react-native';

/**
 * General Sans desde assets/fonts. Cada peso apunta a su propio archivo:
 * con fuentes personalizadas `fontWeight` no se aplica bien (sobre todo en Android).
 */
export const FontFamily = {
  regular:    'GeneralSans-Regular',
  medium:     'GeneralSans-Medium',
  semibold:   'GeneralSans-Semibold',
  bold:       'GeneralSans-Bold',
  italic:     'GeneralSans-Italic',
  boldItalic: 'GeneralSans-BoldItalic',
} as const;

/** Archivos que carga `useFonts` en App.tsx. */
export const FontAssets = {
  [FontFamily.regular]:    require('../../assets/fonts/GeneralSans-Regular.ttf'),
  [FontFamily.medium]:     require('../../assets/fonts/GeneralSans-Medium.ttf'),
  [FontFamily.semibold]:   require('../../assets/fonts/GeneralSans-Semibold.ttf'),
  [FontFamily.bold]:       require('../../assets/fonts/GeneralSans-Bold.ttf'),
  [FontFamily.italic]:     require('../../assets/fonts/GeneralSans-Italic.ttf'),
  [FontFamily.boldItalic]: require('../../assets/fonts/GeneralSans-BoldItalic.ttf'),
};

/**
 * Escala por rol. General Sans no trae cifras tabulares (`tnum`), asi que los
 * numeros que cambian en vivo necesitan ancho minimo fijo o alineacion a la derecha.
 */
export const Type = {
  /** Cifra protagonista: precio de la solicitud, saldo. */
  price:      { fontFamily: FontFamily.bold, fontSize: 44, lineHeight: 46, letterSpacing: -1.3 },
  /** Monto a cobrar en el panel de cobro. */
  priceXL:    { fontFamily: FontFamily.bold, fontSize: 52, lineHeight: 54, letterSpacing: -1.5 },
  /** "S/" delante del precio. */
  currency:   { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 26 },
  /** Total de ingresos. */
  hero:       { fontFamily: FontFamily.bold, fontSize: 40, lineHeight: 42, letterSpacing: -1.2 },
  /** Titulo de pantalla de entrada (login, codigo). */
  display:    { fontFamily: FontFamily.bold, fontSize: 31, lineHeight: 34, letterSpacing: -0.8 },
  /** Titulo de pantalla interna (Ingresos, Billetera). */
  title:      { fontFamily: FontFamily.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.5 },
  /** Cifra secundaria destacada (minutos al destino). */
  figure:     { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 24 },
  /** Marca junto al logo. */
  brand:      { fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  /** Accion principal (botones de 56 dp). */
  action:     { fontFamily: FontFamily.semibold, fontSize: 17, lineHeight: 22 },
  /** Encabezado de tarjeta o KPI. */
  heading:    { fontFamily: FontFamily.semibold, fontSize: 16, lineHeight: 21 },
  /** Accion secundaria, texto de apoyo importante. */
  bodyStrong: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21 },
  body:       { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21 },
  /** Direcciones y nombres. */
  address:    { fontFamily: FontFamily.medium, fontSize: 14.5, lineHeight: 20 },
  label:      { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 19 },
  /** Distancias, tiempos, subtitulos. */
  detail:     { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 17 },
  /** Chips, tags, badges. */
  tag:        { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 16 },
  caption:    { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypeRole = keyof typeof Type;

/** @deprecated Usa `Type`. Se mantiene para pantallas aun no migradas. */
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
