/**
 * Datos de ejemplo del conductor y su vehiculo activo. Aun no hay backend ni
 * store para esto; la UI los lee de aqui hasta que existan.
 */
export const mockConductor = {
  nombre: 'Luis',
  apellido: 'Quispe',
  calificacion: 4.92,
  totalViajes: 1208,
  /** Zona donde empezara a recibir viajes. */
  zona: 'San Isidro',
  vehiculo: {
    placa: 'BKL-482',
    marca: 'Toyota',
    modelo: 'Yaris',
    color: 'gris',
    anio: 2021,
  },
  /** Comision de Run Pilot sobre la tarifa (aun no viene del backend). */
  comision: 0.15,
  /** Sugerencia de demanda mientras espera viajes. */
  demanda: { distrito: 'Miraflores', minutos: 6 },
} as const;
