import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useBurbujaViaje } from '../useBurbujaViaje';
import { OPCIONES_BURBUJA } from '../reglas';

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
  useBurbujaViaje();
  return null;
}
const cambiar = (s: AppStateStatus) => act(() => { oyente?.(s); });

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.tienePermiso.mockReturnValue(true);
  useConductorStore.setState({ solicitudActual: null, estadoViaje: null });
});

describe('useBurbujaViaje', () => {
  it('con viaje en curso: aparece al salir de la app y se va al volver', () => {
    useConductorStore.setState({ solicitudActual: mockSolicitudes[0], estadoViaje: 'en_camino' });
    render(<Prueba />);
    cambiar('background');
    expect(mockBurbuja.mostrar).toHaveBeenCalledWith(OPCIONES_BURBUJA);
    cambiar('active');
    expect(mockBurbuja.ocultar).toHaveBeenCalled();
  });

  it('sin viaje en curso no aparece', () => {
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

  it('si el viaje termina, se oculta; al desmontar (cerrar sesion) tambien', () => {
    useConductorStore.setState({ solicitudActual: mockSolicitudes[0], estadoViaje: 'llegado' });
    const { unmount } = render(<Prueba />);
    mockBurbuja.ocultar.mockClear();
    act(() => { useConductorStore.setState({ estadoViaje: null }); });
    expect(mockBurbuja.ocultar).toHaveBeenCalledTimes(1);
    unmount();
    expect(remove).toHaveBeenCalled();
    expect(mockBurbuja.ocultar).toHaveBeenCalledTimes(2);
  });
});
