import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/**
 * Tokens de motion para Reanimated. Cada animacion debe orientar, confirmar una
 * accion o suavizar un cambio de estado; si no, no va. Respeta `useReducedMotion()`.
 */
export const Duration = {
  instant: 100, // respuesta a un toque
  fast:    180, // cambio de estado de un control
  base:    240, // entrada/salida de paneles
  slow:    400, // cambio de fase del viaje
} as const;

export const Curve = {
  standard:   Easing.bezier(0.2, 0, 0, 1),
  enter:      Easing.bezier(0, 0, 0, 1),
  exit:       Easing.bezier(0.3, 0, 1, 1),
  /** Pista de "desliza" en el pulgar (mismo que el nudge del HTML). */
  nudge:      Easing.bezier(0.3, 0.7, 0.3, 1),
  linear:     Easing.linear,
} as const;

export const Timing = {
  fast:  { duration: Duration.fast, easing: Curve.standard },
  base:  { duration: Duration.base, easing: Curve.standard },
  enter: { duration: Duration.base, easing: Curve.enter },
  exit:  { duration: Duration.fast, easing: Curve.exit },
  slow:  { duration: Duration.slow, easing: Curve.standard },
} satisfies Record<string, WithTimingConfig>;

export const Spring = {
  /** Solicitud entrante subiendo desde abajo: resorte corto, sin rebote largo. */
  sheet: { damping: 22, stiffness: 240, mass: 1 },
  /** Pulgar del deslizador volviendo a su sitio. */
  thumb: { damping: 18, stiffness: 260, mass: 0.8 },
} satisfies Record<string, WithSpringConfig>;
