import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { AppButton, AppHeader, RouteStops, Tag } from '@shared/components/ui';
import { esEfectivo } from '@shared/utils/cobro';
import { hora, tituloDia } from '@shared/utils/fecha';
import { formatSoles, inicioDelDia } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { mockServicios, type EstadoServicio, type ServicioProgramado } from '../data/mockServicios';

type Props = NativeStackScreenProps<ConductorStackParamList, 'ServiciosProgramados'>;

const ESTADO: Record<EstadoServicio, { label: string; tone: 'success' | 'signal' | 'neutral' }> = {
  aceptado:   { label: 'Confirmado', tone: 'success' },
  pendiente:  { label: 'Por confirmar', tone: 'signal' },
  completado: { label: 'Completado', tone: 'neutral' },
};

/** "Mañana" en lugar de un nombre de dia para lo que viene. */
function tituloProximo(ms: number, ahora: number): string {
  const dias = Math.round((inicioDelDia(ms) - inicioDelDia(ahora)) / 86_400_000);
  if (dias === 1) return 'Mañana';
  return tituloDia(ms, ahora);
}

function ServicioCard({ item, ms }: { item: ServicioProgramado; ms: number }) {
  const theme = useAppTheme();
  const estado = ESTADO[item.estado];
  return (
    <View
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}
      accessible
      accessibilityLabel={`${hora(ms)}, ${estado.label}. Desde ${item.origen} hasta ${item.destino}. ${formatSoles(item.precio)}, ${item.metodoPago}`}
    >
      <View style={styles.top}>
        <Text style={[Type.figure, { color: theme.text }]}>{hora(ms)}</Text>
        <Tag label={estado.label} tone={estado.tone} />
      </View>
      <RouteStops origen={{ direccion: item.origen }} destino={{ direccion: item.destino }} />
      <View style={styles.bottom}>
        <Text style={[styles.precio, { color: theme.text }]}>{formatSoles(item.precio)}</Text>
        <Tag label={item.metodoPago} tone={esEfectivo(item.metodoPago) ? 'cash' : 'digital'} />
      </View>
    </View>
  );
}

export function ServiciosProgramadosScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const secciones = useMemo(() => {
    const ahora = Date.now();
    const hoy = inicioDelDia(ahora);
    const conFecha = mockServicios.map((s) => ({ ...s, ms: hoy + s.enMin * 60_000 }));
    const proximos = conFecha.filter((s) => s.estado !== 'completado').sort((a, b) => a.ms - b.ms);
    const pasados = conFecha.filter((s) => s.estado === 'completado').sort((a, b) => b.ms - a.ms);
    // Proximos agrupados por dia; los completados al final en su propio grupo
    const grupos = new Map<string, typeof conFecha>();
    for (const s of proximos) {
      const k = tituloProximo(s.ms, ahora);
      grupos.set(k, [...(grupos.get(k) ?? []), s]);
    }
    const out = [...grupos.entries()].map(([titulo, data]) => ({ titulo, data }));
    if (pasados.length) out.push({ titulo: 'Completados', data: pasados });
    return out;
  }, []);

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Servicios programados" onBack={() => navigation.goBack()} />
      <SectionList
        sections={secciones}
        keyExtractor={(s) => s.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={[styles.secT, { color: theme.textMuted }]}>{section.titulo}</Text>
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        renderItem={({ item }) => <ServicioCard item={item} ms={item.ms} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Type.heading, { color: theme.text }]}>No tienes servicios programados</Text>
            <Text style={[Type.detail, { color: theme.textMuted }]}>
              Cuando un pasajero reserve un viaje contigo, aparecerá aquí con su fecha y hora.
            </Text>
            <AppButton label="Volver" variant="ghost" size="md" onPress={() => navigation.goBack()} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 18 },
  secT: { fontFamily: FontFamily.semibold, fontSize: 13, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 14, gap: Spacing.sm + 2 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  precio: { fontFamily: FontFamily.bold, fontSize: 16 },
  empty: { gap: Spacing.sm, paddingTop: Spacing.xl },
});
