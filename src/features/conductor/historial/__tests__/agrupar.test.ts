import { agruparPorDia, separarParadas } from '../agrupar';
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
  expect(grupos[0].data.map((e) => e.id)).toEqual(['hoy2', 'hoy1']);
  expect(grupos[0]).toMatchObject({ viajes: 2, cancelados: 0, ganado: 25.92 });
});

it('los cancelados van en su dia, en orden, sin sumar ganancia', () => {
  const grupos = agruparPorDia(
    [{ id: 'hoy1', fechaMs: at(27, 20), solicitud: mockSolicitudes[0], calificacion: 5 }],
    0.15,
    ahora,
    [{ solicitud: mockSolicitudes[2], motivo: 'otro', fechaMs: at(27, 21) }],
  );
  expect(grupos).toHaveLength(1);
  expect(grupos[0]).toMatchObject({ viajes: 1, cancelados: 1, ganado: 15.72 });
  expect(grupos[0].data.map((e) => e.tipo)).toEqual(['cancelado', 'completado']);
});

it('separa recogida, paradas intermedias y destino final', () => {
  const p = (id: string, esOrigen = false) => ({ id, direccion: id, coordenadas: { latitude: 0, longitude: 0 }, esOrigen });
  const r = separarParadas([p('a', true), p('b'), p('c'), p('d')]);
  expect(r.origen?.id).toBe('a');
  expect(r.intermedias.map((x) => x.id)).toEqual(['b', 'c']);
  expect(r.destino?.id).toBe('d');
  expect(separarParadas([p('a', true), p('d')]).intermedias).toEqual([]);
});
