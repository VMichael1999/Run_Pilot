import type { Parada, ViajeCompletado } from '../types';
import type { Cancelacion } from '@store/useConductorStore';
import { claveDia, tituloDia } from '@shared/utils/fecha';
import { desgloseCobro } from '@shared/utils/cobro';

/** Una tarjeta del historial: viaje terminado o cancelado. */
export type EntradaHistorial =
  | { tipo: 'completado'; id: string; fechaMs: number; viaje: ViajeCompletado }
  | { tipo: 'cancelado'; id: string; fechaMs: number; cancelacion: Cancelacion };

export interface DiaHistorial {
  titulo: string;
  /** Solo viajes terminados. */
  viajes: number;
  cancelados: number;
  ganado: number;
  data: EntradaHistorial[];
}

/**
 * Agrupa por dia (mas reciente primero) con el total ganado neto de cada dia.
 * Los cancelados aparecen en su dia pero no suman ganancia ni cuentan como viaje.
 */
export function agruparPorDia(
  historial: ViajeCompletado[],
  comision: number,
  ahora = Date.now(),
  cancelaciones: Cancelacion[] = [],
): DiaHistorial[] {
  const entradas: EntradaHistorial[] = [
    ...historial.map((viaje) => ({ tipo: 'completado' as const, id: viaje.id, fechaMs: viaje.fechaMs, viaje })),
    ...cancelaciones.map((cancelacion) => ({
      tipo: 'cancelado' as const,
      id: `cancelado-${cancelacion.solicitud.id}-${cancelacion.fechaMs}`,
      fechaMs: cancelacion.fechaMs,
      cancelacion,
    })),
  ].sort((a, b) => b.fechaMs - a.fechaMs);

  const grupos = new Map<number, EntradaHistorial[]>();
  for (const e of entradas) {
    const k = claveDia(e.fechaMs);
    grupos.set(k, [...(grupos.get(k) ?? []), e]);
  }
  return [...grupos.values()].map((data) => {
    const completados = data.flatMap((e) => (e.tipo === 'completado' ? [e.viaje] : []));
    return {
      titulo: tituloDia(data[0].fechaMs, ahora),
      viajes: completados.length,
      cancelados: data.length - completados.length,
      ganado: Math.round(completados.reduce((acc, v) => acc + desgloseCobro(v.solicitud.precio, comision).ganancia, 0) * 100) / 100,
      data,
    };
  });
}

/** Recojo, paradas intermedias en orden y destino final de un viaje. */
export function separarParadas(paradas: Parada[]) {
  const origen = paradas.find((p) => p.esOrigen);
  const resto = paradas.filter((p) => !p.esOrigen);
  return { origen, intermedias: resto.slice(0, -1), destino: resto[resto.length - 1] };
}
