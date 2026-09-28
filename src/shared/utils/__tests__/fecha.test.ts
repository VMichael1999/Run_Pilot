import { fechaCorta, indiceLunes, nombreMes, rangoSemana, tituloDia } from '../fecha';

// Domingo 27 de septiembre de 2026, 23:05 (hora local)
const ahora = new Date(2026, 8, 27, 23, 5).getTime();

describe('fechaCorta', () => {
  it('hoy, ayer y fechas anteriores', () => {
    expect(fechaCorta(new Date(2026, 8, 27, 22, 44).getTime(), ahora)).toBe('Hoy 22:44');
    expect(fechaCorta(new Date(2026, 8, 26, 8, 10).getTime(), ahora)).toBe('Ayer 08:10');
    expect(fechaCorta(new Date(2026, 8, 25, 9, 0).getTime(), ahora)).toBe('vie 25 sep');
  });
});

describe('semana', () => {
  it('el domingo es el ultimo dia (indice 6) y el lunes el primero', () => {
    expect(indiceLunes(ahora)).toBe(6);
    expect(indiceLunes(new Date(2026, 8, 21).getTime())).toBe(0);
  });

  it('rango dentro del mismo mes y cruzando meses', () => {
    expect(rangoSemana(ahora)).toBe('Semana del 21 al 27 de septiembre');
    expect(rangoSemana(new Date(2026, 9, 1).getTime())).toBe('Semana del 28 de septiembre al 4 de octubre');
  });
});

it('nombreMes', () => {
  expect(nombreMes(ahora)).toBe('Septiembre');
});

it('tituloDia', () => {
  expect(tituloDia(new Date(2026, 8, 27, 1, 0).getTime(), ahora)).toBe('Hoy');
  expect(tituloDia(new Date(2026, 8, 26, 23, 59).getTime(), ahora)).toBe('Ayer');
  expect(tituloDia(new Date(2026, 8, 25, 12, 0).getTime(), ahora)).toBe('Viernes 25 de septiembre');
});
