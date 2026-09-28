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
 * Jerarquia de pesos (que marca la negrita):
 * - Bold 700: titulos (pantalla, panel, tarjeta, seccion), opciones del menu,
 *   nombres de personas, el estado en una palabra y las cifras de dinero.
 * - Semibold 600: botones, pestanas, etiquetas y la fila principal de una lista.
 * - Medium 500: direcciones y datos secundarios destacados.
 * - Regular 400: texto corrido, detalles, subtitulos y notas.
 * La negrita dice "que es esto"; si todo va en negrita, nada destaca.
 *
 * Escala por rol. General Sans no trae cifras tabulares (`tnum`), asi que los
 * numeros que cambian en vivo necesitan ancho minimo fijo o alineacion a la derecha.
 */
export const Type = {
  /** Cifra protagonista: precio de la solicitud, saldo. */
  price:      { fontFamily: FontFamily.bold, fontSize: 44, lineHeight: 54, letterSpacing: -1.3 },
  /** Monto a cobrar en el panel de cobro. */
  priceXL:    { fontFamily: FontFamily.bold, fontSize: 52, lineHeight: 64, letterSpacing: -1.5 },
  /** "S/" delante del precio. */
  currency:   { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 30 },
  /** Total de ingresos. */
  hero:       { fontFamily: FontFamily.bold, fontSize: 40, lineHeight: 50, letterSpacing: -1.2 },
  /** Titulo de pantalla de entrada (login, codigo). */
  display:    { fontFamily: FontFamily.bold, fontSize: 31, lineHeight: 38, letterSpacing: -0.8 },
  /** Titulo de pantalla interna (Ingresos, Billetera). */
  title:      { fontFamily: FontFamily.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.5 },
  /** Cifra secundaria destacada (minutos al destino). */
  figure:     { fontFamily: FontFamily.semibold, fontSize: 22, lineHeight: 24 },
  /** Marca junto al logo. */
  brand:      { fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  /** Accion principal (botones de 56 dp). */
  action:     { fontFamily: FontFamily.semibold, fontSize: 17, lineHeight: 22 },
  /** Titulo de tarjeta, de estado vacio o de un bloque. */
  heading:    { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 21 },
  /** Titulo de un panel inferior ("Buscando viajes cerca de ti"). */
  panelTitle: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 22 },
  /** Titulo de seccion dentro de una pantalla ("Método de recarga"). */
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 20 },
  /** Nombre de una persona (pasajero, conductor). */
  name:       { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 20 },
  /** Estado en una palabra sobre el mapa ("Conectado"). */
  status:     { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 19 },
  /** Accion secundaria, texto de apoyo importante. */
  bodyStrong: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 21 },
  body:       { fontFamily: FontFamily.regular, fontSize: 15, lineHeight: 21 },
  /** Opciones del menu lateral. */
  menu:       { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 20 },
  /** Monto en listas (historial, movimientos). */
  amount:     { fontFamily: FontFamily.bold, fontSize: 15, lineHeight: 20 },
  /** Precio en tarjetas del tablero. */
  priceCard:  { fontFamily: FontFamily.bold, fontSize: 26, lineHeight: 30, letterSpacing: -0.6 },
  /** Digitos del codigo de verificacion. */
  otp:        { fontFamily: FontFamily.semibold, fontSize: 28, lineHeight: 34 },
  /** Teclas del teclado numerico. */
  key:        { fontFamily: FontFamily.medium, fontSize: 22, lineHeight: 28 },
  /** Texto dentro de campos grandes (telefono). */
  field:      { fontFamily: FontFamily.semibold, fontSize: 18, lineHeight: 24 },
  /** Pregunta de una pantalla (calificar). */
  question:   { fontFamily: FontFamily.bold, fontSize: 20, lineHeight: 25, letterSpacing: -0.2 },
  /** Cifra de un indicador (horas, por viaje). */
  kpi:        { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 22 },
  kpiLabel:   { fontFamily: FontFamily.regular, fontSize: 11.5, lineHeight: 15 },
  /** Direcciones y nombres. */
  address:    { fontFamily: FontFamily.medium, fontSize: 14.5, lineHeight: 20 },
  label:      { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 19 },
  /** Filas de desglose. */
  row:        { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 19 },
  /** Titulo de seccion y encabezados de grupo (en oracion normal). */
  section:    { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18 },
  /** Chips, hora en listas, datos secundarios destacados. */
  small:      { fontFamily: FontFamily.medium, fontSize: 13.5, lineHeight: 18 },
  smallStrong: { fontFamily: FontFamily.semibold, fontSize: 13.5, lineHeight: 18 },
  /** Notas y subtitulos de cifras. */
  note:       { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  /** Distancias, tiempos, subtitulos. */
  detail:     { fontFamily: FontFamily.regular, fontSize: 12.5, lineHeight: 17 },
  /** Chips, tags, badges. */
  tag:        { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 16 },
  caption:    { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypeRole = keyof typeof Type;
