import { desgloseCobro, distritoDe, esEfectivo } from '../cobro';

describe('desgloseCobro', () => {
  it('el ejemplo del diseño: S/ 18.50 al 15 %', () => {
    expect(desgloseCobro(18.5, 0.15)).toEqual({ tarifa: 18.5, comision: 2.78, ganancia: 15.72 });
  });

  it('comision + ganancia siempre suman la tarifa', () => {
    for (const t of [12, 45, 9.35, 22.5, 0.01, 199.99]) {
      const d = desgloseCobro(t, 0.15);
      expect(Math.round((d.comision + d.ganancia) * 100)).toBe(Math.round(t * 100));
    }
  });
});

describe('distritoDe', () => {
  it.each([
    ['Av. La Encalada 1388, Surco', 'Surco'],
    ['Aeropuerto Internacional Jorge Chávez, Callao', 'Callao'],
    ['Jockey Plaza', 'Jockey Plaza'],
  ])('%p -> %p', (dir, esperado) => expect(distritoDe(dir)).toBe(esperado));
});

describe('esEfectivo', () => {
  it('reconoce efectivo sin importar mayusculas', () => {
    expect(esEfectivo('Efectivo')).toBe(true);
    expect(esEfectivo(' efectivo ')).toBe(true);
    expect(esEfectivo('Yape')).toBe(false);
  });
});
