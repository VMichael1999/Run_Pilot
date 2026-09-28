import type { ViajeCompletado } from '../types';
import { claveDia, tituloDia } from '@shared/utils/fecha';
import { desgloseCobro } from '@shared/utils/cobro';

export interface DiaHistorial {
  titulo: string;
  viajes: number;
  ganado: number;
  data: ViajeCompletado[];
}

/** Agrupa por dia (mas reciente primero) con el total ganado neto de cada dia. */
export function agruparPorDia(historial: ViajeCompletado[], comision: number, ahora = Date.now()): DiaHistorial[] {
  const orden = [...historial].sort((a, b) => b.fechaMs - a.fechaMs);
  const grupos = new Map<number, ViajeCompletado[]>();
  for (const v of orden) {
    const k = claveDia(v.fechaMs);
    grupos.set(k, [...(grupos.get(k) ?? []), v]);
  }
  return [...grupos.values()].map((data) => ({
    titulo: tituloDia(data[0].fechaMs, ahora),
    viajes: data.length,
    ganado: Math.round(data.reduce((acc, v) => acc + desgloseCobro(v.solicitud.precio, comision).ganancia, 0) * 100) / 100,
    data,
  }));
}
