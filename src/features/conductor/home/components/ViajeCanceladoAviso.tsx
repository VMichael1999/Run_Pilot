import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Cancelacion } from '@store/useConductorStore';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { Duration } from '@theme/motion';
import { TEXTO_MOTIVO } from '../../viaje/cancelacion';

/** Cuanto se muestra el aviso despues de cancelar. */
export const AVISO_CANCELADO_MS = 6000;

interface Props {
  cancelacion: Cancelacion | undefined;
}

/** Confirmacion breve en el inicio justo despues de cancelar un viaje. */
export function ViajeCanceladoAviso({ cancelacion }: Props) {
  const theme = useAppTheme();
  const restanteMs = cancelacion ? AVISO_CANCELADO_MS - (Date.now() - cancelacion.fechaMs) : 0;
  const [visible, setVisible] = useState(restanteMs > 0);

  useEffect(() => {
    if (restanteMs <= 0) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), restanteMs);
    return () => clearTimeout(t);
    // Solo se reprograma cuando llega otra cancelacion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelacion?.fechaMs]);

  if (!cancelacion || !visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(Duration.base)}
      exiting={FadeOut.duration(Duration.fast)}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <View style={styles.row}>
        <Ionicons name="close-circle" size={22} color={theme.danger} />
        <View style={styles.flex}>
          <Text style={[Type.label, { color: theme.text }]}>Viaje cancelado</Text>
          <Text style={[Type.detail, { color: theme.textMuted }]} numberOfLines={1}>
            {cancelacion.solicitud.pasajero.nombre} · {TEXTO_MOTIVO[cancelacion.motivo]}
          </Text>
        </View>
      </View>
      <View style={[styles.sep, { backgroundColor: theme.divider }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingBottom: 14 },
  flex: { flex: 1, gap: 2 },
  sep: { height: 1, marginHorizontal: -Spacing.lg, marginBottom: Spacing.md },
});
