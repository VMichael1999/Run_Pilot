import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion as _useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

const useSafeReducedMotion = () => {
  try {
    return typeof _useReducedMotion === 'function' ? _useReducedMotion() : false;
  } catch {
    return false;
  }
};
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius } from '@theme/spacing';
import { Type } from '@theme/fonts';
import { Palette } from '@theme/colors';

export type OTPStatus = 'idle' | 'verifying' | 'success' | 'error';

export interface OTPAnimatedFieldProps {
  /** Cantidad de casillas (por defecto 4). */
  length?: number;
  /** Código actual ingresado. */
  code: string;
  /** Estado actual de la animación. */
  status?: OTPStatus;
  /** Si hay un mensaje de error activo. */
  hasError?: boolean;
  /** Tamaño de cada casilla en píxeles. */
  boxSize?: number;
  /** Espaciado entre casillas en la fila. */
  gap?: number;
  /** Color de acento para foco y órbita. */
  accentColor?: string;
  /** Color para el badge y checkmark de éxito. */
  successColor?: string;
  /** Color para el estado de error y sacudida. */
  errorColor?: string;
  /** Etiqueta de accesibilidad. */
  accessibilityLabel?: string;
}

const DEFAULT_SUCCESS_COLOR = '#2ECC71';
const DEFAULT_ERROR_COLOR = '#FF4D4F';
const ORBIT_BOX_SCALE = 0.64;
const ORBIT_PERIOD_MS = 2600;
const MORPH_DURATION_MS = 700;
const SUCCESS_DURATION_MS = 1000;

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Funciones de aceleración con directiva worklet para ejecución nativa en hilo de UI */
function easeInterval(t: number, begin: number, end: number) {
  'worklet';
  return Math.min(Math.max((t - begin) / (end - begin), 0), 1);
}

function easeInCubic(t: number) {
  'worklet';
  return t * t * t;
}

function easeOutCubic(t: number) {
  'worklet';
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t: number) {
  'worklet';
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Cursor parpadeante en la casilla activa */
function BlinkingCursor({ color }: { color: string }) {
  const reduced = useSafeReducedMotion();
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 500 })
      ),
      -1
    );
  }, [reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.cursor, { backgroundColor: color }, style]} />;
}

/**
 * Componente de campo OTP animado donde las casillas se transforman en el loader orbital.
 * Reproduce fielmente las curvas, geometrías, trazo vectorial del checkmark y transiciones
 * de otp_animated_fields (Ibrahim-Diab).
 */
