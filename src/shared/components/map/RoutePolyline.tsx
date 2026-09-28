import React from 'react';
import { Platform } from 'react-native';
import { Polyline, type LatLng } from 'react-native-maps';
import { useAppTheme } from '@theme/useAppTheme';

const ANCHO = 5;
const BORDE = 2; // a cada lado

/**
 * Color de una polilinea en ambas plataformas.
 * En iOS con Google Maps, react-native-maps 1.20.1 ignora `strokeColor` y pinta
 * el azul por defecto (react-native-maps#5253: el init deja un "span" vacio que
 * tapa el color). `strokeColors` con un solo color reconstruye ese span.
 */
function color(c: string) {
  return Platform.OS === 'ios' ? { strokeColor: c, strokeColors: [c] } : { strokeColor: c };
}

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
        {...color(theme.routeCase)}
        strokeWidth={ANCHO + BORDE * 2}
        lineJoin="round"
        lineCap="round"
        zIndex={1}
      />
      <Polyline
        coordinates={coordinates}
        {...color(theme.route)}
        strokeWidth={ANCHO}
        lineJoin="round"
        lineCap="round"
        zIndex={2}
      />
    </>
  );
}
