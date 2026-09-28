import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit } from '@theme/spacing';
import { Curve, Duration, Spring } from '@theme/motion';

const PAD = 6;
const THUMB = Hit.slide - PAD * 2; // 48
const THRESHOLD = 0.76;

interface Props {
  label: string;
  onConfirm: () => void;
  /** Etiqueta para lectores de pantalla (se confirma con doble toque). */
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Deslizar para confirmar. Evita toques accidentales en un bache para acciones
 * que no se deshacen (aceptar un viaje, finalizar y cobrar).
 */
export function SlideToConfirm({ label, onConfirm, accessibilityLabel, disabled = false, style }: Props) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [trackW, setTrackW] = useState(0);
  const x = useSharedValue(0);
  const done = useSharedValue(false);
  const max = Math.max(0, trackW - THUMB - PAD * 2);

  // Pista de "desliza": un empujon corto cada 1.6 s mientras nadie lo toca
  useEffect(() => {
    if (reducedMotion || disabled || max === 0) return;
    x.value = withRepeat(
      withSequence(
        withTiming(10, { duration: Duration.slow, easing: Curve.nudge }),
        withTiming(0, { duration: Duration.slow, easing: Curve.nudge }),
        withDelay(800, withTiming(0, { duration: 0 })),
      ),
      -1,
    );
    return () => cancelAnimation(x);
  }, [reducedMotion, disabled, max, x]);

  const confirm = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!disabled && max > 0)
    .activeOffsetX(8)
    .failOffsetY([-20, 20])
    .onBegin(() => {
      cancelAnimation(x);
    })
    .onUpdate((e) => {
      if (done.value) return;
      x.value = Math.min(max, Math.max(0, e.translationX));
    })
    .onEnd(() => {
      if (done.value) return;
      if (x.value >= max * THRESHOLD) {
        done.value = true;
        x.value = withTiming(max, { duration: Duration.instant });
        runOnJS(confirm)();
      } else {
        x.value = withSpring(0, Spring.thumb);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: max > 0 ? 1 - Math.min(1, x.value / (max * 0.6)) : 1,
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width);

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint="Desliza hacia la derecha o toca dos veces para confirmar"
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'activate' && !disabled) confirm();
        }}
        style={[
          styles.track,
          { backgroundColor: theme.signal },
          disabled && styles.disabled,
          style,
        ]}
      >
        <Animated.Text
          style={[Type.bodyStrong, styles.label, { color: theme.onSignal }, labelStyle]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
        <Animated.View style={[styles.thumb, { backgroundColor: theme.onSignal }, thumbStyle]}>
          <Ionicons name="arrow-forward" size={22} color={theme.signal} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  track: {
    height: Hit.slide,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontSize: 15.5,
    textAlign: 'center',
    paddingLeft: THUMB + PAD,
    paddingRight: PAD * 2,
  },
  thumb: {
    position: 'absolute',
    left: PAD,
    top: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
});
