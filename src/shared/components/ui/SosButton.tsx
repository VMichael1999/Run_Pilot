import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { Palette } from '@theme/colors';
import { Weight, Type } from '@theme/fonts';
import { BorderRadius, Hit, Shadow, Spacing } from '@theme/spacing';
import { AppButton } from './AppButton';

/** Numero al que llama el SOS. Policia Nacional del Peru. Cambiar aqui si se decide otro destino. */
export const SOS_TELEFONO = '105';

const MANTENER_MS = 1000;

/**
 * Boton de emergencia siempre visible durante el viaje. Se activa manteniendo
 * presionado 1 s para evitar falsas alarmas; un toque corto solo explica como usarlo.
 */
export function SosButton() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [pista, setPista] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const reducedMotion = useReducedMotion();

  // Relleno que avanza mientras se mantiene presionado: muestra cuanto falta
  const carga = useSharedValue(0);
  const empezarCarga = () => {
    if (reducedMotion) return;
    carga.value = withTiming(1, { duration: MANTENER_MS, easing: Easing.linear });
  };
  const soltar = () => {
    cancelAnimation(carga);
    carga.value = 0;
  };
  const cargaStyle = useAnimatedStyle(() => ({ width: `${carga.value * 100}%` }));

  const mostrarPista = () => {
    setPista(true);
    setTimeout(() => setPista(false), 2500);
  };

  const activar = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setPista(false);
    setAbierto(true);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Botón de emergencia"
        accessibilityHint="Mantén presionado un segundo para pedir ayuda"
        accessibilityActions={[{ name: 'activate' }, { name: 'longpress' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'longpress' || e.nativeEvent.actionName === 'activate') activar();
        }}
        onPress={mostrarPista}
        onLongPress={() => {
          soltar();
          activar();
        }}
        onPressIn={empezarCarga}
        onPressOut={soltar}
        delayLongPress={MANTENER_MS}
        style={styles.pill}
      >
        <Animated.View style={[styles.carga, cargaStyle]} pointerEvents="none" />
        <Ionicons name="shield-checkmark" size={22} color={Palette.white} />
        <Text style={styles.text}>SOS</Text>
      </Pressable>

      {pista && (
        <View style={[styles.tip, { backgroundColor: theme.text }]} pointerEvents="none">
          <Text style={[Type.caption, { color: theme.surface }]}>Mantén presionado 1 s</Text>
        </View>
      )}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={() => setAbierto(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.xl }]}
            accessibilityViewIsModal
          >
            <View style={styles.sheetHead}>
              <View style={[styles.sheetIcon, { backgroundColor: theme.dangerSoft }]}>
                <Ionicons name="shield-outline" size={22} color={theme.danger} />
              </View>
              <Text accessibilityRole="header" style={[Type.title, { color: theme.text }]}>Emergencia</Text>
            </View>
            <Text style={[Type.body, { color: theme.textMuted }]}>
              Se abrirá el marcador de tu teléfono con la Policía Nacional.
            </Text>
            <AppButton
              label={`Llamar a la Policía · ${SOS_TELEFONO}`}
              icon={<Ionicons name="call" size={20} color={theme.onDanger} />}
              onPress={() => {
                setAbierto(false);
                void Linking.openURL(`tel:${SOS_TELEFONO}`);
              }}
              style={{ backgroundColor: theme.danger }}
              labelStyle={{ color: theme.onDanger }}
            />
            <AppButton label="Cancelar" variant="ghost" size="md" onPress={() => setAbierto(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: Hit.min,
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.sos,
    overflow: 'hidden',
    ...Shadow.raise,
  },
  carga: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
    backgroundColor: Palette.sosHold,
  },
  text: { ...Type.field, fontWeight: Weight.bold, color: Palette.white, letterSpacing: 0.5 },
  tip: {
    position: 'absolute',
    top: Hit.min + Spacing.xs,
    right: 0,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg + 2,
    gap: 14,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sheetIcon: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
