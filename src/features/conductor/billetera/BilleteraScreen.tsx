import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { AppHeader, Price } from '@shared/components/ui';
import { fechaCorta, nombreMes } from '@shared/utils/fecha';
import { formatSoles } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';
import { mockBilletera } from '../data/mockIngresos';
import { MovRow } from '../ingresos/components/MovRow';
import { viajesConGanancia } from '../ingresos/resumen';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Billetera'>;

interface Movimiento {
  id: string;
  titulo: string;
  detalle: string;
  monto: number;
  fechaMs: number;
}

const noDisponible = (accion: string) =>
  Alert.alert(accion, 'Todavía no está disponible desde la app.');

export function BilleteraScreen(_: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const historial = useConductorStore((s) => s.historial);

  // Cada movimiento dice de que viaje viene
  const movimientos = useMemo<Movimiento[]>(() => {
    const ahora = Date.now();
    const deViajes = viajesConGanancia(historial, mockConductor.comision).map((v) =>
      v.efectivo
        ? { id: v.id, titulo: `Comisión · ${v.ruta}`, detalle: `${fechaCorta(v.fechaMs)} · viaje en efectivo`, monto: -v.comision, fechaMs: v.fechaMs }
        : { id: v.id, titulo: `Pago digital · ${v.ruta}`, detalle: fechaCorta(v.fechaMs), monto: v.ganancia, fechaMs: v.fechaMs },
    );
    const otros = mockBilletera.otros.map((o) => ({
      id: o.id,
      titulo: o.concepto,
      detalle: [fechaCorta(ahora - o.haceMs), o.detalle].filter(Boolean).join(' · '),
      monto: o.monto,
      fechaMs: ahora - o.haceMs,
    }));
    return [...deViajes, ...otros].sort((a, b) => b.fechaMs - a.fechaMs);
  }, [historial]);

  const saldo = mockBilletera.saldo;
  // Bloque de saldo invertido: tinta de dia, claro de noche (como el logo)
  const bg = theme.text;
  const fg = theme.surface;

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Billetera" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View style={[styles.bal, { backgroundColor: bg }]}>
          <View accessible accessibilityLabel={`Saldo disponible ${formatSoles(saldo)}`}>
            <Text style={[styles.k, { color: fg }]}>Saldo disponible</Text>
            <Price monto={saldo} color={fg} />
          </View>
          <Text style={[styles.note, { color: fg }]}>
            Las comisiones de tus viajes en efectivo se descuentan de este saldo.
          </Text>
          <View style={styles.two}>
            <Pressable
              accessibilityRole="button"
              onPress={() => noDisponible('Recargar')}
              style={[styles.b, { backgroundColor: theme.signal }]}
            >
              <Text style={[Type.bodyStrong, { color: theme.onSignal }]}>Recargar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => noDisponible('Retirar')}
              style={[styles.b, styles.bOutline, { borderColor: fg }]}
            >
              <Text style={[Type.bodyStrong, { color: fg }]}>Retirar</Text>
            </Pressable>
          </View>
        </View>

        <View>
          <View style={styles.secH}>
            <Text accessibilityRole="header" style={[styles.secT, { color: theme.textMuted }]}>Movimientos</Text>
            <Text style={[styles.secT, { color: theme.textMuted }]}>{nombreMes()}</Text>
          </View>
          {movimientos.length > 0 ? (
            movimientos.map((m) => (
              <MovRow key={m.id} titulo={m.titulo} detalle={m.detalle} monto={m.monto} conSigno />
            ))
          ) : (
            <Text style={[Type.body, styles.empty, { color: theme.textMuted }]}>
              Sin movimientos todavía. Aquí verás tus pagos digitales, comisiones, recargas y retiros.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  bal: { gap: 6, paddingVertical: 18, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.xl },
  k: { ...Type.small, opacity: 0.75 },
  note: { ...Type.detail, opacity: 0.75 },
  two: { flexDirection: 'row', gap: Spacing.sm + 2, marginTop: Spacing.sm },
  b: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bOutline: { borderWidth: 1.5, opacity: 0.9 },
  secH: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.xs },
  secT: { ...Type.section },
  empty: { paddingVertical: Spacing.lg },
});
