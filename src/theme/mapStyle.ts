import type { MapStyleElement } from 'react-native-maps';

/**
 * Estilos de Google Maps de la direccion "Senal": mapa apagado para que lo unico
 * que resalte sea la ruta y el estado. De noche baja el brillo.
 */
function build(c: {
  bg: string; block: string; road: string; avenue: string; park: string; sea: string; label: string;
}): MapStyleElement[] {
  return [
    { elementType: 'geometry', stylers: [{ color: c.bg }] },
    { elementType: 'labels.text.fill', stylers: [{ color: c.label }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: c.bg }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: c.park }] },
    { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: c.block }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: c.road }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: c.avenue }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: c.avenue }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: c.sea }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  ];
}

export const MapStyle = {
  light: build({
    bg: '#E3E7EA', block: '#D7DCE0', road: '#FFFFFF', avenue: '#F6F1DF',
    park: '#D1E5D5', sea: '#CFE0EA', label: '#66717A',
  }),
  dark: build({
    bg: '#101519', block: '#161C21', road: '#232B32', avenue: '#303840',
    park: '#12241A', sea: '#0B1922', label: '#6F7A83',
  }),
};
