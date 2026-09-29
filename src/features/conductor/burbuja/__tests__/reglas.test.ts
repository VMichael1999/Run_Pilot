import { accionBurbuja, hayViajeEnCurso } from '../reglas';
import { mockSolicitudes } from '../../data/mockSolicitudes';

describe('burbuja · reglas', () => {
  it.each([
    // estadoApp, activo (conectado o con viaje), permiso, accion
    ['background', true, true, 'mostrar'],
    ['background', false, true, null],
    ['background', true, false, null],
    ['active', true, true, 'ocultar'],
    ['active', false, false, 'ocultar'],
    ['inactive', true, true, null],
  ] as const)('%s, activo=%s, permiso=%s → %s', (estado, viaje, permiso, accion) => {
    expect(accionBurbuja(estado, viaje, permiso)).toBe(accion);
  });

  it('hay viaje en curso desde aceptado hasta cobrar, no al finalizar', () => {
    const s = mockSolicitudes[0];
    expect(['aceptado', 'en_camino', 'esperando', 'iniciado', 'llegado'].every((e) => hayViajeEnCurso(s, e as never))).toBe(true);
    expect(hayViajeEnCurso(s, 'finalizado')).toBe(false);
    expect(hayViajeEnCurso(s, null)).toBe(false);
    expect(hayViajeEnCurso(null, 'iniciado')).toBe(false);
  });
});
