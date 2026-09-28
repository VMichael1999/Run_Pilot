import type { EstadoViaje, Solicitud } from '../types';
import { distritoDe, esEfectivo } from '@shared/utils/cobro';
import { formatSoles } from '@shared/utils/format';
import { cronometro } from '@shared/hooks/useSegundosDesde';

export interface TextoViajeEnCurso {
  /** Que hacer ahora, segun la fase. */
  accion: string;
  /** Dato de apoyo: direccion, estado del pasajero o ruta. */
  detalle: string;
}

/** Texto de la franja "Viaje en curso" segun la fase del viaje. */
export function textoViajeEnCurso(
  solicitud: Solicitud,
  estado: EstadoViaje,
  esperandoSeg: number,
): TextoViajeEnCurso | null {
  const { nombre } = solicitud.pasajero;
  const origen = solicitud.paradas.find((p) => p.esOrigen);
  const destino = solicitud.paradas.find((p) => !p.esOrigen);
  const monto = formatSoles(solicitud.precio);

  switch (estado) {
    case 'aceptado':
      return { accion: `Ve a recoger a ${nombre}`, detalle: origen?.direccion ?? '' };
    case 'en_camino':
      return {
        accion: origen?.duracionMin ? `Recoge a ${nombre} · ${origen.duracionMin} min` : `Recoge a ${nombre}`,
        detalle: origen?.direccion ?? '',
      };
    case 'esperando':
      return { accion: `Esperando a ${nombre} · ${cronometro(esperandoSeg)}`, detalle: 'Estás en el punto de recojo' };
    case 'iniciado':
      return {
        accion: destino ? `Finaliza el viaje a ${distritoDe(destino.direccion)}` : 'Finaliza el viaje',
        detalle: `${nombre} a bordo${destino ? ` · ${destino.direccion}` : ''}`,
      };
    case 'llegado':
      return {
        accion: esEfectivo(solicitud.metodoPago) ? `Cobra ${monto} en efectivo` : `Confirma el pago de ${monto} con ${solicitud.metodoPago}`,
        detalle: origen && destino ? `${nombre} · ${distritoDe(origen.direccion)} → ${distritoDe(destino.direccion)}` : nombre,
      };
    default:
      return null;
  }
}
