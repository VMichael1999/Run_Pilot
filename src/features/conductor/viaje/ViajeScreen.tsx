import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import type { Parada } from '../types';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { PanelCliente } from './components/PanelCliente';
import { BotonAccion } from './components/BotonAccion';
import { PanelPago } from './components/PanelPago';
import { fetchRoute, type LatLng } from './services/directionsService';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'Viaje'>;

/** Genera un numero de referencia de 5 digitos determinista a partir del id de solicitud. */
function paradaRef(solicitudId: string, esOrigen: boolean): string {
  const base =
    (solicitudId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 90_000) + 10_000;
  const num   = esOrigen ? base : base + 1;
  const escala = esOrigen ? 1 : 2;
  return `#${num} - E:${escala}`;
}

// En aceptado/en_camino solo muestra la ubicacion del conductor (zoom cerrado)
const GOING_TO_PASSENGER = new Set(['aceptado', 'en_camino']);

const LIMA_REGION = {
  latitude: -12.0464, longitude: -77.0428,
  latitudeDelta: 0.05, longitudeDelta: 0.05,
};

export function ViajeScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets          = useSafeAreaInsets();
  const mapRef          = useRef<MapView>(null);

  const solicitudActual = useConductorStore((s) => s.solicitudActual);
  const estadoViaje     = useConductorStore((s) => s.estadoViaje);
  const avanzarEstado   = useConductorStore((s) => s.avanzarEstado);
  const finalizarViaje  = useConductorStore((s) => s.finalizarViaje);

  const solicitud = solicitudActual ?? mockSolicitudes.find((s) => s.id === solicitudId);
  const origen    = solicitud?.paradas.find((p) => p.esOrigen);
  const destino   = solicitud?.paradas.find((p) => !p.esOrigen);

  const [driverCoord,    setDriverCoord]    = useState<LatLng | null>(null);
  const [routeCoords,    setRouteCoords]    = useState<LatLng[]>([]);
  const [detalleParada,  setDetalleParada]  = useState<Parada | null>(null);

  // Obtener y rastrear ubicacion del conductor
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({});
      const coord: LatLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setDriverCoord(coord);
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 8 },
        (loc) => setDriverCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  // Zoom al conductor cuando esta yendo al pasajero
  useEffect(() => {
    if (!driverCoord) return;
    if (estadoViaje && GOING_TO_PASSENGER.has(estadoViaje)) {
      mapRef.current?.animateToRegion(
        { ...driverCoord, latitudeDelta: 0.008, longitudeDelta: 0.008 },
        600,
      );
    }
  }, [driverCoord, estadoViaje]);

  // Cargar polyline segun estado
  useEffect(() => {
    if (!estadoViaje || !origen || !destino) return;
    if (GOING_TO_PASSENGER.has(estadoViaje)) {
      // conductor → origen: solo si hay ubicacion real
      if (driverCoord) {
        fetchRoute(driverCoord, origen.coordenadas).then(setRouteCoords);
      }
    } else {
      // origen → destino
      fetchRoute(origen.coordenadas, destino.coordenadas).then((coords) => {
        setRouteCoords(coords);
        if (coords.length > 1 && origen && destino) {
          const lats = coords.map((c) => c.latitude);
          const lngs = coords.map((c) => c.longitude);
          mapRef.current?.animateToRegion({
            latitude:      (Math.max(...lats) + Math.min(...lats)) / 2,
            longitude:     (Math.max(...lngs) + Math.min(...lngs)) / 2,
            latitudeDelta:  Math.max(...lats) - Math.min(...lats) + 0.02,
            longitudeDelta: Math.max(...lngs) - Math.min(...lngs) + 0.02,
          }, 700);
        }
      });
    }
  }, [estadoViaje]);

  if (!solicitud || !estadoViaje) return null;

  const mostrarPanelPago = estadoViaje === 'llegado';
  const yendoAlPasajero  = GOING_TO_PASSENGER.has(estadoViaje);
  const polylineCoords   = routeCoords.length > 1 ? routeCoords : [];

  // BotonAccion total height: paddingTop(8) + track(68) + paddingBottom(12) = 88
  const BOTON_INNER_H  = 88;
  const botonPadBottom = insets.bottom > 0 ? insets.bottom : Spacing.sm;
  const botonTotalH    = BOTON_INNER_H + botonPadBottom;

  const handleAvanzar  = () => avanzarEstado();
  const handleFinalizar = () => {
    finalizarViaje();
    navigation.replace('Calificar', { solicitudId: solicitud.id });
  };

  return (
    <View style={styles.container}>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          driverCoord
            ? { ...driverCoord, latitudeDelta: 0.008, longitudeDelta: 0.008 }
            : LIMA_REGION
        }
        showsUserLocation={false}
      >
        {/* Marker del conductor */}
        {driverCoord && (
          <Marker coordinate={driverCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerDriver}>
              <View style={styles.markerDriverDot} />
            </View>
          </Marker>
        )}

        {/* Markers origen/destino cuando ya va en viaje */}
        {!yendoAlPasajero && origen && (
          <Marker coordinate={origen.coordenadas} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.marker}><View style={styles.markerDot} /></View>
          </Marker>
        )}
        {!yendoAlPasajero && destino && (
          <Marker coordinate={destino.coordenadas} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.marker}><View style={styles.markerDot} /></View>
          </Marker>
        )}

        {polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={Colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Barra de ruta flotante (top) */}
      {!mostrarPanelPago && (
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.xs }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.rutaCard}>
            <TouchableOpacity
              style={styles.rutaRow}
              activeOpacity={0.7}
              onPress={() => origen && setDetalleParada(origen)}
            >
              <View style={styles.dotOrigen} />
              <Text style={styles.rutaText} numberOfLines={1}>{origen?.direccion}</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.rutaSep} />
            <TouchableOpacity
              style={styles.rutaRow}
              activeOpacity={0.7}
              onPress={() => destino && setDetalleParada(destino)}
            >
              <View style={styles.dotDestino} />
              <Text style={styles.rutaText} numberOfLines={1}>{destino?.direccion}</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => driverCoord && mapRef.current?.animateToRegion(
              { ...driverCoord, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600
            )}
          >
            <Ionicons name="locate" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Boton SOS */}
      {!mostrarPanelPago && (
        <TouchableOpacity style={[styles.sosBtn, { bottom: botonTotalH + 106 }]}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      )}

      {/* PanelCliente - bottom sheet above BotonAccion */}
      {!mostrarPanelPago && (
        <PanelCliente
          solicitud={solicitud}
          estadoViaje={estadoViaje}
          bottomOffset={botonTotalH}
        />
      )}

      {/* BotonAccion - fixed at the very bottom */}
      {!mostrarPanelPago && (
        <View style={[styles.botonWrapper, { paddingBottom: botonPadBottom }]}>
          <BotonAccion key={estadoViaje} estado={estadoViaje} onPress={handleAvanzar} />
        </View>
      )}

      {mostrarPanelPago && (
        <PanelPago solicitud={solicitud} onFinalizar={handleFinalizar} />
      )}

      {/* ── Detalle de parada ── */}
      <Modal
        visible={detalleParada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalleParada(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDetalleParada(null)}>
          <Pressable
            style={[styles.detalleCard, { top: insets.top + 76 }]}
            onPress={() => { /* consume el tap para no cerrar */ }}
          >
            {/* Cabecera: icono de tipo + etiqueta + referencia */}
            <View style={styles.detalleHeader}>
              <View style={[
                styles.detalleDot,
                detalleParada?.esOrigen ? styles.detalleDotOrigen : styles.detalleDotDestino,
              ]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detalleTipo}>
                  {detalleParada?.esOrigen ? 'Punto de recogida' : 'Destino'}
                </Text>
                <Text style={styles.detalleRef}>
                  {detalleParada ? paradaRef(solicitud.id, detalleParada.esOrigen) : ''}
                </Text>
              </View>
            </View>

            <View style={styles.detalleSep} />

            {/* Direccion */}
            <Text style={styles.detalleDireccion}>{detalleParada?.direccion}</Text>

            {/* Notas */}
            {detalleParada?.notas ? (
              <View style={styles.detalleNotasWrap}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.detalleNotas}>{detalleParada.notas}</Text>
              </View>
            ) : null}

            {/* Distancia y duracion */}
            {(detalleParada?.distanciaKm || detalleParada?.duracionMin) ? (
              <View style={styles.detalleMetaRow}>
                {detalleParada.distanciaKm ? (
                  <View style={styles.detalleMeta}>
                    <Ionicons name="navigate-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.detalleMetaText}>{detalleParada.distanciaKm} km</Text>
                  </View>
                ) : null}
                {detalleParada.duracionMin ? (
                  <View style={styles.detalleMeta}>
                    <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.detalleMetaText}>{detalleParada.duracionMin} min</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Top bar con barra de ruta */
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  rutaCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.md,
  },
  rutaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rutaSep: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 5,
    marginLeft: 22,
  },
  dotOrigen: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.textSecondary,
    backgroundColor: Colors.white,
  },
  dotDestino: {
    width: 10, height: 10, borderRadius: 2,
    backgroundColor: Colors.textPrimary,
  },
  rutaText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },

  /* SOS */
  sosBtn: {
    position: 'absolute',
    right: Spacing.lg,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  sosText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
    letterSpacing: 0.5,
  },

  /* BotonAccion fixed wrapper */
  botonWrapper: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
  },

  /* Marker conductor: circulo negro con punto blanco */
  markerDriver: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
    elevation: 6,
  },
  markerDriverDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.white,
  },

  /* Modal detalle parada */
  modalBackdrop: {
    flex: 1,
  },
  detalleCard: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  detalleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  detalleDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalleDotOrigen: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  detalleDotDestino: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  detalleTipo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  detalleRef: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  detalleSep: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  detalleDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  detalleNotasWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  detalleNotas: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  detalleMetaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  detalleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detalleMetaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  /* Markers origen/destino */
  marker: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3,
    elevation: 4,
  },
  markerDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.white,
  },
});
