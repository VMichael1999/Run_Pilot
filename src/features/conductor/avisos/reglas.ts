import type { AppStateStatus } from 'react-native';

export interface ReaccionSolicitud {
  /** Notificacion con sonido. */
  notificar: boolean;
  /** Traer la app al frente (solo Android con permiso). */
  abrir: boolean;
}

/**
 * Que hacer cuando llega una solicitud:
 * - con la app en pantalla: nada extra (el conductor ya ve la solicitud)
 * - en segundo plano: notificar si tiene los avisos activados, y abrir la app si
 *   eligio "Abrir Run Pilot al recibir un viaje" y el telefono lo permite
 */
export function reaccionSolicitud(p: {
  estadoApp: AppStateStatus;
  avisos: boolean;
  abrirAlRecibir: boolean;
  puedeAbrir: boolean;
}): ReaccionSolicitud {
  if (p.estadoApp === 'active') return { notificar: false, abrir: false };
  return { notificar: p.avisos, abrir: p.abrirAlRecibir && p.puedeAbrir };
}
