import { useConductorStore } from '@store/useConductorStore';
import { mockConductor } from '../data/mockConductor';

export type Vehiculo = (typeof mockConductor.vehiculos)[number];

/** Vehiculo elegido por el conductor (o el primero si el id ya no existe). */
export function useVehiculoActivo(): Vehiculo {
  const id = useConductorStore((s) => s.vehiculoId);
  return mockConductor.vehiculos.find((v) => v.id === id) ?? mockConductor.vehiculos[0];
}
