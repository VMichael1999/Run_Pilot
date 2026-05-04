import type { Coordinates } from '@shared/types';

export type EstadoViaje =
  | 'aceptado'    // aceptado, conductor se mueve al origen
  | 'en_camino'   // tracking iniciado hacia el origen
  | 'esperando'   // conductor llego al origen, espera al pasajero
  | 'iniciado'    // viaje en curso hacia el destino
  | 'llegado'     // conductor llego al destino
  | 'finalizado'; // viaje finalizado, pendiente calificacion

export interface Pasajero {
  id: string;
  nombre: string;
  apellido: string;
  calificacion: number;
  totalViajes: number;
  fotoUrl?: string;
  telefono?: string;
}

export interface Parada {
  id: string;
  direccion: string;
  notas?: string;
  distanciaKm?: number;
  duracionMin?: number;
  coordenadas: Coordinates;
  esOrigen: boolean;
}

export interface ViajeCompletado {
  id: string;
  fechaMs: number;       // timestamp al finalizar
  solicitud: Solicitud;
  calificacion: number;  // 0 = sin calificar
}

export interface Solicitud {
  id: string;
  pasajero: Pasajero;
  paradas: Parada[];
  precio: number;
  moneda: string;
  simboloMoneda: string;
  metodoPago: string;
  tiempoLimiteSeg: number;
  estado: 'pendiente' | EstadoViaje;
  comentario?: string;
}
