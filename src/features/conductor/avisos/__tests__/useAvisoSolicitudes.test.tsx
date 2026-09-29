import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { act, render } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import type { Solicitud } from '../../types';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { usePreferenciasStore } from '@store/usePreferenciasStore';
import { useAvisoSolicitudes } from '../useAvisoSolicitudes';

let alTocarAviso: ((r: unknown) => void) | null = null;
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('aviso-1')),
  dismissNotificationAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn((cb) => {
    alTocarAviso = cb;
    return { remove: jest.fn() };
  }),
  AndroidImportance: { MAX: 5 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
  AndroidNotificationPriority: { MAX: 'max' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
const mockBurbuja = { disponible: true, tienePermiso: jest.fn(() => true), abrirApp: jest.fn(() => true) };
jest.mock('@modules/burbuja-flotante', () => ({
  get BurbujaFlotante() { return mockBurbuja; },
}));

const notif = Notifications as jest.Mocked<typeof Notifications>;
let alCambiarApp: ((s: AppStateStatus) => void) | null = null;
jest.spyOn(AppState, 'addEventListener').mockImplementation((_t, cb) => {
  alCambiarApp = cb as (s: AppStateStatus) => void;
  return { remove: jest.fn() } as never;
});
const estadoApp = (s: AppStateStatus) => Object.defineProperty(AppState, 'currentState', { value: s, configurable: true });

const mostrar = jest.fn();
function Prueba({ solicitud }: { solicitud: Solicitud | null }) {
  useAvisoSolicitudes(solicitud, mostrar);
  return null;
}
const s = mockSolicitudes[0];

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.tienePermiso.mockReturnValue(true);
  usePreferenciasStore.setState({ avisosSolicitudes: true, abrirAlRecibir: true });
  estadoApp('background');
});

describe('useAvisoSolicitudes', () => {
  it('en otra app: notificacion y la app se abre sola', async () => {
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    expect(notif.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.objectContaining({ title: 'Nueva solicitud de viaje', data: { tipo: 'solicitud', solicitudId: s.id } }) }),
    );
    expect(mockBurbuja.abrirApp).toHaveBeenCalled();
  });

  it('con "Abrir Run Pilot" apagado solo llega la notificacion', async () => {
    usePreferenciasStore.setState({ abrirAlRecibir: false });
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    expect(notif.scheduleNotificationAsync).toHaveBeenCalled();
    expect(mockBurbuja.abrirApp).not.toHaveBeenCalled();
  });

  it('sin permiso de superposicion no intenta abrir', async () => {
    mockBurbuja.tienePermiso.mockReturnValue(false);
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    expect(mockBurbuja.abrirApp).not.toHaveBeenCalled();
  });

  it('con la app en pantalla no notifica ni abre', async () => {
    estadoApp('active');
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    expect(notif.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(mockBurbuja.abrirApp).not.toHaveBeenCalled();
  });

  it('al resolverse la solicitud se quita su notificacion', async () => {
    const { rerender } = render(<Prueba solicitud={s} />);
    await act(async () => {});
    rerender(<Prueba solicitud={null} />);
    await act(async () => {});
    expect(notif.dismissNotificationAsync).toHaveBeenCalledWith('aviso-1');
  });

  it('tocar la notificacion lleva a la solicitud', async () => {
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    act(() => { alTocarAviso?.({ notification: { request: { content: { data: { tipo: 'solicitud' } } } } }); });
    expect(mostrar).toHaveBeenCalled();
  });

  it('volver a la app con la solicitud pendiente la muestra y quita el aviso', async () => {
    render(<Prueba solicitud={s} />);
    await act(async () => {});
    act(() => { alCambiarApp?.('active'); });
    expect(mostrar).toHaveBeenCalled();
    expect(notif.dismissNotificationAsync).toHaveBeenCalledWith('aviso-1');
  });

  it('volver a la app sin solicitud pendiente no hace nada', async () => {
    render(<Prueba solicitud={null} />);
    act(() => { alCambiarApp?.('active'); });
    expect(mostrar).not.toHaveBeenCalled();
  });
});
