import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { Region } from 'react-native-maps';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { useConductorStore } from '@store/useConductorStore';
import { AvatarPasajero } from '@shared/components/ui/AvatarPasajero';
import { fetchRoute, type LatLng } from '@features/conductor/viaje/services/directionsService';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'HistorialDetalle'>;

function buildRegion(lats: number[], lngs: number[]): Region {
  const PADDING = 0.018;
  return {
    latitude:       (Math.max(...lats) + Math.min(...lats)) / 2,
    longitude:      (Math.max(...lngs) + Math.min(...lngs)) / 2,
    latitudeDelta:   Math.max(...lats) - Math.min(...lats) + PADDING,
    longitudeDelta:  Math.max(...lngs) - Math.min(...lngs) + PADDING,
  };
}

function formatFechaLarga(ms: number): string {
  return new Date(ms).toLocaleDateString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}
function formatHora(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}
function buildRef(id: string): string {
  const num = (id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900_000) + 100_000;
  return `TRP-${num}`;
}

const METODO_ICONO: Record<string, keyof typeof Ionicons.glyphMap> = {
  Efectivo: 'cash-outline',
  Yape:     'phone-portrait-outline',
  Plin:     'phone-portrait-outline',
  Tarjeta:  'card-outline',
};

export function HistorialDetalleScreen({ route, navigation }: Props) {
  const insets  = useSafeAreaInsets();
  const { viajeId } = route.params;

  const viaje = useConductorStore((s) => s.historial.find((v) => v.id === viajeId));

  const mapRef = useRef<MapView>(null);
  const [routeCoords,  setRouteCoords]  = useState<LatLng[]>([]);
  const [routeRegion,  setRouteRegion]  = useState<Region | null>(null);

  const origenCoord  = viaje?.solicitud.paradas.find((p) => p.esOrigen)?.coordenadas;
  const destinoCoord = viaje?.solicitud.paradas.find((p) => !p.esOrigen)?.coordenadas;

  useEffect(() => {
    if (!origenCoord || !destinoCoord) return;
    fetchRoute(origenCoord, destinoCoord).then((coords) => {
      if (coords.length < 2) {
        // Fallback: region desde coordenadas directas
        const lats = [origenCoord.latitude,  destinoCoord.latitude];
        const lngs = [origenCoord.longitude, destinoCoord.longitude];
        setRouteRegion(buildRegion(lats, lngs));
        return;
      }
      setRouteCoords(coords);
      const lats = coords.map((c) => c.latitude);
      const lngs = coords.map((c) => c.longitude);
      // La region ya incluye el bounding box real de la ruta —
      // se pasa como initialRegion al MapView que monta despues de este setState,
      // evitando cualquier animacion de ajuste posterior.
      setRouteRegion(buildRegion(lats, lngs));
    });
  }, []);

  if (!viaje) {
    return (
      <View style={styles.emptyRoot}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textDisabled} />
        <Text style={styles.emptyText}>Viaje no encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.emptyBack}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { solicitud, fechaMs, calificacion } = viaje;
  const { pasajero, paradas, precio, simboloMoneda, moneda, metodoPago } = solicitud;
  const origen    = paradas.find((p) => p.esOrigen);
  const destino   = paradas.find((p) => !p.esOrigen);
  const iconoPago = METODO_ICONO[metodoPago] ?? 'wallet-outline';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Detalle del viaje</Text>
          <Text style={styles.headerRef}>{buildRef(viaje.id)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Monto destacado ── */}
      <View style={styles.montoWrap}>
        <View style={styles.checkRing}>
          <Ionicons name="checkmark" size={20} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.montoAmount}>{simboloMoneda} {precio.toFixed(2)}</Text>
          <Text style={styles.montoSub}>
            {formatFechaLarga(fechaMs)} · {formatHora(fechaMs)}
          </Text>
        </View>
      </View>

      {/* ── Cuerpo ── */}
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: 40 }}
        >

          {/* ── Mapa ── */}
          <View style={styles.mapCard}>
            {routeRegion ? (
              <>
                <MapView
                  ref={mapRef}
                  style={StyleSheet.absoluteFillObject}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={routeRegion}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {origenCoord && (
                    <Marker coordinate={origenCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={styles.markerOrigen}>
                        <View style={styles.markerDot} />
                      </View>
                    </Marker>
                  )}
                  {destinoCoord && (
                    <Marker coordinate={destinoCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={styles.markerDestino}>
                        <View style={styles.markerDot} />
                      </View>
                    </Marker>
                  )}
                  {routeCoords.length > 1 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor={Colors.primary}
                      strokeWidth={4}
                    />
                  )}
                </MapView>

                {/* Etiquetas flotantes */}
                <View style={styles.mapLabelOrigen}>
                  <View style={styles.mapLabelDot} />
                  <Text style={styles.mapLabelText} numberOfLines={1}>
                    {origen?.direccion}
                  </Text>
                </View>
                <View style={styles.mapLabelDestino}>
                  <View style={[styles.mapLabelDot, styles.mapLabelDotDestino]} />
                  <Text style={styles.mapLabelText} numberOfLines={1}>
                    {destino?.direccion}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.mapLoading}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
          </View>

          {/* Pasajero */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>PASAJERO</Text>
            </View>
            <View style={styles.pasajeroRow}>
              <AvatarPasajero fotoUrl={pasajero.fotoUrl} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pasajeroNombre}>
                  {pasajero.nombre} {pasajero.apellido}
                </Text>
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= Math.round(pasajero.calificacion) ? 'star' : 'star-outline'}
                      size={12}
                      color={Colors.warning}
                    />
                  ))}
                  <Text style={styles.starNum}>{pasajero.calificacion.toFixed(1)}</Text>
                  <Text style={styles.starMuted}>· {pasajero.totalViajes} viajes</Text>
                </View>
              </View>
            </View>

            {/* Calificacion dada */}
            {calificacion > 0 && (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.califRow}>
                  <Text style={styles.califLabel}>Tu calificacion</Text>
                  <View style={styles.califStars}>
                    {[1,2,3,4,5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= calificacion ? 'star' : 'star-outline'}
                        size={16}
                        color={Colors.warning}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Ruta */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="map-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>RUTA</Text>
            </View>
            <View style={styles.rutaContainer}>
              <View style={styles.rutaLineas}>
                <View style={styles.dotOrigen} />
                <View style={styles.lineaV} />
                <View style={styles.dotDestino} />
              </View>
              <View style={{ flex: 1, gap: Spacing.lg }}>
                <View>
                  <Text style={styles.rutaTag}>ORIGEN</Text>
                  <Text style={styles.rutaDireccion}>{origen?.direccion ?? '--'}</Text>
                </View>
                <View>
                  <Text style={styles.rutaTag}>DESTINO</Text>
                  <Text style={styles.rutaDireccion}>{destino?.direccion ?? '--'}</Text>
                </View>
              </View>
            </View>
            {(destino?.duracionMin || destino?.distanciaKm) ? (
              <View style={styles.metaRow}>
                {destino.duracionMin ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={12} color={Colors.primary} />
                    <Text style={styles.metaText}>{destino.duracionMin} min</Text>
                  </View>
                ) : null}
                {destino.distanciaKm ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="navigate-outline" size={12} color={Colors.primary} />
                    <Text style={styles.metaText}>{destino.distanciaKm} km</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Pago */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>PAGO</Text>
            </View>
            <View style={styles.pagoRow}>
              <View style={styles.pagoIconWrap}>
                <Ionicons name={iconoPago} size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pagoMetodo}>{metodoPago}</Text>
                <Text style={styles.pagoSub}>Metodo de pago</Text>
              </View>
              <Text style={styles.pagoMonto}>{simboloMoneda} {precio.toFixed(2)}</Text>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ganancia neta</Text>
              <Text style={styles.totalMonto}>{simboloMoneda} {precio.toFixed(2)}</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },

  emptyRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.white },
  emptyText: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.textSecondary },
  emptyBack: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.primary },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  headerRef: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },

  /* Monto */
  montoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  checkRing: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  montoAmount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    color: Colors.white,
    letterSpacing: -1,
    lineHeight: 42,
  },
  montoSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    textTransform: 'capitalize',
  },

  /* Body */
  body: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    overflow: 'hidden',
  },

  /* Cards */
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },

  /* Pasajero */
  pasajeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pasajeroNombre: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starNum: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  starMuted: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  califRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  califLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  califStars: {
    flexDirection: 'row',
    gap: 2,
  },

  /* Ruta */
  rutaContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rutaLineas: { alignItems: 'center', paddingTop: 3, width: 16 },
  dotOrigen: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2.5, borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  lineaV: {
    width: 2, flex: 1, minHeight: 32,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  dotDestino: {
    width: 12, height: 12, borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  rutaTag: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  rutaDireccion: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  metaText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },

  /* Pago */
  pagoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pagoIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  pagoMetodo: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  pagoSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  pagoMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f6f9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  totalLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  totalMonto: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.success,
  },

  /* Mapa */
  mapCard: {
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  markerOrigen: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3,
    elevation: 4,
  },
  markerDestino: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3,
    elevation: 4,
  },
  markerDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.white,
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  mapLabelOrigen: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    ...Shadow.sm,
  },
  mapLabelDestino: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    ...Shadow.sm,
  },
  mapLabelDot: {
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 2, borderColor: Colors.primary,
    backgroundColor: Colors.white,
    flexShrink: 0,
  },
  mapLabelDotDestino: {
    borderRadius: 2,
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },
  mapLabelText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
});
