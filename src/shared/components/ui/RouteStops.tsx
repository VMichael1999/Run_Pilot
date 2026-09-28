import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface Stop {
  direccion: string;
  detalle?: string;
}

/** Recojo (circulo) y destino (cuadrado) unidos por un riel. */
export function RouteStops({ origen, destino }: { origen: Stop; destino: Stop }) {
  const theme = useAppTheme();
  const row = (stop: Stop, esOrigen: boolean) => (
    <View
      style={styles.stop}
      accessible
      accessibilityLabel={`${esOrigen ? 'Recojo' : 'Destino'}: ${stop.direccion}${stop.detalle ? `. ${stop.detalle}` : ''}`}
    >
      <View style={styles.rail}>
        <View
          style={[
            styles.mark,
            esOrigen
              ? { borderColor: theme.text }
              : { borderColor: theme.text, backgroundColor: theme.text, borderRadius: 2 },
          ]}
        />
        {/* La linea sale pegada al circulo y entra en la fila siguiente hasta tocar el cuadrado */}
        {esOrigen && <View style={[styles.line, { backgroundColor: theme.divider }]} />}
      </View>
      <View style={[styles.text, esOrigen && styles.textGap]}>
        <Text style={[Type.address, styles.addr, { color: theme.text }]}>{stop.direccion}</Text>
        {stop.detalle ? (
          <Text style={[Type.detail, { color: theme.textMuted }]}>{stop.detalle}</Text>
        ) : null}
      </View>
    </View>
  );
  return (
    <View>
      {row(origen, true)}
      {row(destino, false)}
    </View>
  );
}

/** Separacion del marcador respecto al borde superior de su fila (centra con la primera linea). */
const MARK_TOP = 4;

const styles = StyleSheet.create({
  stop: { flexDirection: 'row', gap: Spacing.md },
  rail: { width: 16, alignItems: 'center' },
  mark: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 3,
    marginTop: MARK_TOP,
  },
  line: { width: 2, flex: 1, minHeight: 18, marginBottom: -MARK_TOP },
  text: { flex: 1, gap: 1 },
  textGap: { paddingBottom: Spacing.sm + 2 },
  addr: { fontWeight: Type.label.fontWeight },
});
