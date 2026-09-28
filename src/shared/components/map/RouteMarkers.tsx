import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker, type LatLng } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/useAppTheme';

/**
 * Marcadores de recojo (circulo) y destino (cuadrado), los mismos del riel de paradas.
 * `active`: el recojo es el objetivo actual y va en el color de recojo.
 */
export function PickupMarker({ coordinate, active = false }: { coordinate: LatLng; active?: boolean }) {
  const theme = useAppTheme();
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} accessibilityLabel="Punto de recojo">
      <View
        style={[
          styles.circle,
          active
            ? { width: 20, height: 20, borderWidth: 3, borderColor: theme.surface, backgroundColor: theme.pickup }
            : [styles.base, { borderColor: theme.route, backgroundColor: theme.routeCase }],
        ]}
      />
    </Marker>
  );
}

/** Auto del conductor: halo, circulo y flecha en el color de la ruta, girada segun el rumbo. */
export function DriverMarker({ coordinate, heading }: { coordinate: LatLng; heading?: number | null }) {
  const theme = useAppTheme();
  const conRumbo = heading != null && heading >= 0;
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} flat accessibilityLabel="Tu ubicación">
      <View style={styles.driverHalo}>
        <View style={[StyleSheet.absoluteFillObject, styles.driverHaloFill, { backgroundColor: theme.route }]} />
        <View style={[styles.driverCore, { backgroundColor: theme.surface, borderColor: theme.route }]}>
          {conRumbo ? (
            <Ionicons
              name="navigate"
              size={13}
              color={theme.route}
              // navigate apunta a 45 grados; se corrige para que 0 sea el norte
              style={{ transform: [{ rotate: `${heading - 45}deg` }] }}
            />
          ) : (
            <View style={[styles.driverDot, { backgroundColor: theme.route }]} />
          )}
        </View>
      </View>
    </Marker>
  );
}

export function DestinationMarker({ coordinate }: { coordinate: LatLng }) {
  const theme = useAppTheme();
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} accessibilityLabel="Destino">
      <View style={[styles.base, styles.square, { borderColor: theme.routeCase, backgroundColor: theme.route }]} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  base: { width: 18, height: 18, borderWidth: 4 },
  circle: { borderRadius: 9 },
  square: { borderRadius: 4 },
  driverHalo: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  driverHaloFill: { borderRadius: 17, opacity: 0.18 },
  driverCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverDot: { width: 8, height: 8, borderRadius: 4 },
});
