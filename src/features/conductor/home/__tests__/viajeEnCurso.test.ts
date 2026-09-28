import { textoViajeEnCurso } from '../viajeEnCurso';
import { mockSolicitudes } from '../../data/mockSolicitudes';

const efectivo = mockSolicitudes[0]; // Carlos, San Borja -> Surco, S/ 18.50, efectivo, recojo 4 min
const yape = mockSolicitudes[1];

describe('textoViajeEnCurso', () => {
  it.each([
    ['aceptado', 'Ve a recoger a Carlos', 'Av. Javier Prado Este 2465, San Borja'],
    ['en_camino', 'Recoge a Carlos · 4 min', 'Av. Javier Prado Este 2465, San Borja'],
    ['iniciado', 'Finaliza el viaje a Surco', 'Carlos a bordo · Av. La Encalada 1388, Surco'],
    ['llegado', 'Cobra S/ 18.50 en efectivo', 'Carlos · San Borja → Surco'],
  ] as const)('%s', (estado, accion, detalle) => {
    expect(textoViajeEnCurso(efectivo, estado, 0)).toEqual({ accion, detalle });
  });

  it('esperando muestra cuanto lleva esperando', () => {
    expect(textoViajeEnCurso(efectivo, 'esperando', 135)?.accion).toBe('Esperando a Carlos · 2:15');
  });

  it('pago digital pide confirmar, no cobrar en efectivo', () => {
    expect(textoViajeEnCurso(yape, 'llegado', 0)?.accion).toBe('Confirma el pago de S/ 12.00 con Yape');
  });

  it('finalizado no muestra franja', () => {
    expect(textoViajeEnCurso(efectivo, 'finalizado', 0)).toBeNull();
  });
});