export function OTPAnimatedField({
  length = 4,
  code,
  status = 'idle',
  hasError = false,
  boxSize = 62,
  gap = 12,
  accentColor,
  successColor = DEFAULT_SUCCESS_COLOR,
  errorColor = DEFAULT_ERROR_COLOR,
  accessibilityLabel,
}: OTPAnimatedFieldProps) {
  const theme = useAppTheme();
  const reducedMotion = useSafeReducedMotion();

  const accent = accentColor ?? theme.signal ?? Palette.lime;

  // Radio orbital matemático de otp_animated_fields:
  // spacingRadius = length >= 3 ? orbitBoxSize * 1.5 / (2 * sin(pi / n)) : 0
  const orbitBoxSize = boxSize * ORBIT_BOX_SCALE;
  const sinFactor = 2 * Math.sin(Math.PI / Math.max(length, 3));
  const spacingRadius = (orbitBoxSize * 1.5) / sinFactor;
  const orbitRadius = Math.max(boxSize * 0.83, spacingRadius);

  // Radios de anillos orbitales interior y exterior
  const innerRingRadius = orbitRadius + orbitBoxSize * 0.19;
  const outerRingRadius = orbitRadius + orbitBoxSize * 0.62;

  // Radio y proporciones del badge de éxito y checkmark
  const badgeRadius = innerRingRadius * 0.7;
  const badgeSvgSize = (badgeRadius + 8) * 2;
  const badgeCenter = badgeRadius + 8;
  const checkStrokeWidth = Math.max(3.2, badgeRadius * 0.13);

  // Puntos del checkmark en coordenadas locales del badge (idénticos a otp_animated_fields de Flutter):
  // center.dx - radius * 0.42, center.dy + radius * 0.02
  // center.dx - radius * 0.12, center.dy + radius * 0.32
  // center.dx + radius * 0.45, center.dy - radius * 0.30
  const p0 = { x: badgeCenter - badgeRadius * 0.42, y: badgeCenter + badgeRadius * 0.02 };
  const p1 = { x: badgeCenter - badgeRadius * 0.12, y: badgeCenter + badgeRadius * 0.32 };
  const p2 = { x: badgeCenter + badgeRadius * 0.45, y: badgeCenter - badgeRadius * 0.30 };
  const checkPath = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;

  // Longitud euclídea del trazo del checkmark para animación strokeDashoffset
  const leg1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const leg2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const totalCheckLength = leg1 + leg2;

  // Valores compartidos de animación
  const morph = useSharedValue(0);             // 0 = fila, 1 = órbita
  const rotation = useSharedValue(0);          // Rotación continua de órbita
  const successProgress = useSharedValue(0);   // 0 -> 1 durante la fase de éxito (1000ms)
  const shakeX = useSharedValue(0);            // Desplazamiento horizontal de sacudida

  // Control de estados de animación
  React.useEffect(() => {
    if (status === 'verifying') {
      successProgress.value = 0;
      shakeX.value = 0;

      // 1. Morphing progresivo y fluido hacia la órbita (700ms easeInOutCubic)
      morph.value = withTiming(1, {
        duration: reducedMotion ? 0 : MORPH_DURATION_MS,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      });

      // 2. Rotación orbital continua (periodo 2.6s lineal)
      if (!reducedMotion) {
        rotation.value = 0;
        rotation.value = withRepeat(
          withTiming(2 * Math.PI, {
            duration: ORBIT_PERIOD_MS,
            easing: Easing.linear,
          }),
          -1,
          false
        );
      }
    } else if (status === 'success') {
      // Timeline unificado de éxito (1000ms):
      // 0.00 -> 0.45: Colapso centrípeto de las casillas y desvanecimiento de anillos
      // 0.30 -> 0.75: Despliegue elástico del badge circular verde (outBack)
      // 0.55 -> 1.00: Dibujo vectorial continuo del checkmark (outCubic)
      successProgress.value = 0;
      successProgress.value = withTiming(1, {
        duration: reducedMotion ? 50 : SUCCESS_DURATION_MS,
        easing: Easing.linear,
      });
    } else if (status === 'error') {
      successProgress.value = 0;

      // 1. Las casillas regresan volando de la órbita a la fila (morph 1 -> 0)
      morph.value = withTiming(0, {
        duration: reducedMotion ? 0 : 480,
        easing: Easing.out(Easing.cubic),
      });
      rotation.value = 0;

      // 2. Al aterrizar en la fila, sacudida horizontal amortiguada sin(6*pi*t)*(1-t)
      if (!reducedMotion) {
        shakeX.value = withSequence(
          withTiming(0, { duration: 480 }), // Esperar a que toquen la fila
          withTiming(14, { duration: 55 }),
          withTiming(-14, { duration: 55 }),
          withTiming(10, { duration: 55 }),
          withTiming(-10, { duration: 55 }),
          withTiming(6, { duration: 55 }),
          withTiming(-6, { duration: 55 }),
          withTiming(2, { duration: 55 }),
          withTiming(-2, { duration: 55 }),
          withTiming(0, { duration: 55 })
        );
      }
    } else {
      // Estado Idle
      morph.value = withTiming(0, { duration: 250 });
      rotation.value = 0;
      successProgress.value = 0;
      shakeX.value = 0;
    }
  }, [status, reducedMotion]);

  // Si hay error en estado idle, sacudir brevemente la fila
  React.useEffect(() => {
    if (hasError && status === 'idle' && !reducedMotion) {
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [hasError, status, reducedMotion]);

  // Anillos orbitales (interior delgado y exterior punteado)
  const ringsContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const appear = easeOutCubic(easeInterval(morph.value, 0.35, 1));
    const ringsOut = easeInCubic(easeInterval(successProgress.value, 0, 0.45));
    const opacity = appear * (1 - ringsOut);
    const scale = (0.6 + 0.4 * appear) * (1 - 0.45 * ringsOut);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Rotación del anillo punteado exterior en sentido contrario a las casillas
  const outerRingRotateStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${-rotation.value}rad` }],
    };
  });

  // Badge circular verde con rebote elástico (outBack entre 0.30 y 0.75 como en Flutter)
  const badgeContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const t = easeInterval(successProgress.value, 0.30, 0.75);
    const scale = easeOutBack(t);
    const opacity = t > 0.01 ? 1 : 0;

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Trazo progresivo del checkmark (outCubic entre 0.55 y 1.00 como en Flutter)
  const checkmarkAnimatedProps = useAnimatedProps(() => {
    'worklet';
    const t = easeInterval(successProgress.value, 0.55, 1.00);
    const drawProgress = easeOutCubic(t);
    const offset = totalCheckLength * (1 - drawProgress);

    return {
      strokeDashoffset: offset,
    };
  });

  const containerHeight = Math.max(boxSize * 2, outerRingRadius * 2 + 16);
  const canvasSize = outerRingRadius * 2 + 16;
  const canvasCenter = canvasSize / 2;

  return (
    <View
      style={[styles.container, { width: '100%', height: containerHeight }]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `Código de verificación, ${code.length} de ${length} dígitos`}
    >
      {/* Capa de anillos orbitales SVG */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.orbitCanvas,
          { width: canvasSize, height: canvasSize },
          ringsContainerStyle,
        ]}
      >
        {/* Anillo interior delgado */}
        <Svg width={canvasSize} height={canvasSize} style={StyleSheet.absoluteFill}>
          <Circle
            cx={canvasCenter}
            cy={canvasCenter}
            r={innerRingRadius}
            stroke={theme.divider}
            strokeWidth={1}
            fill="none"
            opacity={0.4}
          />
        </Svg>

        {/* Anillo exterior punteado con contrarotación */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { width: canvasSize, height: canvasSize },
            outerRingRotateStyle,
          ]}
        >
          <Svg width={canvasSize} height={canvasSize}>
            <Circle
              cx={canvasCenter}
              cy={canvasCenter}
              r={outerRingRadius}
              stroke={accent}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="2, 7"
              fill="none"
              opacity={0.65}
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* Casillas individuales con despegue escalonado, órbita suave y colapso armónico */}
      {Array.from({ length }).map((_, index) => {
        const digit = code[index];
        const isCurrentActive = index === code.length && status === 'idle';

        return (
          <AnimatedBox
            key={index}
            index={index}
            length={length}
            digit={digit}
            isActive={isCurrentActive}
            status={status}
            hasError={hasError}
            boxSize={boxSize}
            gap={gap}
            orbitRadius={orbitRadius}
            accentColor={accent}
            successColor={successColor}
            errorColor={errorColor}
            morph={morph}
            rotation={rotation}
            successProgress={successProgress}
            shakeX={shakeX}
            theme={theme}
          />
        );
      })}

      {/* Badge central de verificación exitosa 100% SVG (cero polígonos, círculos matemáticos puros) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.successBadge,
          {
            width: badgeSvgSize,
            height: badgeSvgSize,
          },
          badgeContainerStyle,
        ]}
      >
        <Svg width={badgeSvgSize} height={badgeSvgSize}>
          {/* Círculo de relleno translúcido al 16% */}
          <Circle
            cx={badgeCenter}
            cy={badgeCenter}
            r={badgeRadius}
            fill={`${successColor}29`}
          />
          {/* Borde circular suave de 2px */}
          <Circle
            cx={badgeCenter}
            cy={badgeCenter}
            r={badgeRadius}
            stroke={successColor}
            strokeWidth={2}
            fill="none"
          />
          {/* Trazo vectorial del checkmark */}
          <AnimatedPath
            d={checkPath}
            stroke={successColor}
            strokeWidth={checkStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${totalCheckLength} ${totalCheckLength}`}
            animatedProps={checkmarkAnimatedProps}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

interface AnimatedBoxProps {
  index: number;
  length: number;
  digit?: string;
  isActive: boolean;
  status: OTPStatus;
  hasError: boolean;
  boxSize: number;
  gap: number;
  orbitRadius: number;
  accentColor: string;
  successColor: string;
  errorColor: string;
  morph: SharedValue<number>;
  rotation: SharedValue<number>;
  successProgress: SharedValue<number>;
  shakeX: SharedValue<number>;
  theme: ReturnType<typeof useAppTheme>;
}

function AnimatedBox({
  index,
  length,
  digit,
  isActive,
  status,
  hasError,
  boxSize,
  gap,
  orbitRadius,
  accentColor,
  successColor,
  errorColor,
  morph,
  rotation,
  successProgress,
  shakeX,
  theme,
}: AnimatedBoxProps) {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';

    // Desfase escalonado (stagger) para que cada casilla despegue una a una:
    // delay = length > 1 ? min(0.08, 0.3 / (length - 1)) : 0
    const delay = length > 1 ? Math.min(0.08, 0.3 / (length - 1)) : 0;
    const windowProgress = 1 - delay * (length - 1);
    const rawProgress = (morph.value - delay * index) / Math.max(windowProgress, 0.001);
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Curva cúbica in-out (easeInOutCubic)
    const t = easeInOutCubic(progress);

    // Colapso centrípeto durante la fase de éxito (0.00 a 0.32)
    const convergeT = easeInterval(successProgress.value, 0, 0.32);
    const convergence = easeInCubic(convergeT);

    // Posición en fila horizontal
    const rowX = (index - (length - 1) / 2) * (boxSize + gap) + shakeX.value;
    const rowY = 0;

    // Posición en órbita con envolvente simétrica sobre la cúspide (otp_animated_fields):
    // angle = -pi / 2 + (index - (length - 1) / 2) * step + rotation
    const step = (2 * Math.PI) / length;
    const baseAngle = -Math.PI / 2 + (index - (length - 1) / 2) * step;
    const currentAngle = baseAngle + rotation.value;
    const currentRadius = orbitRadius * (1 - convergence);

    const orbitX = currentRadius * Math.cos(currentAngle);
    const orbitY = currentRadius * Math.sin(currentAngle);

    // Posición interpolada entre fila y órbita
    const x = rowX + (orbitX - rowX) * t;
    const y = rowY + (orbitY - rowY) * t;

    // Escala: 1.0 en fila -> 0.64 en órbita -> colapso completo a 0 al converger
    const scale = (1 + (ORBIT_BOX_SCALE - 1) * t) * Math.max(0, 1 - convergence);

    // Opacidad: se desvanece a 0 rápidamente antes de que el badge se expanda en 0.30
    const opacity = Math.max(0, 1 - convergeT * 1.5);

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      opacity,
      display: opacity <= 0.001 ? 'none' : 'flex',
    };
  });

  // Color de borde dinámico según el estado visual
  const borderColor =
    hasError || status === 'error'
      ? errorColor
      : status === 'verifying'
      ? accentColor
      : status === 'success'
      ? successColor
      : isActive
      ? theme.text
      : digit
      ? theme.text
      : theme.divider;

  // Resplandor sutil durante la órbita
  const isOrbiting = status === 'verifying';

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: BorderRadius.lg,
          backgroundColor: theme.surface,
          borderColor,
          shadowColor: isOrbiting ? accentColor : 'transparent',
          shadowOpacity: isOrbiting ? 0.35 : 0,
          shadowRadius: isOrbiting ? 8 : 0,
          elevation: isOrbiting ? 4 : 0,
        },
        animatedStyle,
      ]}
    >
      {/* Resplandor radial suave en la esquina superior derecha (idéntico al del repo) */}
      {isOrbiting ? (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id={`cornerGlow-${index}`} cx="100%" cy="0%" r="85%">
              <Stop offset="0%" stopColor={accentColor} stopOpacity={0.25} />
              <Stop offset="75%" stopColor={accentColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            rx={BorderRadius.lg}
            fill={`url(#cornerGlow-${index})`}
          />
        </Svg>
      ) : null}

      {digit ? (
        <Text style={[styles.digit, { color: theme.text }]}>{digit}</Text>
      ) : isActive ? (
        <BlinkingCursor color={theme.text} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitCanvas: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    position: 'absolute',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  digit: {
    ...Type.otp,
  },
  cursor: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  successBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
