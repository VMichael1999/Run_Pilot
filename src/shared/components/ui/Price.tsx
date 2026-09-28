import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Type } from '@theme/fonts';

interface Props {
  monto: number;
  color: string;
  simbolo?: string;
  size?: 'lg' | 'xl';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Cifra protagonista "S/ 18.50". El simbolo y el monto van en dos textos
 * hermanos alineados por la base: anidarlos con alturas de linea distintas
 * recortaba la parte de arriba de los numeros en iOS.
 */
export function Price({ monto, color, simbolo = 'S/', size = 'lg', accessibilityLabel, style }: Props) {
  const texto = monto.toFixed(2);
  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `${simbolo} ${texto}`}
    >
      <Text style={[Type.currency, { color }]}>{simbolo}</Text>
      <Text style={[size === 'xl' ? Type.priceXL : Type.price, { color }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
});
