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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConductorStackParamList } from '@navigation/types';
import { mockSolicitudes } from '../data/mockSolicitudes';
import { useConductorStore } from '@store/useConductorStore';
import { Colors } from '@theme/colors';
import { FontFamily, FontSize } from '@theme/fonts';
import { Spacing, BorderRadius, Shadow } from '@theme/spacing';

type Props = NativeStackScreenProps<ConductorStackParamList, 'SolicitudDetalle'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TIEMPO_LIMITE = 30;
const CARD_HEIGHT   = SCREEN_HEIGHT * 0.52;

export function SolicitudDetalleScreen({ route, navigation }: Props) {
  const { solicitudId } = route.params;
  const insets            = useSafeAreaInsets();
  const setSolicitudActual = useConductorStore((s) => s.setSolicitudActual);

  const solicitud = mockSolicitudes.find((s) => s.id === solicitudId);
  const [segundos, setSegundos] = useState(TIEMPO_LIMITE);

  // Card slide-in animation
  const cardAnim = useRef(new Animated.Value(CARD_HEIGHT)).current;
  // Timer arc fill (0 → 1 in 30s)
  const timerProg = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide card up
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, bounciness: 3, speed: 14 }).start();

    // Countdown progress
    const anim = Animated.timing(timerProg, {
      toValue: 0,
      duration: TIEMPO_LIMITE * 1000,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => { if (finished) navigation.goBack(); });

    const interval = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => { anim.stop(); clearInterval(interval); };
  }, []);

  if (!solicitud) return null;

  const origen  = solicitud.paradas.find((p) => p.esOrigen);
  const destino = solicitud.paradas.find((p) => !p.esOrigen);

  const mapRegion = origen ? {
    latitude:      origen.coordenadas.latitude - 0.008,
    longitude:     origen.coordenadas.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : undefined;

  const timerColor = timerProg.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [Colors.error, Colors.warning, Colors.success],
  });

  const handleAceptar = () => {
    setSolicitudActual(solicitud);
    navigation.replace('Viaje', { solicitudId: solicitud.id });
  };

  return (
    <View style={styles.container}>
      {/* Map background */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        scrollEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {origen  && <Marker coordinate={origen.coordenadas}  pinColor={Colors.success} />}
        {destino && <Marker coordinate={destino.coordenadas} pinColor={Colors.error}   />}
        {origen && destino && (
          <Polyline
            coordinates={[origen.coordenadas, destino.coordenadas]}
            strokeColor={Colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + Spacing.sm }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Trip request card */}
      <Animated.View
        style={[
          styles.card,
          { paddingBottom: insets.bottom + Spacing.lg, transform: [{ translateY: cardAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* ── Header stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statValue}>
              {origen?.duracionMin ?? '--'} min
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="navigate-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statValue}>
              {origen?.distanciaKm ?? '--'} km
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.statValue}>
              {solicitud.pasajero.calificacion.toFixed(1)}
            </Text>
          </View>

          {/* Countdown circle */}
          <Animated.View style={[styles.timerCircle, { borderColor: timerColor }]}>
            <Text style={styles.timerText}>{segundos}</Text>
          </Animated.View>
        </View>

        <View style={styles.separator} />

        {/* ── Main content: price + route ── */}
        <View style={styles.contentRow}>
          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.priceSymbol}>{solicitud.simboloMoneda}</Text>
            <Text style={styles.priceAmount}>{solicitud.precio.toFixed(2)}</Text>
            <View style={styles.metodoPill}>
              <Text style={styles.metodoText}>{solicitud.metodoPago}</Text>
            </View>
          </View>

          <View style={styles.contentDivider} />

          {/* Route */}
          <View style={styles.routeBlock}>
            <View style={styles.routeRow}>
              <View style={styles.dotOrigen} />
              <Text style={styles.routeText} numberOfLines={2}>
                {origen?.direccion}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={styles.dotDestino} />
              <Text style={styles.routeText} numberOfLines={2}>
                {destino?.direccion}
              </Text>
            </View>
          </View>
        </View>

        {/* Passenger row */}
        <View style={styles.pasajeroRow}>
          <View style={styles.paxAvatar}>
            <Ionicons name="person" size={16} color={Colors.textSecondary} />
          </View>
          <Text style={styles.paxNombre}>
            {solicitud.pasajero.nombre} {solicitud.pasajero.apellido}
          </Text>
          <Text style={styles.paxViajes}>
            {solicitud.pasajero.totalViajes} viajes
          </Text>
        </View>

        {solicitud.comentario ? (
          <View style={styles.comentarioRow}>
            <Ionicons name="chatbubble-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.comentarioText}>{solicitud.comentario}</Text>
          </View>
        ) : null}

        <View style={styles.separator} />

        {/* ── Action buttons ── */}
        <TouchableOpacity style={styles.aceptarBtn} onPress={handleAceptar} activeOpacity={0.88}>
          <Text style={styles.aceptarText}>TAP PARA ACEPTAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rechazarBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.rechazarText}>Rechazar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  backBtn: {
    position: 'absolute',
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },

  /* Card */
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },

  /* Stats row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
  },
  timerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  timerText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.md,
  },

  /* Price + Route */
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  priceBlock: {
    alignItems: 'flex-start',
    minWidth: 90,
  },
  priceSymbol: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  priceAmount: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.textPrimary,
    lineHeight: 40,
  },
  metodoPill: {
    marginTop: 4,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  metodoText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  contentDivider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
  },
  routeBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.divider,
    marginLeft: 5,
    marginVertical: 3,
  },
  dotOrigen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    marginTop: 3,
  },
  dotDestino: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.textPrimary,
    marginTop: 4,
  },
  routeText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  /* Passenger */
  pasajeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  paxAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paxNombre: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  paxViajes: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  /* Comment */
  comentarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#f9fafb',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  comentarioText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  /* Buttons */
  aceptarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  aceptarText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    letterSpacing: 1,
  },
  rechazarBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rechazarText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
