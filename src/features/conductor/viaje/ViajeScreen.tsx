import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { EstadoViaje } from '../types';
import { useConductorStore } from '@store/useConductorStore';
import { cronometro, useSegundosDesde } from '@shared/hooks/useSegundosDesde';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { PanelPago } from './components/PanelPago';
import { CancelarViajeSheet } from './components/CancelarViajeSheet';
import { ESPERA_MINIMA_SEG, puedeCancelar } from './cancelacion';
import type { MotivoCancelacion } from '@store/useConductorStore';
import { fetchRoute, type LatLng } from './services/directionsService';
import { AvatarPasajero, MapButton, SlideToConfirm, SosButton } from '@shared/components/ui';
import { esEfectivo } from '@shared/utils/cobro';
import { formatSoles } from '@shared/utils/format';
import { DestinationMarker, DriverMarker, PickupMarker } from '@shared/components/map/RouteMarkers';
import { RoutePolyline } from '@shared/components/map/RoutePolyline';
import { distanciaRutaKm, formatDistancia, restanteEnRutaKm } from '@shared/utils/geo';
import { useAppTheme } from '@theme/useAppTheme';
import { useMapStyle } from '@shared/components/map/mapStyle';
import { Weight, Type } from '@theme/fonts';
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

/**
 * La siguiente accion concreta en cada estado. Todas se confirman deslizando,
 * como en Uber y DiDi: un bache no debe avanzar el viaje.
 */
const ACCION: Partial<Record<EstadoViaje, { label: string; a11y: string }>> = {
  aceptado:  { label: 'Ir al punto de recojo', a11y: 'Empezar a ir al punto de recojo' },
  en_camino: { label: 'Llegué al punto de recojo', a11y: 'Confirmar que llegaste al punto de recojo' },
  esperando: { label: 'Iniciar viaje', a11y: 'El pasajero subió, iniciar viaje' },
  iniciado:  { label: 'Finalizar viaje', a11y: 'Finalizar viaje y pasar al cobro' },
};

/** Espera sin costo en el punto de recojo (referencia: Uber espera 5 min en UberX). */
const ESPERA_GRATIS_SEG = ESPERA_MINIMA_SEG;

const LIMA_REGION = {
  latitude: -12.0464, longitude: -77.0428,
  latitudeDelta: 0.05, longitudeDelta: 0.05,
};

const hora = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};


