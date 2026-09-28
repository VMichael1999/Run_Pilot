import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@theme/useAppTheme';
import { BorderRadius } from '@theme/spacing';
import { Curve } from '@theme/motion';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Bloque de carga con la forma del contenido que viene. Pulso suave; fijo con movimiento reducido. */
export function Skeleton({ width = '100%', height = 16, radius = BorderRadius.sm, style }: Props) {
  const theme = useAppTheme();
  const reduced = useReducedMotion();
  const o = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    o.value = withRepeat(withTiming(0.45, { duration: 800, easing: Curve.standard }), -1, true);
  }, [reduced, o]);

  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.divider }, anim, style]}
    />
  );
}
