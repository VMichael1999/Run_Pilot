import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';

interface Props {
  titulo: string;
  detalle?: string;
  icono: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

/** Opcion de una lista de eleccion unica (metodo de pago, destino del retiro). */
export function OptionRow({ titulo, detalle, icono, selected, onPress }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={detalle ? `${titulo}. ${detalle}` : titulo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: selected ? theme.text : theme.divider,
          borderWidth: selected ? 2 : 1,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.background }]}>
        <Ionicons name={icono} size={20} color={theme.text} />
      </View>
      <View style={styles.flex}>
        <Text style={[Type.label, { color: theme.text }]}>{titulo}</Text>
        {detalle ? <Text style={[Type.caption, { color: theme.textMuted }]}>{detalle}</Text> : null}
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? theme.text : theme.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  pressed: { opacity: 0.7 },
  icon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
});
