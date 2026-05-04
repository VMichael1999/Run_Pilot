import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EstadoViaje } from '@features/conductor/types';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const { width: SW } = Dimensions.get('window');

const HANDLE      = 60;
const TRACK_PAD   = 4;
const OUTER_PAD   = Spacing.lg * 2;
const MAX_SLIDE   = SW - OUTER_PAD - HANDLE - TRACK_PAD * 2;

const CONFIG: Partial<Record<EstadoViaje, { label: string; color: string }>> = {
  aceptado:  { label: 'IR POR EL PASAJERO',  color: Colors.primary },
  en_camino: { label: 'LLEGUE AL ORIGEN',    color: '#4A6CF7'      },
  esperando: { label: 'INICIAR VIAJE',        color: Colors.success  },
  iniciado:  { label: 'LLEGUE AL DESTINO',   color: '#4A6CF7'      },
};

interface Props {
  estado: EstadoViaje;
  onPress: () => void;
}

export function BotonAccion({ estado, onPress }: Props) {
  const config = CONFIG[estado];

  const translateX = useRef(new Animated.Value(0)).current;
  const confirmed  = useRef(false);
  const maxRef     = useRef(MAX_SLIDE);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderMove: (_, gs) => {
        if (confirmed.current) return;
        translateX.setValue(Math.max(0, Math.min(maxRef.current, gs.dx)));
      },
      onPanResponderRelease: (_, gs) => {
        if (confirmed.current) return;
        if (gs.dx >= maxRef.current * 0.76) {
          confirmed.current = true;
          Animated.timing(translateX, {
            toValue: maxRef.current,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            onPress();
            setTimeout(() => {
              confirmed.current = false;
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: false,
                bounciness: 8,
              }).start();
            }, 180);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  if (!config) return null;

  const labelOpacity = translateX.interpolate({
    inputRange: [0, SW * 0.35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.track, { backgroundColor: config.color + '18' }]}
        onLayout={(e) => {
          maxRef.current = e.nativeEvent.layout.width - HANDLE - TRACK_PAD * 2;
        }}
      >
        {/* Label centered */}
        <Animated.Text style={[styles.label, { color: config.color, opacity: labelOpacity }]}>
          {config.label}
        </Animated.Text>

        {/* Sliding handle */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.handle,
            { backgroundColor: config.color, transform: [{ translateX }] },
          ]}
        >
          <Ionicons name="chevron-forward" size={26} color={Colors.white} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  track: {
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 1,
  },
  handle: {
    position: 'absolute',
    left: TRACK_PAD,
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
