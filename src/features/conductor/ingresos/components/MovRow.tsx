import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { formatSoles } from '@shared/utils/format';
import { Spacing } from '@theme/spacing';

interface Props {
  titulo: string;
  detalle: string;
  monto: number;
  /** Mostrar "+" y verde en los ingresos. Los descuentos van en tinta, sin rojo. */
  conSigno?: boolean;
}

/** Fila de movimiento: que fue, cuando, y el monto a la derecha. */
export function MovRow({ titulo, detalle, monto, conSigno = false }: Props) {
  const theme = useAppTheme();
  const positivo = monto > 0;
  const texto = conSigno && positivo ? `+ ${formatSoles(monto)}` : formatSoles(monto);
  return (
    <View
      style={[styles.row, { borderBottomColor: theme.divider }]}
      accessible
      accessibilityLabel={`${titulo}, ${texto}, ${detalle}`}
    >
      <View style={styles.flex}>
        <Text style={[styles.titulo, { color: theme.text }]}>{titulo}</Text>
        <Text style={[Type.caption, { color: theme.textMuted }]}>{detalle}</Text>
      </View>
      <Text style={[styles.monto, { color: conSigno && positivo ? theme.online : theme.text }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  flex: { flex: 1, gap: 2 },
  titulo: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 19 },
  monto: { fontFamily: FontFamily.bold, fontSize: 15, textAlign: 'right' },
});