export function ViajeScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets = useSafeAreaInsets();
  const theme  = useAppTheme();
  const mapStyle = useMapStyle();
  const mapRef = useRef<MapView>(null);

  const solicitudActual = useConductorStore((s) => s.solicitudActual);
  const estadoViaje     = useConductorStore((s) => s.estadoViaje);
  const avanzarEstado   = useConductorStore((s) => s.avanzarEstado);
  const finalizarViaje  = useConductorStore((s) => s.finalizarViaje);
  const cancelarViaje   = useConductorStore((s) => s.cancelarViaje);
  const [cancelando, setCancelando] = useState(false);

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

  // Tiempo esperando al pasajero: se cuenta desde que se llego (store), asi no
  // vuelve a 0:00 si el conductor sale al inicio y regresa
  const esperandoDesde = useConductorStore((s) => s.esperandoDesde);
  const esperandoSeg = useSegundosDesde(fase === 'esperando' ? esperandoDesde : null);

  // Progreso del viaje sobre la ruta
  const totalKm = useMemo(() => distanciaRutaKm(routeCoords), [routeCoords]);
  const restanteKm = fase === 'viaje' && driverCoord && routeCoords.length > 1
    ? restanteEnRutaKm(routeCoords, driverCoord)
    : totalKm;
  if (!solicitud || !estadoViaje) return null;

  const pasajero = solicitud.pasajero;
  const nombreCorto = `${pasajero.nombre} ${pasajero.apellido.charAt(0)}.`;

  const handleAvanzar = () => avanzarEstado();
  const handleFinalizar = () => {
    const viajeId = finalizarViaje();
    navigation.replace('Calificar', { solicitudId: viajeId ?? solicitud.id });
  };
  const handleCancelar = (motivo: MotivoCancelacion) => {
    setCancelando(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    cancelarViaje(motivo);
    navigation.reset({ index: 0, routes: [{ name: 'ConductorHome' }] });
  };

  if (estadoViaje === 'llegado') {
    return (
      <PanelPago
        solicitud={solicitud}
        distanciaKm={totalKm > 0 ? totalKm : undefined}
        onFinalizar={handleFinalizar}
      />
    );
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

  const efectivo = esEfectivo(solicitud.metodoPago);
  const cobro = { label: efectivo ? 'cobra en efectivo' : `pagado con ${solicitud.metodoPago}`, valor: formatSoles(solicitud.precio), tono: efectivo ? theme.cash : undefined };
  const esperaRestante = Math.max(0, ESPERA_GRATIS_SEG - esperandoSeg);
  const datos: { label: string; valor: string; tono?: string }[] =
    fase === 'recojo' ? [
      cobro,
      { label: 'servicio', valor: 'RunX' },
      { label: 'hasta el recojo', valor: recojoKm ? formatDistancia(recojoKm) : '—' },
    ] : fase === 'esperando' ? [
      { label: esperaRestante > 0 ? 'espera sin costo' : 'espera excedida', valor: cronometro(esperaRestante), tono: esperaRestante > 0 ? undefined : theme.danger },
      cobro,
      { label: 'viaje', valor: destino?.duracionMin ? `${destino.duracionMin} min` : '—' },
    ] : [
      { label: 'llegada', valor: minViaje ? hora(Date.now() + minViaje * 60_000) : '—' },
      { label: 'faltan', valor: totalKm > 0 ? formatDistancia(restanteKm) : '—' },
      cobro,
    ];

  type Nota = { icono: keyof typeof Ionicons.glyphMap; texto: string };
  const notas: Nota[] = [];
  if (fase !== 'viaje' && origen?.notas) notas.push({ icono: 'location-outline', texto: origen.notas });
  if (solicitud.comentario) notas.push({ icono: 'chatbox-ellipses-outline', texto: `"${solicitud.comentario}"` });

  const accion = ACCION[estadoViaje];

  const contacto = (esquema: 'tel' | 'sms') => {
    if (pasajero.telefono) void Linking.openURL(`${esquema}:${pasajero.telefono}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={
          origen ? { ...origen.coordenadas, latitudeDelta: 0.02, longitudeDelta: 0.02 } : LIMA_REGION
        }
        showsUserLocation={false}
        toolbarEnabled={false}
      >
        <RoutePolyline coordinates={routeCoords} />
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
          {/* Pasajero: quien es y como contactarlo */}
          <View style={styles.hRow}>
            <View style={styles.pax}>
              <AvatarPasajero nombre={pasajero.nombre} apellido={pasajero.apellido} size={44} />
              <View style={styles.flex}>
                <Text style={[Type.name, { color: theme.text }]} numberOfLines={1}>
                  {fase === 'viaje' ? `${pasajero.nombre} ${pasajero.apellido} · a bordo` : `${pasajero.nombre} ${pasajero.apellido}`}
                </Text>
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color={theme.textMuted} />
                  <Text style={[Type.detail, { color: theme.textMuted }]}>
                    {pasajero.calificacion.toFixed(1)} · {pasajero.totalViajes} viajes
                  </Text>
                </View>
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

          {/* Tres datos de un vistazo, segun la fase */}
          <View style={[styles.facts, { borderColor: theme.divider }]}>
            {datos.map((d, i) => (
              <View
                key={d.label}
                style={[styles.fact, i > 0 && [styles.factSep, { borderLeftColor: theme.divider }]]}
                accessible
                accessibilityLabel={`${d.label}: ${d.valor}`}
              >
                <Text
                  style={[Type.kpi, { color: d.tono ?? theme.text }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {d.valor}
                </Text>
                <Text style={[Type.kpiLabel, { color: theme.textMuted }]}>{d.label}</Text>
              </View>
            ))}
          </View>

          {/* Lo que el pasajero dejo dicho: referencia del recojo y comentario */}
          {notas.length > 0 && (
            <View style={[styles.notas, { backgroundColor: theme.background }]}>
              {notas.map((n) => (
                <View key={n.texto} style={styles.nota}>
                  <Ionicons name={n.icono} size={16} color={theme.textMuted} style={styles.notaIcon} />
                  <Text style={[Type.detail, styles.flex, { color: theme.text }]}>{n.texto}</Text>
                </View>
              ))}
            </View>
          )}

          {accion && (
            <SlideToConfirm
              key={estadoViaje}
              tone="primary"
              label={accion.label}
              accessibilityLabel={accion.a11y}
              onConfirm={handleAvanzar}
            />
          )}

          {/* Antes de que suba el pasajero: cancelar con motivo (despues solo queda SOS) */}
          {puedeCancelar(estadoViaje) && (
            <TouchableOpacity
              onPress={() => setCancelando(true)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar viaje"
              hitSlop={HitSlop}
              style={styles.cancelar}
            >
              <Text style={[Type.label, { color: theme.danger }]}>Cancelar viaje</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
        <CancelarViajeSheet
          visible={cancelando}
          estado={estadoViaje}
          esperandoSeg={esperandoSeg}
          nombrePasajero={pasajero.nombre}
          onCerrar={() => setCancelando(false)}
          onConfirmar={handleCancelar}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  cancelar: { alignSelf: 'center', minHeight: Hit.min, justifyContent: 'center', paddingHorizontal: Spacing.md },

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
  destK: { ...Type.tag, marginBottom: Spacing.xxs },
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
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  facts: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1 },
  fact: { flex: 1, paddingVertical: Spacing.sm + 2, paddingRight: 6 },
  factSep: { paddingLeft: Spacing.sm + 2, borderLeftWidth: 1 },
  notas: { gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md },
  nota: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  notaIcon: { marginTop: 1 },
});
