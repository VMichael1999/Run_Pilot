import { distanciaRutaKm } from '../geo';

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
