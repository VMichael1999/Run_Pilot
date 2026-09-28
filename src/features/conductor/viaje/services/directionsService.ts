// Viene de .env (ver .env.example). Nunca escribir la key aqui.
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export type LatLng = { latitude: number; longitude: number };

function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export async function fetchRoute(origin: LatLng, destination: LatLng): Promise<LatLng[]> {
  if (!GOOGLE_API_KEY) {
    console.warn('[directions] Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en .env');
    return [];
  }
  try {
    const url =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}` +
      `&key=${GOOGLE_API_KEY}`;

    const res  = await fetch(url);
    const data = await res.json() as {
      status: string;
      routes?: Array<{ overview_polyline: { points: string } }>;
    };

    if (data.status !== 'OK' || !data.routes?.length) {
      // REQUEST_DENIED suele ser la key sin Directions API habilitada o restringida por app
      if (__DEV__) console.warn(`[directions] Google respondio ${data.status}`);
      return [];
    }
    return decodePolyline(data.routes[0].overview_polyline.points);
  } catch {
    return [];
  }
}
