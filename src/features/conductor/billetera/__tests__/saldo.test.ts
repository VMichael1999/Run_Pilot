import { saldoBilletera } from '../saldo';
import { mockHistorial } from '../../data/mockHistorial';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { mockBilletera } from '../../data/mockIngresos';

const viaje = (id: string, i: number) => ({ id, fechaMs: Date.now(), solicitud: mockSolicitudes[i], calificacion: 0 });

describe('saldoBilletera', () => {
  it('al abrir la app es el saldo de ejemplo (los viajes de ejemplo ya estan contados)', () => {
    expect(saldoBilletera(mockHistorial, 0.15)).toBe(mockBilletera.saldo);
  });

  it('un viaje en efectivo resta la comision; uno digital suma la ganancia', () => {
    const base = mockBilletera.saldo;
    // efectivo S/ 18.50 -> comision 2.78
    expect(saldoBilletera([...mockHistorial, viaje('nuevo-1', 0)], 0.15)).toBe(Math.round((base - 2.78) * 100) / 100);
    // Yape S/ 12.00 -> ganancia 10.20
    expect(saldoBilletera([...mockHistorial, viaje('nuevo-2', 1)], 0.15)).toBe(Math.round((base + 10.2) * 100) / 100);
  });
});
