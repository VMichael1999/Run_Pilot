import { create } from 'zustand';
import type { EstadoViaje, Solicitud, ViajeCompletado } from '@features/conductor/types';

/** Motivos para cancelar un viaje antes de que suba el pasajero. */
export type MotivoCancelacion =
  | 'no_se_presento'
  | 'pasajero_pidio'
  | 'no_puedo_llegar'
  | 'problema_vehiculo'
  | 'otro';

export interface Cancelacion {
  solicitud: Solicitud;
  motivo: MotivoCancelacion;
  fechaMs: number;
}
import { mockHistorial } from '@features/conductor/data/mockHistorial';
import { mockConductor } from '@features/conductor/data/mockConductor';
import { desgloseCobro } from '@shared/utils/cobro';

interface ConductorState {
  isOnline: boolean;
  solicitudActual: Solicitud | null;
  estadoViaje: EstadoViaje | null;
  /** Hora (ms) en que se llego al punto de recojo; cuenta la espera aunque se salga de la pantalla del viaje. */
  esperandoDesde: number | null;
  /** Ganancia neta de los viajes de esta sesion (tarifa menos comision). */
  ingresosDia: number;
  /** Vehiculo con el que sale el conductor. */
  vehiculoId: string;
  setVehiculo: (id: string) => void;
  historial: ViajeCompletado[];
  setOnline: (online: boolean) => void;
  setSolicitudActual: (solicitud: Solicitud | null) => void;
  setEstadoViaje: (estado: EstadoViaje | null) => void;
  avanzarEstado: () => void;
  /** Guarda el viaje en el historial y devuelve su id (unico aunque se repita la solicitud). */
  finalizarViaje: () => string | null;
  /** Cancelaciones de la sesion; la ultima se muestra en el inicio. */
  cancelaciones: Cancelacion[];
  cancelarViaje: (motivo: MotivoCancelacion) => void;
  actualizarCalificacion: (viajeId: string, calificacion: number) => void;
}

const FLUJO_ESTADOS: EstadoViaje[] = [
  'aceptado',
  'en_camino',
  'esperando',
  'iniciado',
  'llegado',
  'finalizado',
];

export const useConductorStore = create<ConductorState>((set, get) => ({
  isOnline:       false,
  solicitudActual: null,
  estadoViaje:    null,
  esperandoDesde: null,
  ingresosDia:    0,
  vehiculoId:     mockConductor.vehiculos[0].id,
  historial:      [...mockHistorial],
  cancelaciones:  [],

  setOnline: (online) => set({ isOnline: online }),

  setVehiculo: (id) => set({ vehiculoId: id }),

  setSolicitudActual: (solicitud) =>
    set({ solicitudActual: solicitud, estadoViaje: solicitud ? 'aceptado' : null, esperandoDesde: null }),

  setEstadoViaje: (estado) => set({ estadoViaje: estado }),

  avanzarEstado: () => {
    const current = get().estadoViaje;
    if (!current) return;
    const idx = FLUJO_ESTADOS.indexOf(current);
    if (idx < FLUJO_ESTADOS.length - 1) {
      const siguiente = FLUJO_ESTADOS[idx + 1];
      set({
        estadoViaje: siguiente,
        // La espera empieza al llegar al recojo y termina al iniciar el viaje
        esperandoDesde: siguiente === 'esperando' ? Date.now() : null,
      });
    }
  },

  finalizarViaje: () => {
    const solicitud = get().solicitudActual;
    if (!solicitud) return null;
    const fechaMs = Date.now();
    const nuevoViaje: ViajeCompletado = {
      // La misma solicitud del tablero puede aceptarse mas de una vez
      id:           `${solicitud.id}-${fechaMs}`,
      fechaMs,
      solicitud,
      calificacion: 0,
    };
    set((state) => ({
      estadoViaje:  null,
      esperandoDesde: null,
      // Lo que gana el conductor, no lo que paga el pasajero
      ingresosDia:  state.ingresosDia + desgloseCobro(solicitud.precio, mockConductor.comision).ganancia,
      historial:    [nuevoViaje, ...state.historial],
      // solicitudActual se mantiene para CalificarScreen
    }));
    return nuevoViaje.id;
  },

  cancelarViaje: (motivo) => {
    const solicitud = get().solicitudActual;
    if (!solicitud) return;
    set((state) => ({
      solicitudActual: null,
      estadoViaje:     null,
      esperandoDesde:  null,
      cancelaciones:   [{ solicitud, motivo, fechaMs: Date.now() }, ...state.cancelaciones],
    }));
  },

  actualizarCalificacion: (viajeId, calificacion) =>
    set((state) => ({
      historial: state.historial.map((v) =>
        v.id === viajeId ? { ...v, calificacion } : v
      ),
    })),
}));
