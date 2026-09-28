import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker, type LatLng } from 'react-native-maps';
import { useAppTheme } from '@theme/useAppTheme';

/** Marcadores de recojo (circulo) y destino (cuadrado), los mismos del riel de paradas. */
export function PickupMarker({ coordinate }: { coordinate: LatLng }) {
  const theme = useAppTheme();
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} accessibilityLabel="Punto de recojo">
      <View style={[styles.base, styles.circle, { borderColor: theme.route, backgroundColor: theme.routeCase }]} />
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
});
