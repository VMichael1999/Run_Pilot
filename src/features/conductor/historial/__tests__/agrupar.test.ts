import { agruparPorDia } from '../agrupar';
import { mockSolicitudes } from '../../data/mockSolicitudes';

const ahora = new Date(2026, 8, 27, 23, 0).getTime();
const at = (d: number, h: number) => new Date(2026, 8, d, h, 0).getTime();

it('agrupa por dia, ordena y suma la ganancia neta', () => {
  const grupos = agruparPorDia(
    [
      { id: 'viejo', fechaMs: at(25, 9), solicitud: mockSolicitudes[2], calificacion: 5 },
      { id: 'hoy1', fechaMs: at(27, 20), solicitud: mockSolicitudes[0], calificacion: 0 },
      { id: 'hoy2', fechaMs: at(27, 22), solicitud: mockSolicitudes[1], calificacion: 4 },
    ],
    0.15,
    ahora,
  );
  expect(grupos.map((g) => g.titulo)).toEqual(['Hoy', 'Viernes 25 de septiembre']);
  expect(grupos[0].data.map((v) => v.id)).toEqual(['hoy2', 'hoy1']);
  expect(grupos[0]).toMatchObject({ viajes: 2, ganado: 25.92 });
});
