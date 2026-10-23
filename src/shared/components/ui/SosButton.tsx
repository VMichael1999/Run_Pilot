import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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

/**
 * Boton de emergencia siempre visible durante el viaje. Un toque abre la hoja de
 * emergencia; la llamada se confirma ahi, asi que un toque accidental no llama a nadie.
 */
export function SosButton() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [abierto, setAbierto] = useState(false);

  const activar = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setAbierto(true);
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Botón de emergencia"
        accessibilityHint="Abre las opciones para pedir ayuda"
        onPress={activar}
        style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
      >
        <Ionicons name="shield-checkmark" size={22} color={Palette.white} />
        <Text style={styles.text}>SOS</Text>
      </Pressable>

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
  pillPressed: { backgroundColor: Palette.sosHold },
  text: { ...Type.field, fontWeight: Weight.bold, color: Palette.white, letterSpacing: 0.5 },
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
