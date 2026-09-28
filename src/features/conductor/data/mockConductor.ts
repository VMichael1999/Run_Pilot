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
  /** Vehiculos registrados; el primero es el activo al iniciar. El elegido vive en el store. */
  vehiculos: [
    { id: 'veh-1', placa: 'BKL-482', marca: 'Toyota', modelo: 'Yaris', color: 'gris', anio: 2021 },
    { id: 'veh-2', placa: 'CMT-394', marca: 'Kia', modelo: 'Rio', color: 'blanco', anio: 2020 },
    { id: 'veh-3', placa: 'BSR-688', marca: 'Hyundai', modelo: 'Accent', color: 'azul', anio: 2023 },
  ],
  /** Indicadores de experiencia. */
  aceptacion: 95,
  cancelacion: 2.0,
  /** Comision de Run Pilot sobre la tarifa (aun no viene del backend). */
  comision: 0.15,
  /** Sugerencia de demanda mientras espera viajes. */
  demanda: { distrito: 'Miraflores', minutos: 6 },
} as const;
