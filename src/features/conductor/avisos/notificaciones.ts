import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Solicitud } from '../types';
import { formatSoles } from '@shared/utils/format';

export const CANAL_SOLICITUDES = 'solicitudes';

/**
 * Las notificaciones de solicitudes de viaje deben mostrar banner y sonar siempre
 * que se emitan, incluso si la app se abre automáticamente al recibirlas.
 */
Notifications.setNotificationHandler({
  handleNotification: async (n) => {
    const data = n.request.content.data as { tipo?: string } | undefined;
    const esSolicitud = data?.tipo === 'solicitud';
    return {
      shouldShowBanner: esSolicitud,
      shouldShowList: esSolicitud,
      shouldPlaySound: esSolicitud,
      shouldSetBadge: false,
    };
  },
});

let canalListo: Promise<void> | null = null;

/** Canal de Android con prioridad maxima (aparece arriba y suena). Idempotente. */
export function prepararCanal(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  canalListo ??= Notifications.setNotificationChannelAsync(CANAL_SOLICITUDES, {
    name: 'Solicitudes de viaje',
    description: 'Aviso cuando llega un viaje y estás en otra app',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  }).then(() => undefined);
  return canalListo;
}

/** Pide el permiso de notificaciones si aun no se decidio. @returns si esta concedido. */
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  try {
    // Android 13+: sin un canal creado, el sistema no muestra el dialogo del permiso
    await prepararCanal();
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    if (!actual.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false; // plataforma sin notificaciones (web, tests)
  }
}

export function textoAviso(s: Solicitud): { title: string; body: string } {
  const origen = s.paradas.find((p) => p.esOrigen);
  const minutos = origen?.duracionMin != null ? ` · recojo a ${origen.duracionMin} min` : '';
  return {
    title: 'Nueva solicitud de viaje',
    body: `${formatSoles(s.precio)} · ${s.metodoPago} · ${s.pasajero.nombre}${minutos}`,
  };
}

/** Muestra el aviso de una solicitud (inmediato o tras un retraso en segundos). @returns el id para quitarlo despues. */
export async function avisarSolicitud(s: Solicitud, retrasoSegundos?: number): Promise<string | null> {
  try {
    await prepararCanal();
    const trigger = retrasoSegundos != null && retrasoSegundos > 0
      ? { seconds: retrasoSegundos, channelId: CANAL_SOLICITUDES }
      : (Platform.OS === 'android' ? { channelId: CANAL_SOLICITUDES } : null);

    return await Notifications.scheduleNotificationAsync({
      content: {
        ...textoAviso(s),
        data: { tipo: 'solicitud', solicitudId: s.id },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
    });
  } catch {
    return null;
  }
}

export async function quitarAviso(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.dismissNotificationAsync(id);
  } catch {
    // ya no estaba
  }
}
