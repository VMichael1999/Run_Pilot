import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { Palette } from '@theme/colors';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { Curve } from '@theme/motion';
import appConfig from '../../../app.json';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const LOGO = 148;
const BAR_W = 120;
const FILL_W = BAR_W * 0.4;
const LOAD_MS = 1400;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Auth'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  useEffect(() => {
    if (reducedMotion) return;
    progress.value = withRepeat(withTiming(1, { duration: LOAD_MS, easing: Curve.standard }), -1);
  }, [progress, reducedMotion]);

  // Mismo recorrido que el HTML: de -100% a 300% del ancho del relleno
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -FILL_W + progress.value * FILL_W * 4 }],
  }));

  return (
    <View style={styles.container}>
      {/* Mismo tamano y posicion que el splash nativo para que el paso sea invisible */}
      <Image
        source={require('../../../assets/icon.png')}
        style={styles.logo}
        accessibilityRole="image"
        accessibilityLabel="Run Pilot"
      />
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Cargando"
      >
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={[styles.version, { bottom: insets.bottom + 28 }]}>
        v{appConfig.expo.version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.logoBlack,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['3xl'] - 2,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO * 0.24,
  },
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 4,
    backgroundColor: Palette.splashTrack,
    overflow: 'hidden',
  },
  fill: {
    width: FILL_W,
    height: '100%',
    borderRadius: 4,
    backgroundColor: Palette.lime,
  },
  version: {
    ...Type.caption,
    position: 'absolute',
    color: Palette.splashText,
  },
});
