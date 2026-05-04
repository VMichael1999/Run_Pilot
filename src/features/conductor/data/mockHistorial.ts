import type { ViajeCompletado } from '../types';
import { mockSolicitudes } from './mockSolicitudes';

const HORA = 3_600_000;
const DIA  = 86_400_000;
const now  = Date.now();

export const mockHistorial: ViajeCompletado[] = [
  { id: 'hist-001', fechaMs: now - 1 * HORA,           solicitud: mockSolicitudes[0], calificacion: 5 },
  { id: 'hist-002', fechaMs: now - 4 * HORA,           solicitud: mockSolicitudes[1], calificacion: 4 },
  { id: 'hist-003', fechaMs: now - 1 * DIA - HORA,     solicitud: mockSolicitudes[2], calificacion: 5 },
  { id: 'hist-004', fechaMs: now - 1 * DIA - 5 * HORA, solicitud: mockSolicitudes[0], calificacion: 4 },
  { id: 'hist-005', fechaMs: now - 2 * DIA - 2 * HORA, solicitud: mockSolicitudes[1], calificacion: 5 },
  { id: 'hist-006', fechaMs: now - 2 * DIA - 7 * HORA, solicitud: mockSolicitudes[2], calificacion: 5 },
  { id: 'hist-007', fechaMs: now - 3 * DIA - HORA,     solicitud: mockSolicitudes[0], calificacion: 4 },
];
