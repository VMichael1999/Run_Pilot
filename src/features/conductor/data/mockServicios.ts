/** Servicios programados de ejemplo. Fechas relativas a hoy para que no queden viejas. */
export type EstadoServicio = 'aceptado' | 'pendiente' | 'completado';

export interface ServicioProgramado {
  id: string;
  origen: string;
  destino: string;
  /** Minutos desde el inicio de hoy. */
  enMin: number;
  estado: EstadoServicio;
  precio: number;
  metodoPago: string;
}

const DIA = 24 * 60;

export const mockServicios: ServicioProgramado[] = [
  {
    id: 'prog-1',
    origen: 'Calle Las Granadillas 180, La Molina',
    destino: 'Av. Circunvalación del Golf Los Incas 134, Surco',
    enMin: DIA + 12 * 60 + 50,
    estado: 'aceptado',
    precio: 24,
    metodoPago: 'Efectivo',
  },
  {
    id: 'prog-2',
    origen: 'Av. Javier Prado Este 4200, San Borja',
    destino: 'Aeropuerto Internacional Jorge Chávez, Callao',
    enMin: 2 * DIA + 5 * 60,
    estado: 'pendiente',
    precio: 52,
    metodoPago: 'Yape',
  },
  {
    id: 'prog-3',
    origen: 'Av. Pardo 610, Miraflores',
    destino: 'Av. Salaverry 2020, Jesús María',
    enMin: -DIA + 9 * 60 + 30,
    estado: 'completado',
    precio: 16.5,
    metodoPago: 'Efectivo',
  },
];
