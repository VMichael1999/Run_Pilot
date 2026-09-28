/**
 * Direccion "Senal": pocas cosas en pantalla, una cifra grande y un color que
 * significa "actua ahora" (el lima del logo). El color comunica estado, nunca decoracion.
 */

/** Valores crudos de marca. Las pantallas usan los roles de `ThemeColors`, no esto. */
export const Palette = {
  ink:       '#111519', // tinta: texto y accion principal de dia
  asphalt:   '#EDF0F2', // asfalto claro: fondo de dia
  graphite:  '#0E1114', // grafito: fondo de noche
  lime:      '#D4E838', // lima Run Pilot: actua ahora
  limeStroke: '#7F8F12',
  logoBlack: '#000000', // fondo del icono, splash
  plateBlue: '#1C4FA0', // franja "PERU" de la placa
  splashTrack: '#26282B',
  splashText: '#8E969D',
  white:     '#FFFFFF',
} as const;

export const ThemeColors = {
  light: {
    background: Palette.asphalt,
    surface:    Palette.white,
    text:       Palette.ink,
    textMuted:  '#555E66',
    divider:    '#D5DADF',
    raise:      'rgba(17,21,25,0.14)',
    scrim:      'rgba(5,8,10,0.55)',

    // Accion principal: tinta de dia (el lima no se lee sobre blanco)
    primary:    Palette.ink,
    onPrimary:  Palette.white,
    // "Actua ahora": solicitud entrante, deslizar para aceptar
    signal:     Palette.lime,
    onSignal:   Palette.ink,

    // Estados del dominio
    online:      '#147443',
    onlineSoft:  '#DCEFE3',
    offline:     '#555E66',
    incoming:    Palette.lime,
    pickup:      '#2458C6',
    pickupSoft:  '#E1E9F9',
    onTrip:      '#147443',
    cash:        '#147443',
    cashSoft:    '#DCEFE3',
    digital:     '#2458C6',
    digitalSoft: '#E1E9F9',
    danger:      '#C8261B',
    onDanger:    Palette.white,
    dangerSoft:  '#FBE3E0',

    // Mapa y graficos
    route:      Palette.ink,
    routeCase:  Palette.white,
    chartBar:   '#B9C2CA',
    starFill:   Palette.lime,
    starStroke: Palette.limeStroke,

    statusBar: 'dark' as 'dark' | 'light',
  },
  dark: {
    background: Palette.graphite,
    surface:    '#171C21',
    text:       '#ECEFF1',
    textMuted:  '#A0A9B1',
    divider:    '#29313A',
    raise:      'rgba(0,0,0,0.5)',
    scrim:      'rgba(5,8,10,0.55)',

    // De noche la accion va en lima sobre grafito, igual que el logo
    primary:    Palette.lime,
    onPrimary:  Palette.ink,
    signal:     Palette.lime,
    onSignal:   Palette.ink,

    online:      '#3DCB7E',
    onlineSoft:  '#15301F',
    offline:     '#A0A9B1',
    incoming:    Palette.lime,
    pickup:      '#8DB1F5',
    pickupSoft:  '#1A2640',
    onTrip:      '#3DCB7E',
    cash:        '#3DCB7E',
    cashSoft:    '#15301F',
    digital:     '#8DB1F5',
    digitalSoft: '#1A2640',
    danger:      '#FF7A6E',
    onDanger:    Palette.ink,
    dangerSoft:  '#3A1916',

    route:      Palette.lime,
    routeCase:  '#101519',
    chartBar:   '#3A444D',
    starFill:   Palette.lime,
    starStroke: Palette.limeStroke,

    statusBar: 'light' as 'dark' | 'light',
  },
};

export type ThemeMode = keyof typeof ThemeColors;
export type AppTheme = (typeof ThemeColors)['light'];

/**
 * @deprecated Paleta anterior (azul marino + grises Tailwind). Solo la usan las
 * pantallas que aun no se migran a "Senal". Se elimina al terminar la Fase 2.
 */
export const Colors = {
  primary: '#001f3f',
  secondary: '#000289',
  tertiary: '#0003c7',

  backgroundLight: '#eeeeee',
  backgroundItemLight: '#fefefe',
  backgroundDark: '#000000',
  backgroundItemDark: '#2a2e32',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textDisabled: '#9ca3af',

  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',

  divider: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKey = keyof typeof Colors;
