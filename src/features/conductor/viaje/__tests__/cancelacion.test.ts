import { afectaTasa, opcionesCancelacion, puedeCancelar } from '../cancelacion';

describe('cancelacion', () => {
  it('solo se cancela antes de que suba el pasajero', () => {
    expect(['aceptado', 'en_camino', 'esperando'].every((e) => puedeCancelar(e as never))).toBe(true);
    expect(['iniciado', 'llegado', 'finalizado', null].some((e) => puedeCancelar(e as never))).toBe(false);
  });

  it('"no se presento" exige estar esperando 5 min', () => {
    const noShow = (estado: 'en_camino' | 'esperando', seg: number) =>
      opcionesCancelacion(estado, seg).find((o) => o.motivo === 'no_se_presento')!;
    expect(noShow('en_camino', 999)).toMatchObject({ disponible: false, detalle: 'Disponible cuando llegues y esperes 5 min' });
    expect(noShow('esperando', 299)).toMatchObject({ disponible: false, detalle: 'Disponible en 0:01 (espera mínima de 5 min)' });
    expect(noShow('esperando', 300).disponible).toBe(true);
  });

  it('los demas motivos estan siempre disponibles', () => {
    const resto = opcionesCancelacion('aceptado', 0).filter((o) => o.motivo !== 'no_se_presento');
    expect(resto).toHaveLength(4);
    expect(resto.every((o) => o.disponible)).toBe(true);
  });

  it('solo cuentan en la tasa los motivos atribuibles al conductor', () => {
    expect(afectaTasa('no_se_presento')).toBe(false);
    expect(afectaTasa('pasajero_pidio')).toBe(false);
    expect(afectaTasa('no_puedo_llegar')).toBe(true);
    expect(afectaTasa('problema_vehiculo')).toBe(true);
    expect(afectaTasa('otro')).toBe(true);
  });
});
