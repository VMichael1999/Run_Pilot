import React, { useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { ViajeCompletado } from '@features/conductor/types';
import { useConductorStore } from '@store/useConductorStore';
import { AppButton, AppHeader } from '@shared/components/ui';
import { distritoDe, esEfectivo } from '@shared/utils/cobro';
import { hora } from '@shared/utils/fecha';
import { formatSoles, pluralViajes } from '@shared/utils/format';
import { useAppTheme } from '@theme/useAppTheme';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Hit, Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';
import { agruparPorDia } from './agrupar';

type Props = NativeStackScreenProps<ConductorStackParamList, 'HistorialViaje'>;

function ViajeFila({
  viaje,
  onAbrir,
  onCalificar,
}: {
  viaje: ViajeCompletado;
  onAbrir: () => void;
  onCalificar: () => void;
}) {
  const theme = useAppTheme();
  const { solicitud, fechaMs, calificacion } = viaje;
  const { pasajero, paradas, precio, metodoPago } = solicitud;
  const o = paradas.find((p) => p.esOrigen);
  const d = paradas.find((p) => !p.esOrigen);
  const ruta = o && d ? `${distritoDe(o.direccion)} → ${distritoDe(d.direccion)}` : 'Viaje';
  const pago = esEfectivo(metodoPago) ? 'efectivo' : 'digital';
  const pendiente = calificacion === 0;

  return (
    <View style={[styles.hv, { borderBottomColor: theme.divider }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${hora(fechaMs)}, ${ruta}, ${pasajero.nombre}, ${pago}, ${formatSoles(precio)}. ${
          pendiente ? 'Sin calificar' : `Le diste ${calificacion}`
        }. Ver detalle`}
        onPress={onAbrir}
        style={({ pressed }) => [styles.hvMain, pressed && { opacity: 0.6 }]}
      >
        <Text style={[styles.t, { color: theme.text }]}>{hora(fechaMs)}</Text>
        <View style={styles.flex}>
          <Text style={[styles.ruta, { color: theme.text }]}>{ruta}</Text>
          <Text style={[Type.caption, { color: theme.textMuted }]}>
            {pasajero.nombre} {pasajero.apellido.charAt(0)}. · {pago}
          </Text>
        </View>
        <Text style={[styles.m, { color: theme.text }]}>{formatSoles(precio)}</Text>
      </Pressable>

      <View style={styles.row2}>
        {pendiente ? (
          <View style={[styles.mini, { backgroundColor: theme.signal }]}>
            <Text style={[Type.tag, { color: theme.onSignal }]}>Sin calificar</Text>
          </View>
        ) : (
          <View style={[styles.mini, styles.miniRow, { backgroundColor: theme.background }]}>
            <Ionicons name="star" size={11} color={theme.textMuted} />
            <Text style={[Type.tag, { color: theme.textMuted }]}>Le diste {calificacion}</Text>
          </View>
        )}
        {pendiente && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Calificar a ${pasajero.nombre}`}
            onPress={onCalificar}
            style={styles.calificar}
          >
            <Text style={[styles.link, { color: theme.text }]}>Calificar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function HistorialViajeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const historial = useConductorStore((s) => s.historial);
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const estadoViaje = useConductorStore((s) => s.estadoViaje);

  const secciones = useMemo(() => agruparPorDia(historial, mockConductor.comision), [historial]);

  const calificar = (v: ViajeCompletado) => {
    // Calificar lee el viaje del historial; no se toca un viaje en curso
    if (!estadoViaje) setSolicitudActual(null);
    navigation.navigate('Calificar', { solicitudId: v.id });
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Historial" />
      <SectionList
        sections={secciones}
        keyExtractor={(v) => v.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        renderSectionHeader={({ section }) => (
          <View
            style={styles.secH}
            accessibilityRole="header"
            accessible
            accessibilityLabel={`${section.titulo}, ${pluralViajes(section.viajes)}, ${formatSoles(section.ganado)} ganados`}
          >
            <Text style={[styles.secT, { color: theme.textMuted }]}>
              {section.titulo} · {pluralViajes(section.viajes)}
            </Text>
            <Text style={[styles.secT, { color: theme.textMuted }]}>{formatSoles(section.ganado)} ganados</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ViajeFila
            viaje={item}
            onAbrir={() => navigation.navigate('HistorialDetalle', { viajeId: item.id })}
            onCalificar={() => calificar(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Type.heading, { color: theme.text }]}>Todavía no tienes viajes</Text>
            <Text style={[Type.detail, { color: theme.textMuted }]}>
              Aquí verás cada viaje que termines, agrupado por día.
            </Text>
            <AppButton label="Ir al inicio" variant="ghost" size="md" onPress={() => navigation.goBack()} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18 },
  secH: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  secT: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18 },
  hv: { paddingVertical: Spacing.md, borderBottomWidth: 1, gap: Spacing.xs },
  hvMain: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm + 2, minHeight: 40 },
  t: { width: 44, fontFamily: FontFamily.semibold, fontSize: 13.5, lineHeight: 19 },
  ruta: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 19 },
  m: { fontFamily: FontFamily.bold, fontSize: 15, textAlign: 'right' },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 44 + Spacing.sm + 2,
  },
  mini: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: BorderRadius.full },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  calificar: { minHeight: Hit.min, minWidth: Hit.min, justifyContent: 'center', alignItems: 'flex-end' },
  link: { fontFamily: FontFamily.semibold, fontSize: 12.5, textDecorationLine: 'underline' },
  empty: { gap: Spacing.sm, paddingTop: Spacing.xl },
});
