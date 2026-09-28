import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { ViajeCompletado } from '@features/conductor/types';
import { useConductorStore } from '@store/useConductorStore';
import { AppButton, AppHeader } from '@shared/components/ui';
import { formatSoles, pluralViajes } from '@shared/utils/format';
import { hora } from '@shared/utils/fecha';
import { useAppTheme } from '@theme/useAppTheme';
import { Type } from '@theme/fonts';
import { Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';
import { agruparPorDia } from './agrupar';
import { TarjetaHistorial } from './components/TarjetaHistorial';
import { AccionesViajeSheet, type AccionViaje } from './components/AccionesViajeSheet';

type Props = NativeStackScreenProps<ConductorStackParamList, 'HistorialViaje'>;

const pluralCancelados = (n: number) => (n === 1 ? '1 cancelado' : `${n} cancelados`);

export function HistorialViajeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const historial = useConductorStore((s) => s.historial);
  const cancelaciones = useConductorStore((s) => s.cancelaciones);
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);
  const estadoViaje = useConductorStore((s) => s.estadoViaje);
  const [menuDe, setMenuDe] = useState<ViajeCompletado | null>(null);

  const secciones = useMemo(
    () => agruparPorDia(historial, mockConductor.comision, Date.now(), cancelaciones),
    [historial, cancelaciones],
  );

  const abrir = (v: ViajeCompletado) => navigation.navigate('HistorialDetalle', { viajeId: v.id });
  const calificar = (v: ViajeCompletado) => {
    // Calificar lee el viaje del historial; no se toca un viaje en curso
    if (!estadoViaje) setSolicitudActual(null);
    navigation.navigate('Calificar', { solicitudId: v.id });
  };

  const acciones: AccionViaje[] = menuDe
    ? [
        { etiqueta: 'Ver detalle', icono: 'receipt-outline', onPress: () => abrir(menuDe) },
        menuDe.calificacion === 0
          ? { etiqueta: `Calificar a ${menuDe.solicitud.pasajero.nombre}`, icono: 'star-outline', onPress: () => calificar(menuDe) }
          : { etiqueta: 'Cambiar calificación', icono: 'star-half-outline', onPress: () => calificar(menuDe) },
      ]
    : [];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Historial" />
      <SectionList
        sections={secciones}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}
        renderSectionHeader={({ section }) => {
          const conteo = [pluralViajes(section.viajes), section.cancelados > 0 && pluralCancelados(section.cancelados)]
            .filter(Boolean)
            .join(' · ');
          return (
            <View
              style={styles.secH}
              accessibilityRole="header"
              accessible
              accessibilityLabel={`${section.titulo}, ${conteo}, ${formatSoles(section.ganado)} ganados`}
            >
              <Text style={[styles.secT, styles.flex, { color: theme.textMuted }]}>
                <Text style={[Type.sectionTitle, { color: theme.text }]}>{section.titulo}</Text> · {conteo}
              </Text>
              <Text style={[styles.secT, { color: theme.textMuted }]}>{formatSoles(section.ganado)} ganados</Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <TarjetaHistorial
            entrada={item}
            comision={mockConductor.comision}
            onAbrir={() => item.tipo === 'completado' && abrir(item.viaje)}
            onMenu={() => item.tipo === 'completado' && setMenuDe(item.viaje)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[Type.heading, { color: theme.text }]}>Todavía no tienes viajes</Text>
            <Text style={[Type.detail, { color: theme.textMuted }]}>
              Aquí verás cada viaje que termines o canceles, agrupado por día.
            </Text>
            <AppButton label="Ir al inicio" variant="ghost" size="md" onPress={() => navigation.goBack()} />
          </View>
        }
      />
      <AccionesViajeSheet
        visible={menuDe !== null}
        titulo={menuDe ? `${hora(menuDe.fechaMs)} · ${menuDe.solicitud.pasajero.nombre} ${menuDe.solicitud.pasajero.apellido}` : ''}
        acciones={acciones}
        onCerrar={() => setMenuDe(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: Spacing.lg },
  secH: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  secT: { ...Type.section },
  gap: { height: Spacing.md },
  empty: { gap: Spacing.sm, paddingTop: Spacing.xl },
});
