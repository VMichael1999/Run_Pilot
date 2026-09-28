import React from 'react';
import { Polyline, type LatLng } from 'react-native-maps';
import { useAppTheme } from '@theme/useAppTheme';

const ANCHO = 5;
const BORDE = 2; // a cada lado

/**
 * Ruta con borde para que se lea sobre cualquier calle del mapa de Google:
 * negra con borde blanco de dia, verde con borde negro de noche.
 */
export function RoutePolyline({ coordinates }: { coordinates: LatLng[] }) {
  const theme = useAppTheme();
  if (coordinates.length < 2) return null;
  return (
    <>
      <Polyline
        coordinates={coordinates}
        strokeColor={theme.routeCase}
        strokeWidth={ANCHO + BORDE * 2}
        lineJoin="round"
        lineCap="round"
        zIndex={1}
      />
      <Polyline
        coordinates={coordinates}
        strokeColor={theme.route}
        strokeWidth={ANCHO}
        lineJoin="round"
        lineCap="round"
        zIndex={2}
      />
    </>
  );
}
