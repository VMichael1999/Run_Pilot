import type { Solicitud, ViajeCompletado } from '../types';
import type { Cancelacion } from '@store/useConductorStore';
import { mockSolicitudes } from './mockSolicitudes';

const HORA = 3_600_000;
const DIA  = 86_400_000;
const now  = Date.now();

/** Mismo viaje de Maria con una parada extra (mismo precio: no cambia los totales). */
const conParadaExtra: Solicitud = {
  ...mockSolicitudes[1],
  id: 'sol-002-parada',
  paradas: [
    mockSolicitudes[1].paradas[0],
    {
      id: 'stop-002-extra',
      direccion: 'Av. Arequipa 2080, Lince',
      coordenadas: { latitude: -12.0835, longitude: -77.0349 },
      esOrigen: false,
    },
    mockSolicitudes[1].paradas[1],
  ],
};

export const mockHistorial: ViajeCompletado[] = [
  { id: 'hist-001', fechaMs: now - 1 * HORA,           solicitud: mockSolicitudes[0], calificacion: 5 },
  { id: 'hist-002', fechaMs: now - 4 * HORA,           solicitud: mockSolicitudes[1], calificacion: 4 },
  { id: 'hist-003', fechaMs: now - 1 * DIA - HORA,     solicitud: mockSolicitudes[2], calificacion: 5 },
  { id: 'hist-004', fechaMs: now - 1 * DIA - 5 * HORA, solicitud: mockSolicitudes[0], calificacion: 4 },
  { id: 'hist-005', fechaMs: now - 2 * DIA - 2 * HORA, solicitud: conParadaExtra,     calificacion: 5 },
  { id: 'hist-006', fechaMs: now - 2 * DIA - 7 * HORA, solicitud: mockSolicitudes[2], calificacion: 5 },
  { id: 'hist-007', fechaMs: now - 3 * DIA - HORA,     solicitud: mockSolicitudes[0], calificacion: 4 },
];

/** Cancelaciones de dias anteriores (no disparan el aviso del inicio, que dura segundos). */
export const mockCancelaciones: Cancelacion[] = [
  { solicitud: mockSolicitudes[2], motivo: 'no_se_presento', fechaMs: now - 1 * DIA - 3 * HORA },
];
