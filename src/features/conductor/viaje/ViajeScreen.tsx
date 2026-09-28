import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { EstadoViaje } from '../types';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { PanelPago } from './components/PanelPago';
import { fetchRoute, type LatLng } from './services/directionsService';
import { AppButton, AvatarPasajero, MapButton, SlideToConfirm, SosButton } from '@shared/components/ui';
import { DestinationMarker, DriverMarker, PickupMarker } from '@shared/components/map/RouteMarkers';
import { distanciaRutaKm, formatDistancia, restanteEnRutaKm } from '@shared/utils/geo';
import { useAppTheme, useIsDark } from '@theme/useAppTheme';
import { MapStyle } from '@theme/mapStyle';
import { FontFamily, Type } from '@theme/fonts';
import { Spacing, BorderRadius, Hit, HitSlop, Shadow } from '@theme/spacing';
import { Duration, Timing } from '@theme/motion';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Viaje'>;

/** Lo que ve el conductor. Agrupa los estados del store sin cambiar el flujo. */
type Fase = 'recojo' | 'esperando' | 'viaje';

function faseDe(estado: EstadoViaje): Fase | null {
  if (estado === 'aceptado' || estado === 'en_camino') return 'recojo';
  if (estado === 'esperando') return 'esperando';
  if (estado === 'iniciado') return 'viaje';
  return null;
}

/** La siguiente accion concreta en cada estado (se avanza con un toque). */
const ACCION: Partial<Record<EstadoViaje, string>> = {
  aceptado:  'Ir al punto de recojo',
  en_camino: 'Llegué al punto de recojo',
  esperando: 'Iniciar viaje',
};

const LIMA_REGION = {
  latitude: -12.0464, longitude: -77.0428,
  latitudeDelta: 0.05, longitudeDelta: 0.05,
};

const hora = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const cronometro = (seg: number) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;

