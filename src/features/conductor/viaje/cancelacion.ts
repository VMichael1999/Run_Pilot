import type { EstadoViaje } from '../types';
import type { MotivoCancelacion } from '@store/useConductorStore';
import { cronometro } from '@shared/hooks/useSegundosDesde';

/** Espera minima en el punto de recojo antes de poder marcar "no se presento". */
export const ESPERA_MINIMA_SEG = 5 * 60;

/** Se puede cancelar mientras el pasajero no haya subido. */
export const puedeCancelar = (estado: EstadoViaje | null) =>
  estado === 'aceptado' || estado === 'en_camino' || estado === 'esperando';

export interface OpcionCancelacion {
  motivo: MotivoCancelacion;
  titulo: string;
  detalle?: string;
  disponible: boolean;
}

export const TEXTO_MOTIVO: Record<MotivoCancelacion, string> = {
  no_se_presento: 'El pasajero no se presentó',
  pasajero_pidio: 'El pasajero pidió cancelar',
  no_puedo_llegar: 'No puedo llegar al punto de recojo',
  problema_vehiculo: 'Problema con el vehículo',
  otro: 'Otro motivo',
};

/** Motivos de cancelacion segun la fase y cuanto lleva esperando. */
export function opcionesCancelacion(estado: EstadoViaje, esperandoSeg: number): OpcionCancelacion[] {
  const faltan = Math.max(0, ESPERA_MINIMA_SEG - esperandoSeg);
  const noShowListo = estado === 'esperando' && faltan === 0;
  const noShowDetalle =
    estado !== 'esperando'
      ? 'Disponible cuando llegues y esperes 5 min'
      : faltan > 0
        ? `Disponible en ${cronometro(faltan)} (espera mínima de 5 min)`
        : 'No afecta tu tasa de cancelación';

  return [
    { motivo: 'no_se_presento', titulo: TEXTO_MOTIVO.no_se_presento, detalle: noShowDetalle, disponible: noShowListo },
    { motivo: 'pasajero_pidio', titulo: TEXTO_MOTIVO.pasajero_pidio, disponible: true },
    { motivo: 'no_puedo_llegar', titulo: TEXTO_MOTIVO.no_puedo_llegar, detalle: 'Tráfico, calle cerrada o dirección inaccesible', disponible: true },
    { motivo: 'problema_vehiculo', titulo: TEXTO_MOTIVO.problema_vehiculo, disponible: true },
    { motivo: 'otro', titulo: TEXTO_MOTIVO.otro, disponible: true },
  ];
}

/** El no-show con espera cumplida no cuenta en contra; el resto si. */
export const afectaTasa = (motivo: MotivoCancelacion) => motivo !== 'no_se_presento' && motivo !== 'pasajero_pidio';
