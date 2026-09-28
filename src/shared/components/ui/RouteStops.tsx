import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';

interface Stop {
  direccion: string;
  detalle?: string;
}

type Tipo = 'origen' | 'parada' | 'destino';

const ETIQUETA: Record<Tipo, string> = { origen: 'Recogida', parada: 'Parada extra', destino: 'Destino' };

interface Props {
  origen: Stop;
  destino: Stop;
  /** Paradas intermedias, en orden. */
  intermedias?: Stop[];
  /** Muestra "Recogida / Parada extra / Destino" sobre cada direccion. */
  conEtiquetas?: boolean;
}

/** Recojo (circulo), paradas (punto) y destino (cuadrado) unidos por un riel. */
export function RouteStops({ origen, destino, intermedias = [], conEtiquetas = false }: Props) {
  const theme = useAppTheme();
  const paradas: { stop: Stop; tipo: Tipo }[] = [
    { stop: origen, tipo: 'origen' },
    ...intermedias.map((stop) => ({ stop, tipo: 'parada' as const })),
    { stop: destino, tipo: 'destino' },
  ];

  const marca = (tipo: Tipo) => {
    if (tipo === 'origen') return [styles.mark, { borderColor: theme.text }];
    if (tipo === 'parada') return [styles.mark, styles.dot, { backgroundColor: theme.pickup, borderColor: theme.pickup }];
    return [styles.mark, { borderColor: theme.text, backgroundColor: theme.text, borderRadius: 2 }];
  };

  return (
    <View>
      {paradas.map(({ stop, tipo }, i) => {
        const ultima = i === paradas.length - 1;
        return (
          <View
            key={`${tipo}-${i}`}
            style={styles.stop}
            accessible
            accessibilityLabel={`${tipo === 'origen' ? 'Recojo' : ETIQUETA[tipo]}: ${stop.direccion}${stop.detalle ? `. ${stop.detalle}` : ''}`}
          >
            <View style={styles.rail}>
              <View style={[marca(tipo), conEtiquetas && styles.markLabel]} />
              {/* La linea sale pegada a la marca y entra en la fila siguiente hasta tocar la otra */}
              {!ultima && <View style={[styles.line, { backgroundColor: theme.divider }]} />}
            </View>
            <View style={[styles.text, !ultima && styles.textGap]}>
              {conEtiquetas && (
                <Text style={[Type.tag, { color: tipo === 'parada' ? theme.pickup : theme.textMuted }]}>
                  {ETIQUETA[tipo]}
                </Text>
              )}
              <Text style={[Type.address, styles.addr, { color: theme.text }]}>{stop.direccion}</Text>
              {stop.detalle ? (
                <Text style={[Type.detail, { color: theme.textMuted }]}>{stop.detalle}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
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
  dot: { width: 9, height: 9, borderWidth: 0, marginTop: MARK_TOP + 1 },
  // Con etiqueta la marca se alinea con la etiqueta (linea de 16)
  markLabel: { marginTop: 3 },
  line: { width: 2, flex: 1, minHeight: 18, marginBottom: -MARK_TOP },
  text: { flex: 1, gap: 1 },
  textGap: { paddingBottom: Spacing.sm + 2 },
  addr: { fontWeight: Type.label.fontWeight },
});
