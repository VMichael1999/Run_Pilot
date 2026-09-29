import type { AppStateStatus } from 'react-native';
import type { EstadoViaje, Solicitud } from '../types';
import type { OpcionesBurbuja } from '@modules/burbuja-flotante';

/** Hay viaje en curso desde que se acepta hasta que se finaliza o cancela (incluye cobrar). */
export const hayViajeEnCurso = (solicitud: Solicitud | null, estado: EstadoViaje | null) =>
  solicitud != null && estado != null && estado !== 'finalizado';

export type AccionBurbuja = 'mostrar' | 'ocultar' | null;

/**
 * Que hacer con la burbuja cuando la app cambia de estado:
 * - vuelve al frente: ocultar (siempre)
 * - pasa a segundo plano con un viaje en curso y permiso: mostrar
 * - cualquier otro caso: nada
 */
export function accionBurbuja(estadoApp: AppStateStatus, viajeEnCurso: boolean, permiso: boolean): AccionBurbuja {
  if (estadoApp === 'active') return 'ocultar';
  if (estadoApp === 'background' && viajeEnCurso && permiso) return 'mostrar';
  return null;
}

export const OPCIONES_BURBUJA: OpcionesBurbuja = {
  tamano: 60,
  tituloNotificacion: 'Viaje en curso',
  textoNotificacion: 'Toca para volver a Run Pilot',
};
