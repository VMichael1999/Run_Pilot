import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Solicitud } from '@features/conductor/types';
import { fetchRoute } from '@features/conductor/viaje/services/directionsService';
import type { LatLng } from '@features/conductor/viaje/services/directionsService';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

const { height: SCREEN_H } = Dimensions.get('window');
const COUNTDOWN = 20;

interface Props {
  solicitud: Solicitud;
  onAceptar: () => void;
  onRechazar: () => void;
}

export function IncomingRequestOverlay({ solicitud, onAceptar, onRechazar }: Props) {
  const insets   = useSafeAreaInsets();
  const mapRef   = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(400)).current;

  const [segundos,    setSegundos]    = useState(COUNTDOWN);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  const origen  = solicitud.paradas.find((p) => p.esOrigen);
  const destino = solicitud.paradas.find((p) => !p.esOrigen);

  useEffect(() => {
    // Slide card up
    Animated.spring(cardAnim, {
      toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14,
    }).start();

    // Countdown
    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);

    // Fetch route
    if (origen && destino) {
      fetchRoute(origen.coordenadas, destino.coordenadas).then((coords) => {
        setRouteCoords(coords);
        if (coords.length > 1) {
          const lats = coords.map((c) => c.latitude);
          const lngs = coords.map((c) => c.longitude);
          const latDelta = (Math.max(...lats) - Math.min(...lats)) * 1.6 + 0.06;
          const lngDelta = (Math.max(...lngs) - Math.min(...lngs)) * 1.6 + 0.06;
          const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
          const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
          // Desplazar el centro hacia abajo para que la ruta quede en la zona visible sobre la card
          mapRef.current?.animateToRegion({
            latitude:      centerLat - latDelta * 0.22,
            longitude:     centerLng,
            latitudeDelta:  latDelta,
            longitudeDelta: lngDelta,
          }, 700);
        }
      });
    }

    return () => clearInterval(interval);
  }, []);

  // Llamar onRechazar fuera del render, cuando el countdown llega a 0
  useEffect(() => {
    if (segundos === 0) onRechazar();
  }, [segundos]);

  const mapRegion = origen && destino ? (() => {
    const latDelta = Math.abs(origen.coordenadas.latitude  - destino.coordenadas.latitude)  * 1.6 + 0.06;
    const lngDelta = Math.abs(origen.coordenadas.longitude - destino.coordenadas.longitude) * 1.6 + 0.06;
    const centerLat = (origen.coordenadas.latitude  + destino.coordenadas.latitude)  / 2;
    const centerLng = (origen.coordenadas.longitude + destino.coordenadas.longitude) / 2;
    return {
      latitude:      centerLat - latDelta * 0.22,
      longitude:     centerLng,
      latitudeDelta:  latDelta,
      longitudeDelta: lngDelta,
    };
  })() : undefined;

  return (
    <View style={StyleSheet.absoluteFillObject}>

      {/* Mapa pantalla completa */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        scrollEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation
      >
        {/* Marker origen: circulo azul con persona */}
        {origen && (
          <Marker coordinate={origen.coordenadas} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerOrigen}>
              <View style={styles.markerDestinoDot} />
            </View>
          </Marker>
        )}

        {/* Marker destino: cuadro negro */}
        {destino && (
          <Marker coordinate={destino.coordenadas} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerDestino}>
              <View style={styles.markerDestinoDot} />
            </View>
          </Marker>
        )}

        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={Colors.textPrimary}
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Card flotante */}
      <Animated.View
        style={[
          styles.card,
          { bottom: insets.bottom + Spacing.lg, transform: [{ translateY: cardAnim }] },
        ]}
      >
        {/* Fila superior */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <View style={styles.tipoPill}>
              <Ionicons name="person" size={11} color={Colors.white} />
              <Text style={styles.tipoText}>RunX</Text>
            </View>
            <View style={styles.exclusivoPill}>
              <Text style={styles.exclusivoText}>Exclusivo</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerNumText}>{segundos}s</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onRechazar} activeOpacity={0.75}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.precioRow}>
          <Text style={styles.precio}>{solicitud.simboloMoneda} {solicitud.precio.toFixed(2)}</Text>
          <Ionicons name="flash" size={22} color={Colors.warning} style={{ marginTop: 10 }} />
        </View>

        {/* Rating + Verificado */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={styles.ratingNum}>{solicitud.pasajero.calificacion.toFixed(2)}</Text>
          <View style={styles.verificadoBadge}>
            <Ionicons name="checkmark-circle" size={15} color='#3B82F6' />
            <Text style={styles.verificadoText}>Verificado</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ruta */}
        <View style={styles.rutaContainer}>
          <View style={styles.rutaLineas}>
            <View style={styles.dotTop} />
            <View style={styles.lineaV} />
            <View style={styles.dotBottom} />
          </View>
          <View style={styles.rutaTextos}>
            <View style={styles.rutaItem}>
              <Text style={styles.rutaTiempo}>
                {origen?.duracionMin ?? '--'} min ({origen?.distanciaKm ?? '--'} km) de distancia
              </Text>
              <Text style={styles.rutaDireccion} numberOfLines={1}>{origen?.direccion}</Text>
            </View>
            <View style={styles.rutaItem}>
              <Text style={styles.rutaTiempo}>
                {destino?.duracionMin ?? '--'} min de viaje
              </Text>
              <Text style={styles.rutaDireccion} numberOfLines={1}>{destino?.direccion}</Text>
            </View>
          </View>
        </View>

        {/* Boton Aceptar */}
        <TouchableOpacity style={styles.aceptarBtn} onPress={onAceptar} activeOpacity={0.88}>
          <Text style={styles.aceptarText}>Aceptar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({

  /* Markers */
  markerOrigen: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 4,
    elevation: 5,
  },
  markerDestino: {
    width: 26, height: 26, borderRadius: 5,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 4,
    elevation: 5,
  },
  markerDestinoDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.white,
  },

  /* Card flotante — bordes redondeados en los 4 lados */
  card: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    ...Shadow.lg,
  },

  /* Top */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  topLeft: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  tipoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  tipoText: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white,
  },
  exclusivoPill: {
    borderWidth: 1.5, borderColor: '#3B82F6',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  exclusivoText: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: '#3B82F6',
  },
  timerBadge: {
    backgroundColor: '#f0f2f5',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  timerNumText: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.textSecondary,
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: '#f0f2f5',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Precio */
  precioRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing.xs, marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  precio: {
    fontFamily: FontFamily.bold, fontSize: 44,
    color: Colors.textPrimary, letterSpacing: -1, lineHeight: 52,
  },

  /* Rating */
  ratingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginBottom: Spacing.md,
  },
  ratingNum: {
    fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  verificadoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  verificadoText: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#3B82F6',
  },

  divider: {
    height: 1, backgroundColor: Colors.divider, marginBottom: Spacing.md,
  },

  /* Ruta */
  rutaContainer: {
    flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg,
  },
  rutaLineas: {
    alignItems: 'center', paddingTop: 4, width: 16,
  },
  dotTop: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  lineaV: {
    width: 2, flex: 1, minHeight: 24,
    backgroundColor: Colors.divider, marginVertical: 3,
  },
  dotBottom: {
    width: 10, height: 10, borderRadius: 2,
    backgroundColor: Colors.textPrimary,
  },
  rutaTextos: { flex: 1, gap: Spacing.md },
  rutaItem: { gap: 2 },
  rutaTiempo: {
    fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  rutaDireccion: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary,
  },

  /* Boton */
  aceptarBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
  },
  aceptarText: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md,
    color: Colors.white, letterSpacing: 0.3,
  },
});
