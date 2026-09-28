import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Solicitud } from '@features/conductor/types';
import { fetchRoute } from '@features/conductor/viaje/services/directionsService';
import type { LatLng } from '@features/conductor/viaje/services/directionsService';
import { AvatarPasajero, CountdownRing, Price, RouteStops, SlideToConfirm, Tag } from '@shared/components/ui';
import { DestinationMarker, PickupMarker } from '@shared/components/map/RouteMarkers';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { distanciaRutaKm } from '@shared/utils/geo';
import { esEfectivo } from '@shared/utils/cobro';
import { useAppTheme } from '@theme/useAppTheme';
import { useMapStyle } from '@shared/components/map/mapStyle';
import { FontFamily, Type } from '@theme/fonts';
import { BorderRadius, Spacing } from '@theme/spacing';
import { Duration, Spring } from '@theme/motion';

interface Props {
  solicitud: Solicitud;
  onAceptar: () => void;
  onRechazar: () => void;
}

export function IncomingRequestOverlay({ solicitud, onAceptar, onRechazar }: Props) {
  const insets = useSafeAreaInsets();
  const theme  = useAppTheme();
  const mapStyle = useMapStyle();
  const mapRef = useRef<MapView>(null);

  const limite = solicitud.tiempoLimiteSeg;
  const [segundos,    setSegundos]    = useState(limite);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [cardH,       setCardH]       = useState(0);

  const origen   = solicitud.paradas.find((p) => p.esOrigen);
  const destino  = solicitud.paradas.find((p) => !p.esOrigen);
  const pasajero = solicitud.pasajero;

  useEffect(() => {
    // Llega un viaje: aviso fisico para no tener que estar mirando
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);

    let cancelado = false;
    if (origen && destino) {
      fetchRoute(origen.coordenadas, destino.coordenadas).then((coords) => {
        if (!cancelado) setRouteCoords(coords);
      });
    }

    return () => {
      cancelado = true;
      clearInterval(interval);
    };
  }, []);

  // Encuadrar la ruta en la parte visible, encima de la tarjeta
  useEffect(() => {
    const puntos = routeCoords.length > 1
      ? routeCoords
      : [origen?.coordenadas, destino?.coordenadas].filter((c): c is LatLng => !!c);
    if (puntos.length < 2 || cardH === 0) return;
    mapRef.current?.fitToCoordinates(puntos, {
      edgePadding: { top: insets.top + 48, right: 48, bottom: cardH + 32, left: 48 },
      animated: true,
    });
  }, [routeCoords, cardH]);

  // Al llegar a 0 la solicitud se pierde: se avisa y se cierra
  useEffect(() => {
    if (segundos !== 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onRechazar();
  }, [segundos]);

  const kmViaje = routeCoords.length > 1 ? distanciaRutaKm(routeCoords) : undefined;
  const detalleDestino = [
    kmViaje !== undefined ? `${kmViaje.toFixed(1)} km` : undefined,
    destino?.duracionMin ? `${destino.duracionMin} min de viaje` : undefined,
  ].filter(Boolean).join(' · ');

  const recojo = [
    origen?.duracionMin ? `Recojo a ${origen.duracionMin} min` : undefined,
    origen?.distanciaKm ? `${origen.distanciaKm} km` : undefined,
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={
          origen
            ? { ...origen.coordenadas, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : undefined
        }
        scrollEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomEnabled={false}
        toolbarEnabled={false}
        showsUserLocation
        importantForAccessibility="no-hide-descendants"
      >
        {origen && <PickupMarker coordinate={origen.coordenadas} />}
        {destino && <DestinationMarker coordinate={destino.coordenadas} />}
        <RoutePolyline coordinates={routeCoords} />
      </MapView>

      {/* El mapa se atenua para que la tarjeta sea lo unico importante */}
      <Animated.View
        entering={FadeIn.duration(Duration.base)}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.scrim }]}
        pointerEvents="none"
      />

      <Animated.View
        entering={SlideInDown.springify()
          .damping(Spring.sheet.damping)
          .stiffness(Spring.sheet.stiffness)
          .mass(Spring.sheet.mass)}
        onLayout={(e) => setCardH(e.nativeEvent.layout.height)}
        accessibilityViewIsModal
        style={[
          styles.card,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.xl + 2 },
        ]}
      >
        <View style={styles.top}>
          <CountdownRing segundos={segundos} total={limite} />
          <View style={styles.tags}>
            <Tag label="RunX" />
            <Tag
              label={solicitud.metodoPago}
              tone={esEfectivo(solicitud.metodoPago) ? 'cash' : 'digital'}
            />
          </View>
        </View>

        <View style={styles.figures}>
          <Price
            monto={solicitud.precio}
            simbolo={solicitud.simboloMoneda}
            color={theme.text}
            accessibilityLabel={`Tarifa ${solicitud.simboloMoneda} ${solicitud.precio.toFixed(2)}`}
          />
          {(recojo[0] || recojo[1]) && (
            <Text style={[styles.eta, { color: theme.text }]}>
              {recojo[0]}
              {recojo[1] ? (
                <Text style={[styles.etaMuted, { color: theme.textMuted }]}>
                  {recojo[0] ? ' · ' : ''}{recojo[1]}
                </Text>
              ) : null}
            </Text>
          )}
        </View>

        {origen && destino && (
          <RouteStops
            origen={{ direccion: origen.direccion, detalle: origen.notas }}
            destino={{ direccion: destino.direccion, detalle: detalleDestino || undefined }}
          />
        )}

        <View style={styles.pax}>
          <AvatarPasajero nombre={pasajero.nombre} apellido={pasajero.apellido} size={40} />
          <View>
            <Text style={[Type.name, { color: theme.text }]}>
              {pasajero.nombre} {pasajero.apellido.charAt(0)}.
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={theme.textMuted} />
              <Text style={[Type.detail, { color: theme.textMuted }]}>
                {pasajero.calificacion.toFixed(1)} · {pasajero.totalViajes} viajes
              </Text>
            </View>
          </View>
        </View>

        {/* Rechazar queda separado y es un toque; aceptar exige deslizar */}
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Rechazar viaje"
            onPress={onRechazar}
            activeOpacity={0.7}
            style={[styles.reject, { borderColor: theme.divider }]}
          >
            <Text style={[Type.bodyStrong, { color: theme.textMuted }]}>Rechazar</Text>
          </TouchableOpacity>
          <SlideToConfirm
            label="Desliza para aceptar"
            accessibilityLabel={`Aceptar viaje por ${solicitud.simboloMoneda} ${solicitud.precio.toFixed(2)}`}
            onConfirm={onAceptar}
            style={styles.flex}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 18,
    gap: 14,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: { flexDirection: 'row', gap: 6 },
  figures: { gap: 6 },
  eta: { ...Type.bodyStrong },
  etaMuted: { fontFamily: FontFamily.medium },
  pax: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  reject: {
    height: 60,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
