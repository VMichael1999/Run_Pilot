type LatLng = { latitude: number; longitude: number };

const R_TIERRA_KM = 6371;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distancia en km a lo largo de una polilinea (haversine por tramo). */
export function distanciaRutaKm(puntos: LatLng[]): number {
  let km = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const dLat = rad(b.latitude - a.latitude);
    const dLng = rad(b.longitude - a.longitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    km += 2 * R_TIERRA_KM * Math.asin(Math.sqrt(h));
  }
  return km;
}

/**
 * Km que faltan por la ruta desde la posicion actual: se busca el punto de la
 * ruta mas cercano y se suma desde ahi hasta el final. Aproximado, suficiente
 * para una barra de progreso.
 */
export function restanteEnRutaKm(ruta: LatLng[], pos: LatLng): number {
  if (ruta.length < 2) return 0;
  let masCercano = 0;
  let mejor = Infinity;
  for (let i = 0; i < ruta.length; i++) {
    const d = distanciaRutaKm([pos, ruta[i]]);
    if (d < mejor) { mejor = d; masCercano = i; }
  }
  return distanciaRutaKm(ruta.slice(masCercano));
}

/** "900 m" o "1.2 km". */
export function formatDistancia(km: number): string {
  const metros = Math.round(km * 10) * 100;
  return metros < 1000 ? `${metros} m` : `${km.toFixed(1)} km`;
}