export function ViajeScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets = useSafeAreaInsets();
  const theme  = useAppTheme();
  const isDark = useIsDark();
  const mapRef = useRef<MapView>(null);

  const solicitudActual = useConductorStore((s) => s.solicitudActual);
  const estadoViaje     = useConductorStore((s) => s.estadoViaje);
  const avanzarEstado   = useConductorStore((s) => s.avanzarEstado);
  const finalizarViaje  = useConductorStore((s) => s.finalizarViaje);

  const solicitud = solicitudActual ?? mockSolicitudes.find((s) => s.id === solicitudId);
  const origen    = solicitud?.paradas.find((p) => p.esOrigen);
  const destino   = solicitud?.paradas.find((p) => !p.esOrigen);
  const fase      = estadoViaje ? faseDe(estadoViaje) : null;

  const [driverCoord, setDriverCoord] = useState<LatLng | null>(null);
  const [heading,     setHeading]     = useState<number | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [topH,        setTopH]        = useState(0);
  const [panelH,      setPanelH]      = useState(0);
  const driverRef = useRef<LatLng | null>(null);
  driverRef.current = driverCoord;

  // Ubicacion del conductor. Si la pantalla se cierra antes de que el watcher
  // exista, se elimina apenas se crea (antes quedaba activo para siempre).
  useEffect(() => {
    let cancelado = false;
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelado || status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      if (cancelado) return;
      setDriverCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const s = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 8 },
        (loc) => {
          setDriverCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setHeading(loc.coords.heading);
        },
      );
      if (cancelado) s.remove();
      else sub = s;
    })();
    return () => {
      cancelado = true;
      sub?.remove();
    };
  }, []);

  // Ruta de la fase: conductor -> recojo, o recojo -> destino. Se pide una vez por
  // fase, en cuanto hay ubicacion (antes no se pedia si el GPS llegaba tarde).
  const tieneUbicacion = driverCoord !== null;
  useEffect(() => {
    if (!fase || !origen || !destino) return;
    let cancelado = false;
    setRouteCoords([]);
    if (fase === 'recojo') {
      if (!driverRef.current) return;
      fetchRoute(driverRef.current, origen.coordenadas).then((c) => { if (!cancelado) setRouteCoords(c); });
    } else if (fase === 'viaje') {
      fetchRoute(origen.coordenadas, destino.coordenadas).then((c) => { if (!cancelado) setRouteCoords(c); });
    }
    return () => { cancelado = true; };
  }, [fase, fase === 'recojo' && tieneUbicacion]);

  // Camara: el conductor y su objetivo siempre a la vista, entre la tarjeta y el panel
  const objetivo = fase === 'viaje' ? destino?.coordenadas : origen?.coordenadas;
  useEffect(() => {
    if (!objetivo || panelH === 0) return;
    const puntos = [driverCoord, objetivo].filter((p): p is LatLng => !!p);
    if (puntos.length === 1) {
      mapRef.current?.animateToRegion({ ...puntos[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, Duration.slow);
      return;
    }
    mapRef.current?.fitToCoordinates(puntos, {
      edgePadding: { top: topH + 40, right: 60, bottom: panelH + 40, left: 60 },
      animated: true,
    });
  }, [driverCoord, objetivo?.latitude, objetivo?.longitude, panelH, topH]);

  // Tiempo esperando al pasajero
  const [esperandoSeg, setEsperandoSeg] = useState(0);
  useEffect(() => {
    if (fase !== 'esperando') return;
    setEsperandoSeg(0);
    const iv = setInterval(() => setEsperandoSeg((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [fase]);

  // Progreso del viaje sobre la ruta
  const totalKm = useMemo(() => distanciaRutaKm(routeCoords), [routeCoords]);
  const restanteKm = fase === 'viaje' && driverCoord && routeCoords.length > 1
    ? restanteEnRutaKm(routeCoords, driverCoord)
    : totalKm;
  const progreso = totalKm > 0 ? Math.min(1, Math.max(0, 1 - restanteKm / totalKm)) : 0;
  // Lo unico que se mueve durante el viaje
  const progresoSV = useSharedValue(0);
  useEffect(() => {
    progresoSV.value = withTiming(progreso, Timing.slow);
  }, [progreso, progresoSV]);
  const progresoStyle = useAnimatedStyle(() => ({ width: `${progresoSV.value * 100}%` }));

  if (!solicitud || !estadoViaje) return null;

  const pasajero = solicitud.pasajero;
  const nombreCorto = `${pasajero.nombre} ${pasajero.apellido.charAt(0)}.`;

  const handleAvanzar = () => avanzarEstado();
  const handleFinalizar = () => {
    finalizarViaje();
    navigation.replace('Calificar', { solicitudId: solicitud.id });
  };

  if (estadoViaje === 'llegado') {
    return <PanelPago solicitud={solicitud} onFinalizar={handleFinalizar} />;
  }
  if (!fase) return null;

  // Tarjeta superior: a quien o a donde, y cuanto falta
  const recojoKm = fase === 'recojo' && routeCoords.length > 1 ? totalKm : origen?.distanciaKm;
  const minViaje = destino?.duracionMin
    ? Math.max(1, Math.round(destino.duracionMin * (totalKm > 0 ? restanteKm / totalKm : 1)))
    : undefined;

  const tarjeta =
    fase === 'recojo' ? {
      k: `Recoge a ${pasajero.nombre}`,
      direccion: origen?.direccion,
      cifra: origen?.duracionMin ? `${origen.duracionMin} min` : recojoKm ? formatDistancia(recojoKm) : undefined,
      sub: origen?.duracionMin && recojoKm ? formatDistancia(recojoKm) : undefined,
    } : fase === 'esperando' ? {
      k: `Esperando a ${pasajero.nombre}`,
      direccion: origen?.direccion,
      cifra: cronometro(esperandoSeg),
      sub: 'esperando',
    } : {
      k: 'Destino',
      direccion: destino?.direccion,
      cifra: minViaje ? `${minViaje} min` : totalKm > 0 ? formatDistancia(restanteKm) : undefined,
      sub: minViaje ? `llegas ${hora(Date.now() + minViaje * 60_000)}` : undefined,
    };

  const contacto = (esquema: 'tel' | 'sms') => {
    if (pasajero.telefono) void Linking.openURL(`${esquema}:${pasajero.telefono}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isDark ? MapStyle.dark : MapStyle.light}
        initialRegion={
          origen ? { ...origen.coordenadas, latitudeDelta: 0.02, longitudeDelta: 0.02 } : LIMA_REGION
        }
        showsUserLocation={false}
        toolbarEnabled={false}
      >
        {routeCoords.length > 1 && (
          <>
            {/* Borde para que la ruta se lea sobre cualquier calle */}
            <Polyline coordinates={routeCoords} strokeColor={theme.routeCase} strokeWidth={10} lineJoin="round" />
            <Polyline coordinates={routeCoords} strokeColor={theme.route} strokeWidth={5} lineJoin="round" />
          </>
        )}
        {fase !== 'viaje' && origen && <PickupMarker coordinate={origen.coordenadas} active />}
        {fase === 'viaje' && destino && <DestinationMarker coordinate={destino.coordenadas} />}
        {driverCoord && <DriverMarker coordinate={driverCoord} heading={heading} />}
      </MapView>

      {/* Arriba: volver y SOS; debajo, a quien o a donde */}
      <View
        style={[styles.top, { paddingTop: insets.top + Spacing.sm }]}
        onLayout={(e) => setTopH(e.nativeEvent.layout.height)}
        pointerEvents="box-none"
      >
        <View style={styles.topBar} pointerEvents="box-none">
          <MapButton icon="arrow-back" accessibilityLabel="Volver al inicio" onPress={() => navigation.goBack()} />
          <SosButton />
        </View>

        <Animated.View
          key={`card-${fase}`}
          entering={FadeInDown.duration(Duration.base)}
          style={[styles.dest, { backgroundColor: theme.surface }]}
          accessible
          accessibilityLabel={[tarjeta.k, tarjeta.direccion, tarjeta.cifra, tarjeta.sub].filter(Boolean).join(', ')}
        >
          <View style={styles.flex}>
            <Text style={[styles.destK, { color: theme.textMuted }]}>{tarjeta.k}</Text>
            <Text style={[Type.heading, { color: theme.text }]} numberOfLines={2}>{tarjeta.direccion}</Text>
          </View>
          {tarjeta.cifra ? (
            <View style={styles.destT}>
              {/* Ancho minimo: las cifras de General Sans no son tabulares */}
              <Text style={[Type.figure, styles.destFig, { color: theme.text }]}>{tarjeta.cifra}</Text>
              {tarjeta.sub ? <Text style={[Type.caption, { color: theme.textMuted }]}>{tarjeta.sub}</Text> : null}
            </View>
          ) : null}
        </Animated.View>
      </View>

      {/* Panel inferior: un estado, una accion */}
      <View
        style={[styles.panel, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.xl + 2 }]}
        onLayout={(e) => setPanelH(e.nativeEvent.layout.height)}
      >
        <Animated.View key={`panel-${fase}`} entering={FadeInDown.duration(Duration.base)} style={styles.panelBody}>
          {fase === 'viaje' ? (
            <>
              <View style={styles.hRow}>
                <Text style={[Type.bodyStrong, { color: theme.text }]}>{nombreCorto} a bordo</Text>
                {totalKm > 0 && (
                  <Text style={[Type.detail, { color: theme.textMuted }]}>
                    {(totalKm - restanteKm).toFixed(1)} de {totalKm.toFixed(1)} km
                  </Text>
                )}
              </View>
              <View
                style={[styles.prog, { backgroundColor: theme.divider }]}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Progreso del viaje"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progreso * 100) }}
              >
                <Animated.View style={[styles.progFill, { backgroundColor: theme.onTrip }, progresoStyle]} />
              </View>
              <SlideToConfirm
                tone="primary"
                label="Desliza para finalizar"
                accessibilityLabel="Finalizar viaje y pasar al cobro"
                onConfirm={handleAvanzar}
              />
            </>
          ) : (
            <>
              <View style={styles.hRow}>
                <View style={styles.pax}>
                  <AvatarPasajero nombre={pasajero.nombre} apellido={pasajero.apellido} size={40} />
                  <View style={styles.flex}>
                    <Text style={[Type.label, { color: theme.text }]}>{nombreCorto}</Text>
                    {origen?.notas ? (
                      <Text style={[Type.detail, { color: theme.textMuted }]} numberOfLines={2}>{origen.notas}</Text>
                    ) : null}
                  </View>
                </View>
                {pasajero.telefono ? (
                  <View style={styles.contact}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Llamar a ${pasajero.nombre}`}
                      onPress={() => contacto('tel')}
                      hitSlop={HitSlop}
                      style={[styles.icb, { borderColor: theme.divider }]}
                    >
                      <Ionicons name="call-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Escribir a ${pasajero.nombre}`}
                      onPress={() => contacto('sms')}
                      hitSlop={HitSlop}
                      style={[styles.icb, { borderColor: theme.divider }]}
                    >
                      <Ionicons name="chatbox-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
              <AppButton label={ACCION[estadoViaje] ?? ''} onPress={handleAvanzar} />
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  top: {
    position: 'absolute',
    top: 0,
    left: Spacing.md,
    right: Spacing.md,
    gap: Spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 14,
    ...Shadow.raise,
  },
  destK: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.xxs,
  },
  destT: { alignItems: 'flex-end' },
  destFig: { minWidth: 64, textAlign: 'right' },

  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadow.sheet,
  },
  panelBody: { gap: 14 },
  hRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm + 2,
  },
  pax: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
  contact: { flexDirection: 'row', gap: Spacing.sm },
  icb: {
    width: Hit.control,
    height: Hit.control,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prog: { height: 6, borderRadius: 6, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 6 },
});
