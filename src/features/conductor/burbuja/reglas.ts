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
 * - pasa a segundo plano estando conectado (o con un viaje en curso) y con permiso: mostrar
 * - cualquier otro caso: nada
 */
export function accionBurbuja(estadoApp: AppStateStatus, activo: boolean, permiso: boolean): AccionBurbuja {
  if (estadoApp === 'active') return 'ocultar';
  if (estadoApp === 'background' && activo && permiso) return 'mostrar';
  return null;
}

/** La notificacion del servicio dice en que esta el conductor. */
export function opcionesBurbuja(viajeEnCurso: boolean): OpcionesBurbuja {
  return {
    tamano: 60,
    tituloNotificacion: viajeEnCurso ? 'Viaje en curso' : 'Conectado · buscando viajes',
    textoNotificacion: 'Toca para volver a Run Pilot',
  };
}
