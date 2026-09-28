import { periodoHoy, periodoMes, periodoSemana, viajesConGanancia } from '../resumen';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import type { ViajeCompletado } from '../../types';

// Miercoles 23 de septiembre de 2026, 23:00
const ahora = new Date(2026, 8, 23, 23, 0).getTime();
const HORA = 3_600_000;

const historial: ViajeCompletado[] = [
  { id: 'a', fechaMs: ahora - 1 * HORA, solicitud: mockSolicitudes[0], calificacion: 0 },  // hoy, efectivo 18.50
  { id: 'b', fechaMs: ahora - 2 * HORA, solicitud: mockSolicitudes[1], calificacion: 5 },  // hoy, Yape 12.00
  { id: 'c', fechaMs: ahora - 30 * HORA, solicitud: mockSolicitudes[2], calificacion: 5 }, // ayer
];

const viajes = viajesConGanancia(historial, 0.15);

describe('viajesConGanancia', () => {
  it('ordena del mas reciente y calcula la ganancia neta', () => {
    expect(viajes.map((v) => v.id)).toEqual(['a', 'b', 'c']);
    expect(viajes[0]).toMatchObject({ ruta: 'San Borja → Surco', ganancia: 15.72, comision: 2.78, efectivo: true });
    expect(viajes[1]).toMatchObject({ ruta: 'Cercado de Lima → Jesús María', efectivo: false });
  });
});

describe('periodos', () => {
  it('hoy solo cuenta viajes de hoy', () => {
    const hoy = periodoHoy(viajes, ahora);
    expect(hoy.viajes).toBe(2);
    expect(hoy.total).toBe(25.92); // 15.72 + 10.20
  });

  it('semana: dias previos de ejemplo, hoy real, resto en 0', () => {
    const s = periodoSemana(viajes, ahora); // miercoles = indice 2
    expect(s.barras.map((b) => b.etiqueta)).toEqual(['L', 'M', 'Hoy', 'J', 'V', 'S', 'D']);
    expect(s.barras[2]).toMatchObject({ valor: 25.92, esActual: true });
    expect(s.barras.slice(3).every((b) => b.futuro && b.valor === 0)).toBe(true);
    expect(s.total).toBe(413.32); // 182.30 + 205.10 + 25.92
    expect(s.viajes).toBe(6 + 7 + 2);
  });

  it('mes suma las semanas previas y la actual', () => {
    const m = periodoMes(viajes, ahora);
    expect(m.barras).toHaveLength(4);
    expect(m.barras[3]).toMatchObject({ etiqueta: 'Esta', valor: 413.32 });
    expect(m.total).toBe(Math.round((1040.2 + 1188.5 + 1399.7 + 413.32) * 100) / 100);
  });
});
