import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';

export interface AccionViaje {
  etiqueta: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  titulo: string;
  acciones: AccionViaje[];
  onCerrar: () => void;
}

/** Menu de "mas opciones" de una tarjeta del historial. */
export function AccionesViajeSheet({ visible, titulo, acciones, onCerrar }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.scrim }]} onPress={onCerrar} accessibilityLabel="Cerrar">
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.lg }]}
          accessibilityViewIsModal
        >
          <Text accessibilityRole="header" style={[Type.section, styles.titulo, { color: theme.textMuted }]}>{titulo}</Text>
          {acciones.map((a) => (
            <Pressable
              key={a.etiqueta}
              accessibilityRole="button"
              accessibilityLabel={a.etiqueta}
              onPress={() => { onCerrar(); a.onPress(); }}
              style={({ pressed }) => [styles.fila, pressed && { backgroundColor: theme.background }]}
            >
              <Ionicons name={a.icono} size={22} color={theme.text} />
              <Text style={[Type.menu, { color: theme.text }]}>{a.etiqueta}</Text>
            </Pressable>
          ))}
          <View style={[styles.sep, { backgroundColor: theme.divider }]} />
          <Pressable
            accessibilityRole="button"
            onPress={onCerrar}
            style={({ pressed }) => [styles.fila, pressed && { backgroundColor: theme.background }]}
          >
            <Ionicons name="close" size={22} color={theme.textMuted} />
            <Text style={[Type.menu, { color: theme.textMuted }]}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  titulo: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Hit.min + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sep: { height: 1, marginVertical: Spacing.xs, marginHorizontal: Spacing.md },
});
