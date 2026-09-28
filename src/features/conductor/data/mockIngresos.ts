/**
 * Datos de ejemplo de ingresos y billetera hasta que exista backend. El dia de
 * hoy nunca sale de aqui: se calcula con el historial real del store.
 */
export const mockIngresos = {
  /** Ganancia por dia (lunes a domingo) de los dias anteriores de la semana. */
  gananciaPorDia: [182.3, 205.1, 164.0, 221.5, 268.4, 100.6, 142.5],
  viajesPorDia: [6, 7, 5, 7, 8, 3, 5],
  /** Horas conectado en la semana (sin contar hoy). */
  horasSemana: 29,
  horasHoy: 3,
  /** Mes: ganancia por semana, de la primera a la actual (la actual se reemplaza). */
  gananciaPorSemanaMes: [1040.2, 1188.5, 1399.7],
  viajesMes: 124,
  horasMes: 104,
};

export const mockBilletera = {
  saldo: 86.4,
  cuenta: '4471',
  /** Movimientos que no vienen de viajes. */
  otros: [
    { id: 'recarga-1', concepto: 'Recarga con Yape', monto: 50, haceMs: 86_400_000 + 3_600_000 * 2 },
    {
      id: 'retiro-1',
      concepto: 'Retiro a cuenta ···4471',
      monto: -300,
      haceMs: 3 * 86_400_000,
      detalle: 'llega en 1 día hábil',
    },
  ],
};
