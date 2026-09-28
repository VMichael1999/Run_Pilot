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

/** Metodos para recargar saldo (ejemplo; aun no hay pasarela de pago). */
export const metodosRecarga = [
  { id: 'yape', corto: 'con Yape', nombre: 'Yape', detalle: 'Al instante desde tu app de Yape', icono: 'phone-portrait-outline' },
  { id: 'plin', corto: 'con Plin', nombre: 'Plin', detalle: 'Al instante desde tu banco', icono: 'phone-portrait-outline' },
  { id: 'tarjeta', corto: 'con tarjeta', nombre: 'Tarjeta de débito o crédito', detalle: 'Visa o Mastercard', icono: 'card-outline' },
  { id: 'agente', corto: 'en agente', nombre: 'Agente o depósito', detalle: 'Pagas en un agente con un código; se acredita en unas horas', icono: 'storefront-outline' },
] as const;

/** Destinos para retirar saldo (ejemplo). */
export const destinosRetiro = [
  { id: 'cuenta', corto: 'a tu cuenta bancaria', nombre: 'Cuenta bancaria ···4471', detalle: 'Llega en 1 día hábil', icono: 'business-outline' },
  { id: 'yape', corto: 'a Yape', nombre: 'Yape · 987 654 321', detalle: 'Al instante', icono: 'phone-portrait-outline' },
  { id: 'plin', corto: 'a Plin', nombre: 'Plin · 987 654 321', detalle: 'Al instante', icono: 'phone-portrait-outline' },
  { id: 'agente', corto: 'en efectivo en agente', nombre: 'Efectivo en agente', detalle: 'Retiras con un código en agentes BCP o Kasnet; válido 24 h', icono: 'storefront-outline' },
] as const;

export const MONTO_MIN = 10;
export const MONTO_MAX_RECARGA = 500;
