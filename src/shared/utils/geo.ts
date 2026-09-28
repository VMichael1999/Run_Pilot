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
