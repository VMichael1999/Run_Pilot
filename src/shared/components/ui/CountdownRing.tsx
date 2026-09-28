import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily } from '@theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 58;
const STROKE = 5;
const R = (SIZE - STROKE) / 2 - 1.5; // 25, igual que el HTML
const C = 2 * Math.PI * R;

interface Props {
  /** Segundos que quedan (lo muestra el numero). */
  segundos: number;
  /** Duracion total; el anillo se vacia en ese tiempo en el hilo de UI. */
  total: number;
}

/** Anillo lima que cuenta el tiempo para aceptar. */
export function CountdownRing({ segundos, total }: Props) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const restante = useSharedValue(segundos / total);

  // El anillo se vacia en el hilo de UI, sin depender del intervalo del numero
  useEffect(() => {
    if (!reducedMotion) {
      restante.value = withTiming(0, { duration: segundos * 1000, easing: Easing.linear });
    }
    // Solo al montar (o si cambia la preferencia de movimiento)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Con movimiento reducido el anillo avanza a saltos junto con el numero
  useEffect(() => {
    if (reducedMotion) restante.value = segundos / total;
  }, [reducedMotion, segundos, total, restante]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - restante.value),
  }));

  const urgente = segundos <= 5;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`Quedan ${segundos} segundos para aceptar`}
    >
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={theme.divider} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={theme.signal}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          animatedProps={animatedProps}
        />
      </Svg>
      {/* Ancho fijo: General Sans no tiene cifras tabulares */}
      <Text
        style={[styles.n, { color: urgente ? theme.danger : theme.text }]}
        maxFontSizeMultiplier={1.2}
      >
        {segundos}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  n: {
    width: 32,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: 18,
  },
});
