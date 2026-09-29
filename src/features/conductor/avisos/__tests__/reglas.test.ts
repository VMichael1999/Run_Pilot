import { reaccionSolicitud } from '../reglas';
import { textoAviso } from '../notificaciones';
import { mockSolicitudes } from '../../data/mockSolicitudes';

jest.mock('expo-notifications', () => ({ setNotificationHandler: jest.fn() }));

describe('avisos · que hacer al llegar una solicitud', () => {
  const base = { avisos: true, abrirAlRecibir: true, puedeAbrir: true };

  it('con la app en pantalla no hace nada extra', () => {
    expect(reaccionSolicitud({ ...base, estadoApp: 'active' })).toEqual({ notificar: false, abrir: false });
  });

  it('en otra app: notifica y abre', () => {
    expect(reaccionSolicitud({ ...base, estadoApp: 'background' })).toEqual({ notificar: true, abrir: true });
  });

  it('con "Abrir Run Pilot" apagado solo notifica', () => {
    expect(reaccionSolicitud({ ...base, abrirAlRecibir: false, estadoApp: 'background' })).toEqual({ notificar: true, abrir: false });
  });

  it('sin permiso (o en iOS) no puede abrir: solo notifica', () => {
    expect(reaccionSolicitud({ ...base, puedeAbrir: false, estadoApp: 'background' })).toEqual({ notificar: true, abrir: false });
  });

  it('con avisos apagados no notifica, pero puede abrir', () => {
    expect(reaccionSolicitud({ ...base, avisos: false, estadoApp: 'background' })).toEqual({ notificar: false, abrir: true });
  });

  it('texto del aviso: precio, pago, pasajero y minutos al recojo', () => {
    expect(textoAviso(mockSolicitudes[0])).toEqual({
      title: 'Nueva solicitud de viaje',
      body: 'S/ 18.50 · Efectivo · Carlos · recojo a 4 min',
    });
  });
});
