import { formatSoles, haceTiempo, pluralViajes } from '../format';

describe('formatSoles', () => {
  it.each([
    [0, 'S/ 0.00'],
    [18.5, 'S/ 18.50'],
    [1284.4, 'S/ 1,284.40'],
    [1234567.891, 'S/ 1,234,567.89'],
    [-2.78, '− S/ 2.78'],
  ])('%p -> %p', (monto, esperado) => {
    expect(formatSoles(monto)).toBe(esperado);
  });
});

describe('pluralViajes', () => {
  it('singular y plural', () => {
    expect(pluralViajes(1)).toBe('1 viaje');
    expect(pluralViajes(0)).toBe('0 viajes');
    expect(pluralViajes(1208)).toBe('1,208 viajes');
  });
});

describe('haceTiempo', () => {
  const ahora = 10 * 3_600_000;
  it('menos de un minuto', () => expect(haceTiempo(ahora - 30_000, ahora)).toBe('hace un momento'));
  it('minutos', () => expect(haceTiempo(ahora - 3 * 60_000, ahora)).toBe('hace 3 min'));
  it('horas', () => expect(haceTiempo(ahora - 125 * 60_000, ahora)).toBe('hace 2 h'));
});
