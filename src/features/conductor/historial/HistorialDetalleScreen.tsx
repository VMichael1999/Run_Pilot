import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { fetchRoute, type LatLng } from '@features/conductor/viaje/services/directionsService';
import { AppButton, AppHeader, AvatarPasajero, RouteStops } from '@shared/components/ui';
import { DestinationMarker, PickupMarker } from '@shared/components/map/RouteMarkers';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { desgloseCobro, esEfectivo } from '@shared/utils/cobro';
import { fechaCorta } from '@shared/utils/fecha';
import { formatSoles } from '@shared/utils/format';
import { distanciaRutaKm } from '@shared/utils/geo';
import { useAppTheme } from '@theme/useAppTheme';
import { useMapStyle } from '@shared/components/map/mapStyle';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { mockConductor } from '../data/mockConductor';

type Props = NativeStackScreenProps<ConductorStackParamList, 'HistorialDetalle'>;

/** Referencia para soporte, estable por viaje. */
function referencia(id: string): string {
  const num = (id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900_000) + 100_000;
  return `TRP-${num}`;
}

/**
 * Detalle de un viaje terminado. No tiene maqueta en el HTML: reutiliza el
 * riel de paradas del viaje y el desglose del cobro.
 */
export function HistorialDetalleScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const mapStyle = useMapStyle();
  const { viajeId } = route.params;
  const viaje = useConductorStore((s) => s.historial.find((v) => v.id === viajeId));
  const mapRef = useRef<MapView>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  const origen  = viaje?.solicitud.paradas.find((p) => p.esOrigen);
  const destino = viaje?.solicitud.paradas.find((p) => !p.esOrigen);

  useEffect(() => {
    if (!origen || !destino) return;
    let cancelado = false;
    fetchRoute(origen.coordenadas, destino.coordenadas).then((c) => { if (!cancelado) setRouteCoords(c); });
    return () => { cancelado = true; };
  }, [viajeId]);

  const encuadrar = () => {
    const puntos = routeCoords.length > 1
      ? routeCoords
      : [origen?.coordenadas, destino?.coordenadas].filter((c): c is LatLng => !!c);
    if (puntos.length > 1) {
      mapRef.current?.fitToCoordinates(puntos, {
        edgePadding: { top: 28, right: 28, bottom: 28, left: 28 },
        animated: false,
      });
    }
  };
  useEffect(encuadrar, [routeCoords]);

  if (!viaje || !origen || !destino) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <AppHeader title="Detalle del viaje" />
        <View style={styles.missing}>
          <Text style={[Type.heading, { color: theme.text }]}>No encontramos este viaje</Text>
          <Text style={[Type.detail, { color: theme.textMuted }]}>Puede que ya no esté en tu historial.</Text>
          <AppButton label="Volver al historial" variant="ghost" size="md" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const { solicitud, fechaMs, calificacion } = viaje;
  const { pasajero, precio, metodoPago } = solicitud;
  const { tarifa, comision, ganancia } = desgloseCobro(precio, mockConductor.comision);
  const km = routeCoords.length > 1 ? distanciaRutaKm(routeCoords) : undefined;
  const resumen = [
    fechaCorta(fechaMs),
    destino.duracionMin ? `${destino.duracionMin} min` : undefined,
    km ? `${km.toFixed(1)} km` : undefined,
  ].filter(Boolean).join(' · ');

  const filas: [string, string, boolean?][] = [
    ['Tarifa del viaje', formatSoles(tarifa)],
    ['Método de pago', metodoPago],
    [`Comisión Run Pilot (${Math.round(mockConductor.comision * 100)} %)`, formatSoles(-comision)],
    ['Tu ganancia', formatSoles(ganancia), true],
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <AppHeader title="Detalle del viaje" />
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <Text style={[Type.detail, { color: theme.textMuted }]}>{resumen}</Text>

        <View style={[styles.map, { borderColor: theme.divider }]} importantForAccessibility="no-hide-descendants">
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
            initialRegion={{ ...origen.coordenadas, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
            onMapReady={encuadrar}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            <RoutePolyline coordinates={routeCoords} />
            <PickupMarker coordinate={origen.coordenadas} />
            <DestinationMarker coordinate={destino.coordenadas} />
          </MapView>
        </View>

        <RouteStops
          origen={{ direccion: origen.direccion, detalle: origen.notas }}
          destino={{ direccion: destino.direccion }}
        />

        <View style={[styles.pax, { borderColor: theme.divider }]}>
          <AvatarPasajero nombre={pasajero.nombre} apellido={pasajero.apellido} size={40} />
          <View style={styles.flex}>
            <Text style={[Type.label, { color: theme.text }]}>{pasajero.nombre} {pasajero.apellido}</Text>
            <Text style={[Type.caption, { color: theme.textMuted }]}>
              {pasajero.calificacion.toFixed(1)} · {pasajero.totalViajes} viajes
            </Text>
          </View>
          {calificacion > 0 ? (
            <View style={[styles.mini, { backgroundColor: theme.background }]}>
              <Ionicons name="star" size={11} color={theme.textMuted} />
              <Text style={[Type.tag, { color: theme.textMuted }]}>Le diste {calificacion}</Text>
            </View>
          ) : (
            <AppButton
              label="Calificar"
              variant="signal"
              size="md"
              accessibilityLabel={`Calificar a ${pasajero.nombre}`}
              onPress={() => navigation.navigate('Calificar', { solicitudId: viaje.id })}
            />
          )}
        </View>

        <View style={[styles.rows, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          {filas.map(([k, v, total], i) => (
            <View key={k} style={[styles.row, i > 0 && [styles.rowSep, { borderTopColor: theme.divider }]]}>
              <Text style={[total ? styles.rowStrong : styles.rowText, { color: theme.text }]}>{k}</Text>
              <Text style={[styles.rowStrong, total && styles.total, { color: total ? theme.online : theme.text }]}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={[Type.caption, { color: theme.textMuted }]}>
          {esEfectivo(metodoPago)
            ? 'Cobrado en efectivo. La comisión se descontó de tu billetera.'
            : 'Pago digital. La ganancia se abonó a tu billetera.'}{' '}
          Referencia {referencia(viaje.id)}.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 18, paddingTop: Spacing.xs, gap: Spacing.lg },
  map: { height: 180, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1 },
  pax: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  rows: { borderRadius: BorderRadius.lg, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, paddingVertical: Spacing.md, paddingHorizontal: 14 },
  rowSep: { borderTopWidth: 1 },
  rowText: { flex: 1, ...Type.row },
  rowStrong: { ...Type.label },
  total: { fontSize: Type.heading.fontSize, lineHeight: Type.heading.lineHeight },
  missing: { paddingHorizontal: 18, gap: Spacing.sm, paddingTop: Spacing.xl },
});
