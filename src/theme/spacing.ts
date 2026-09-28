export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  xs: 6,       // placa
  sm: 10,
  md: 12,      // info, filas de menu, botones chicos
  control: 14, // botones redondos del mapa, inputs, teclado
  lg: 16,      // boton principal, tarjetas
  xl: 18,      // deslizar, bloque de saldo, monto a cobrar
  sheet: 24,   // paneles inferiores
  full: 9999,
} as const;

/** Tamanos minimos tactiles (dp). */
export const Hit = {
  min: 48,     // cualquier cosa tocable
  control: 44, // botones de icono sobre el mapa (con hitSlop hasta 48)
  action: 56,  // acciones principales en viaje
  slide: 60,   // deslizar para aceptar / finalizar
} as const;

/** hitSlop para llevar un control de 44 dp a 48 dp. */
export const HitSlop = { top: 4, bottom: 4, left: 4, right: 4 } as const;

export const Shadow = {
  sm: {
    shadowColor: '#111519',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  /** Elementos flotando sobre el mapa. */
  raise: {
    shadowColor: '#111519',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  /** Paneles inferiores sobre el mapa. */
  sheet: {
    shadowColor: '#111519',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
