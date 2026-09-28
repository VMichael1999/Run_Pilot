import { distanciaRutaKm, formatDistancia, restanteEnRutaKm } from '../geo';

describe('distanciaRutaKm', () => {
  it('0 con menos de dos puntos', () => {
    expect(distanciaRutaKm([])).toBe(0);
    expect(distanciaRutaKm([{ latitude: -12, longitude: -77 }])).toBe(0);
  });

  it('un grado de latitud son ~111 km', () => {
    const km = distanciaRutaKm([{ latitude: -12, longitude: -77 }, { latitude: -13, longitude: -77 }]);
    expect(km).toBeCloseTo(111.19, 1);
  });

  it('suma los tramos', () => {
    const a = { latitude: -12.0864, longitude: -77.0011 };
    const b = { latitude: -12.0964, longitude: -77.0011 };
    const c = { latitude: -12.1064, longitude: -77.0011 };
    expect(distanciaRutaKm([a, b, c])).toBeCloseTo(distanciaRutaKm([a, c]), 5);
  });
});

describe('restanteEnRutaKm', () => {
  const ruta = [0, 1, 2, 3, 4].map((i) => ({ latitude: -12 - i * 0.01, longitude: -77 }));
  const total = distanciaRutaKm(ruta);

  it('al inicio falta todo y al final nada', () => {
    expect(restanteEnRutaKm(ruta, ruta[0])).toBeCloseTo(total, 5);
    expect(restanteEnRutaKm(ruta, ruta[4])).toBe(0);
  });

  it('a mitad de camino falta la mitad', () => {
    expect(restanteEnRutaKm(ruta, { latitude: -12.0201, longitude: -77.0001 })).toBeCloseTo(total / 2, 2);
  });

  it('ruta vacia', () => {
    expect(restanteEnRutaKm([], ruta[0])).toBe(0);
  });
});

describe('formatDistancia', () => {
  it.each([
    [0.9, '900 m'],
    [0.43, '400 m'],
    [0.97, '1.0 km'],
    [1.24, '1.2 km'],
    [6.8, '6.8 km'],
  ])('%p -> %p', (km, esperado) => expect(formatDistancia(km)).toBe(esperado));
});
