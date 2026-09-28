import type { TextStyle } from 'react-native';

/**
 * Letra del sistema (San Francisco en iOS, Roboto en Android) con los pesos
 * nativos de React Native. No se carga ninguna fuente externa: la negrita es
 * `fontWeight`, que el sistema aplica siempre.
 */
export const Weight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

/**
 * Jerarquia de pesos (que marca la negrita):
 * - Bold 700: titulos (pantalla, panel, tarjeta, seccion), opciones del menu,
 *   nombres de personas, el estado en una palabra y las cifras de dinero.
 * - Semibold 600: botones, pestanas, etiquetas y la fila principal de una lista.
 * - Medium 500: direcciones y datos secundarios destacados.
 * - Regular 400: texto corrido, detalles, subtitulos y notas.
 * La negrita dice "que es esto"; si todo va en negrita, nada destaca.
 *
 * Escala por rol. Las cifras que cambian en vivo usan ancho minimo fijo o
 * alineacion a la derecha para que no se muevan.
 */
export const Type = {
  /** Cifra protagonista: precio de la solicitud, saldo. */
  price:      { fontWeight: Weight.bold, fontSize: 44, lineHeight: 54, letterSpacing: -1.3 },
  /** Monto a cobrar en el panel de cobro. */
  priceXL:    { fontWeight: Weight.bold, fontSize: 52, lineHeight: 64, letterSpacing: -1.5 },
  /** "S/" delante del precio. */
  currency:   { fontWeight: Weight.semibold, fontSize: 22, lineHeight: 30 },
  /** Total de ingresos. */
  hero:       { fontWeight: Weight.bold, fontSize: 40, lineHeight: 50, letterSpacing: -1.2 },
  /** Titulo de pantalla de entrada (login, codigo). */
  display:    { fontWeight: Weight.bold, fontSize: 31, lineHeight: 38, letterSpacing: -0.8 },
  /** Titulo de pantalla interna (Ingresos, Billetera). */
  title:      { fontWeight: Weight.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.5 },
  /** Cifra secundaria destacada (minutos al destino). */
  figure:     { fontWeight: Weight.semibold, fontSize: 22, lineHeight: 24 },
  /** Marca junto al logo. */
  brand:      { fontWeight: Weight.bold, fontSize: 20, lineHeight: 24, letterSpacing: -0.4 },
  /** Accion principal (botones de 56 dp). */
  action:     { fontWeight: Weight.semibold, fontSize: 17, lineHeight: 22 },
  /** Titulo de tarjeta, de estado vacio o de un bloque. */
  heading:    { fontWeight: Weight.bold, fontSize: 16, lineHeight: 21 },
  /** Titulo de un panel inferior ("Buscando viajes cerca de ti"). */
  panelTitle: { fontWeight: Weight.bold, fontSize: 17, lineHeight: 22 },
  /** Titulo de seccion dentro de una pantalla ("Método de recarga"). */
  sectionTitle: { fontWeight: Weight.bold, fontSize: 15, lineHeight: 20 },
  /** Nombre de una persona (pasajero, conductor). */
  name:       { fontWeight: Weight.bold, fontSize: 15, lineHeight: 20 },
  /** Estado en una palabra sobre el mapa ("Conectado"). */
  status:     { fontWeight: Weight.bold, fontSize: 14, lineHeight: 19 },
  /** Accion secundaria, texto de apoyo importante. */
  bodyStrong: { fontWeight: Weight.semibold, fontSize: 15, lineHeight: 21 },
  body:       { fontWeight: Weight.regular, fontSize: 15, lineHeight: 21 },
  /** Opciones del menu lateral. */
  menu:       { fontWeight: Weight.bold, fontSize: 15, lineHeight: 20 },
  /** Monto en listas (historial, movimientos). */
  amount:     { fontWeight: Weight.bold, fontSize: 15, lineHeight: 20 },
  /** Precio en tarjetas del tablero. */
  priceCard:  { fontWeight: Weight.bold, fontSize: 26, lineHeight: 30, letterSpacing: -0.6 },
  /** Digitos del codigo de verificacion. */
  otp:        { fontWeight: Weight.semibold, fontSize: 28, lineHeight: 34 },
  /** Teclas del teclado numerico. */
  key:        { fontWeight: Weight.medium, fontSize: 22, lineHeight: 28 },
  /** Texto dentro de campos grandes (telefono). */
  field:      { fontWeight: Weight.semibold, fontSize: 18, lineHeight: 24 },
  /** Pregunta de una pantalla (calificar). */
  question:   { fontWeight: Weight.bold, fontSize: 20, lineHeight: 25, letterSpacing: -0.2 },
  /** Cifra de un indicador (horas, por viaje). */
  kpi:        { fontWeight: Weight.bold, fontSize: 17, lineHeight: 22 },
  kpiLabel:   { fontWeight: Weight.regular, fontSize: 11.5, lineHeight: 15 },
  /** Direcciones y nombres. */
  address:    { fontWeight: Weight.medium, fontSize: 14.5, lineHeight: 20 },
  label:      { fontWeight: Weight.semibold, fontSize: 14, lineHeight: 19 },
  /** Filas de desglose. */
  row:        { fontWeight: Weight.regular, fontSize: 14, lineHeight: 19 },
  /** Titulo de seccion y encabezados de grupo (en oracion normal). */
  section:    { fontWeight: Weight.semibold, fontSize: 13, lineHeight: 18 },
  /** Chips, hora en listas, datos secundarios destacados. */
  small:      { fontWeight: Weight.medium, fontSize: 13.5, lineHeight: 18 },
  smallStrong: { fontWeight: Weight.semibold, fontSize: 13.5, lineHeight: 18 },
  /** Notas y subtitulos de cifras. */
  note:       { fontWeight: Weight.regular, fontSize: 13, lineHeight: 18 },
  /** Distancias, tiempos, subtitulos. */
  detail:     { fontWeight: Weight.regular, fontSize: 12.5, lineHeight: 17 },
  /** Chips, tags, badges. */
  tag:        { fontWeight: Weight.semibold, fontSize: 12, lineHeight: 16 },
  caption:    { fontWeight: Weight.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypeRole = keyof typeof Type;
