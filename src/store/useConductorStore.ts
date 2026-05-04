import { create } from 'zustand';
import type { EstadoViaje, Solicitud, ViajeCompletado } from '@features/conductor/types';
import { mockHistorial } from '@features/conductor/data/mockHistorial';

interface ConductorState {
  isOnline: boolean;
  solicitudActual: Solicitud | null;
  estadoViaje: EstadoViaje | null;
  ingresosDia: number;
  historial: ViajeCompletado[];
  setOnline: (online: boolean) => void;
  setSolicitudActual: (solicitud: Solicitud | null) => void;
  setEstadoViaje: (estado: EstadoViaje | null) => void;
  avanzarEstado: () => void;
  finalizarViaje: () => void;
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
  ingresosDia:    0,
  historial:      [...mockHistorial],

  setOnline: (online) => set({ isOnline: online }),

  setSolicitudActual: (solicitud) =>
    set({ solicitudActual: solicitud, estadoViaje: solicitud ? 'aceptado' : null }),

  setEstadoViaje: (estado) => set({ estadoViaje: estado }),

  avanzarEstado: () => {
    const current = get().estadoViaje;
    if (!current) return;
    const idx = FLUJO_ESTADOS.indexOf(current);
    if (idx < FLUJO_ESTADOS.length - 1) {
      set({ estadoViaje: FLUJO_ESTADOS[idx + 1] });
    }
  },

  finalizarViaje: () => {
    const solicitud = get().solicitudActual;
    if (!solicitud) return;
    const nuevoViaje: ViajeCompletado = {
      id:           solicitud.id,
      fechaMs:      Date.now(),
      solicitud,
      calificacion: 0,
    };
    set((state) => ({
      estadoViaje:  null,
      ingresosDia:  state.ingresosDia + solicitud.precio,
      historial:    [nuevoViaje, ...state.historial],
      // solicitudActual se mantiene para CalificarScreen
    }));
  },

  actualizarCalificacion: (viajeId, calificacion) =>
    set((state) => ({
      historial: state.historial.map((v) =>
        v.id === viajeId ? { ...v, calificacion } : v
      ),
    })),
}));
