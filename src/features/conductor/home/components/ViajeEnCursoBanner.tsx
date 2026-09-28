import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { EstadoViaje, Solicitud } from '../../types';
import { useSegundosDesde } from '@shared/hooks/useSegundosDesde';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Hit, Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';
import { textoViajeEnCurso } from '../viajeEnCurso';

interface Props {
  solicitud: Solicitud;
  estado: EstadoViaje;
  esperandoDesde: number | null;
  onContinuar: () => void;
}

/**
 * Parte superior del panel del inicio cuando hay un viaje activo: dice que
 * hacer ahora y lleva de vuelta al viaje en la misma fase.
 */
export function ViajeEnCursoBanner({ solicitud, estado, esperandoDesde, onContinuar }: Props) {
  const theme = useAppTheme();
  const esperandoSeg = useSegundosDesde(estado === 'esperando' ? esperandoDesde : null);
  const texto = textoViajeEnCurso(solicitud, estado, esperandoSeg);
  if (!texto) return null;

  return (
    <Animated.View entering={FadeInDown.duration(Duration.base)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Viaje en curso. ${texto.accion}. ${texto.detalle}. Continuar con el viaje`}
        onPress={onContinuar}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.flex}>
          <View style={styles.head}>
            <View style={[styles.dot, { backgroundColor: theme.online }]} />
            <Text style={[Type.tag, { color: theme.online }]}>Viaje en curso</Text>
          </View>
          {/* El texto cambia con la fase: fundido corto para que se note */}
          <Animated.View key={estado} entering={FadeIn.duration(Duration.base)}>
            <Text style={[Type.panelTitle, { color: theme.text }]} numberOfLines={1}>
              {texto.accion}
            </Text>
            <Text style={[Type.detail, { color: theme.textMuted }]} numberOfLines={1}>
              {texto.detalle}
            </Text>
          </Animated.View>
        </View>
        <View style={[styles.go, { backgroundColor: theme.primary }]}>
          <Ionicons name="chevron-forward" size={22} color={theme.onPrimary} />
        </View>
      </Pressable>
      <View style={[styles.sep, { backgroundColor: theme.divider }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Hit.action,
    paddingBottom: 14,
  },
  pressed: { opacity: 0.7 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  go: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sep: { height: 1, marginHorizontal: -Spacing.lg },
});
