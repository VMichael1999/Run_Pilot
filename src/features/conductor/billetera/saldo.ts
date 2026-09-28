import { useMemo } from 'react';
import type { ViajeCompletado } from '../types';
import { useConductorStore } from '@store/useConductorStore';
import { mockBilletera } from '../data/mockIngresos';
import { mockHistorial } from '../data/mockHistorial';
import { mockConductor } from '../data/mockConductor';
import { desgloseCobro, esEfectivo } from '@shared/utils/cobro';

const DE_EJEMPLO = new Set(mockHistorial.map((v) => v.id));

/**
 * Saldo de la billetera: el de ejemplo al abrir la app, mas lo que mueve cada
 * viaje hecho en esta sesion. Un viaje digital suma la ganancia; uno en
 * efectivo resta la comision (el efectivo lo cobra el conductor en mano).
 */
export function saldoBilletera(historial: ViajeCompletado[], comision = mockConductor.comision): number {
  const cent = historial
    .filter((v) => !DE_EJEMPLO.has(v.id))
    .reduce((acc, v) => {
      const d = desgloseCobro(v.solicitud.precio, comision);
      return acc + Math.round((esEfectivo(v.solicitud.metodoPago) ? -d.comision : d.ganancia) * 100);
    }, Math.round(mockBilletera.saldo * 100));
  return cent / 100;
}

export function useSaldoBilletera(): number {
  const historial = useConductorStore((s) => s.historial);
  return useMemo(() => saldoBilletera(historial), [historial]);
}
