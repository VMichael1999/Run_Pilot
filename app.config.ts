import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extiende app.json con la key de Google Maps leida de .env
 * (Expo CLI carga .env automaticamente). Ver .env.example.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    console.warn(
      '[app.config] Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en .env: el mapa de Google no cargara. Ver .env.example.',
    );
  }

  return {
    ...config,
    name: config.name ?? 'Run_Pilot',
    slug: config.slug ?? 'Run_Pilot',
    android: {
      ...config.android,
      config: { ...config.android?.config, googleMaps: { apiKey: googleMapsApiKey } },
    },
    ios: {
      ...config.ios,
      config: { ...config.ios?.config, googleMapsApiKey },
    },
  };
};
