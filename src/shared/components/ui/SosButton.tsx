import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
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
        onLongPress={activar}
        delayLongPress={MANTENER_MS}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: pressed ? theme.dangerSoft : theme.surface,
            borderColor: theme.danger,
          },
        ]}
      >
        <Ionicons name="shield-outline" size={16} color={theme.danger} />
        <Text style={[styles.text, { color: theme.danger }]}>SOS</Text>
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
    gap: 6,
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  text: { ...Type.section, fontFamily: FontFamily.bold },
  tip: {
    position: 'absolute',
    top: 44,
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
