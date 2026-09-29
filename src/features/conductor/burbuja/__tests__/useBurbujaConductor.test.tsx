import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useBurbujaConductor } from '../useBurbujaConductor';
import { opcionesBurbuja } from '../reglas';

const mockBurbuja = {
  disponible: true,
  tienePermiso: jest.fn(() => true),
  mostrar: jest.fn(() => true),
  ocultar: jest.fn(),
};
jest.mock('@modules/burbuja-flotante', () => ({
  get BurbujaFlotante() { return mockBurbuja; },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

let oyente: ((s: AppStateStatus) => void) | null = null;
const remove = jest.fn();
jest.spyOn(AppState, 'addEventListener').mockImplementation((_tipo, cb) => {
  oyente = cb as (s: AppStateStatus) => void;
  return { remove } as never;
});

function Prueba() {
  useBurbujaConductor();
  return null;
}
const cambiar = (s: AppStateStatus) => act(() => { oyente?.(s); });

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.tienePermiso.mockReturnValue(true);
  useConductorStore.setState({ isOnline: false, solicitudActual: null, estadoViaje: null });
});

describe('useBurbujaConductor', () => {
  it('con viaje en curso: aparece al salir de la app y se va al volver', () => {
    useConductorStore.setState({ isOnline: true, solicitudActual: mockSolicitudes[0], estadoViaje: 'en_camino' });
    render(<Prueba />);
    cambiar('background');
    expect(mockBurbuja.mostrar).toHaveBeenCalledWith(opcionesBurbuja(true));
    expect(opcionesBurbuja(true).tituloNotificacion).toBe('Viaje en curso');
    cambiar('active');
    expect(mockBurbuja.ocultar).toHaveBeenCalled();
  });

  it('conectado sin viaje tambien aparece, avisando que busca viajes', () => {
    useConductorStore.setState({ isOnline: true });
    render(<Prueba />);
    cambiar('background');
    expect(mockBurbuja.mostrar).toHaveBeenCalledWith(opcionesBurbuja(false));
    expect(opcionesBurbuja(false).tituloNotificacion).toBe('Conectado · buscando viajes');
  });

  it('desconectado y sin viaje no aparece', () => {
    render(<Prueba />);
    cambiar('background');
    expect(mockBurbuja.mostrar).not.toHaveBeenCalled();
  });

  it('sin permiso no intenta mostrarla', () => {
    mockBurbuja.tienePermiso.mockReturnValue(false);
    useConductorStore.setState({ solicitudActual: mockSolicitudes[0], estadoViaje: 'iniciado' });
    render(<Prueba />);
    cambiar('background');
    expect(mockBurbuja.mostrar).not.toHaveBeenCalled();
  });

  it('usa el estado del viaje del momento, no el del montaje', () => {
    render(<Prueba />);
    act(() => { useConductorStore.setState({ solicitudActual: mockSolicitudes[0], estadoViaje: 'aceptado' }); });
    cambiar('background');
    expect(mockBurbuja.mostrar).toHaveBeenCalledTimes(1);
  });

  it('al desconectarse sin viaje se oculta; al desmontar (cerrar sesion) tambien', () => {
    useConductorStore.setState({ isOnline: true });
    const { unmount } = render(<Prueba />);
    mockBurbuja.ocultar.mockClear();
    act(() => { useConductorStore.setState({ isOnline: false }); });
    expect(mockBurbuja.ocultar).toHaveBeenCalledTimes(1);
    unmount();
    expect(remove).toHaveBeenCalled();
    expect(mockBurbuja.ocultar).toHaveBeenCalledTimes(2);
  });
});
