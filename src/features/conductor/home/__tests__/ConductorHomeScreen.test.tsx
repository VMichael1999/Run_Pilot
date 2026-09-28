import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ConductorHomeScreen } from '../ConductorHomeScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-maps', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const MapView = mockReact.forwardRef((props: object, _ref: unknown) => <View testID="map" {...props} />);
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: 'google', Marker: View, Polyline: View };
});
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'denied' })),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../components/IncomingRequestOverlay', () => ({ IncomingRequestOverlay: () => null }));

beforeEach(() => {
  jest.useFakeTimers();
  mockNavigate.mockClear();
  useConductorStore.setState({ isOnline: false, historial: [], solicitudActual: null, estadoViaje: null, esperandoDesde: null, vehiculoId: 'veh-1' });
});
afterEach(() => jest.useRealTimers());

describe('ConductorHomeScreen', () => {
  it('desconectado: estado, vehiculo y accion Conectarme', async () => {
    render(<ConductorHomeScreen />);
    await act(async () => {});
    expect(screen.getByText('Desconectado')).toBeTruthy();
    expect(screen.getByText('BKL-482')).toBeTruthy();
    expect(screen.getByLabelText('Hoy llevas S/ 0.00 en 0 viajes')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Conectarme' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeTruthy();
  });

  it('conectarse cambia al panel de busqueda', async () => {
    render(<ConductorHomeScreen />);
    await act(async () => {});
    fireEvent.press(screen.getByRole('button', { name: 'Conectarme' }));
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(screen.getByText('Conectado')).toBeTruthy();
    expect(screen.getByText('Buscando viajes cerca de ti')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Desconectarme' })).toBeTruthy();
  });

  it('acceso directo al tablero de solicitudes', async () => {
    render(<ConductorHomeScreen />);
    await act(async () => {});
    fireEvent.press(screen.getByRole('button', { name: /^Tablero de solicitudes, \d+ disponibles$/ }));
    expect(mockNavigate).toHaveBeenCalledWith('Solicitudes');
  });

  it('el vehiculo lleva a cambiar vehiculo', async () => {
    render(<ConductorHomeScreen />);
    await act(async () => {});
    fireEvent.press(screen.getByLabelText(/Cambiar vehículo/));
    expect(mockNavigate).toHaveBeenCalledWith('SeleccionarVehiculo');
  });
});

describe('ConductorHomeScreen · datos coherentes', () => {
  it('"Hoy" suma la ganancia neta y el vehiculo es el elegido', async () => {
    useConductorStore.setState({
      vehiculoId: 'veh-2',
      historial: [{ id: 'x', fechaMs: Date.now() - 60_000, solicitud: mockSolicitudes[0], calificacion: 0 }],
    });
    render(<ConductorHomeScreen />);
    await act(async () => {});
    expect(screen.getByLabelText('Hoy llevas S/ 15.72 en 1 viaje')).toBeTruthy();
    expect(screen.getByText('CMT-394')).toBeTruthy();
  });
});

describe('ConductorHomeScreen · viaje en curso', () => {
  it('con un viaje activo el panel muestra la franja y lleva de vuelta al viaje', async () => {
    useConductorStore.setState({ isOnline: true, solicitudActual: mockSolicitudes[0], estadoViaje: 'en_camino' });
    render(<ConductorHomeScreen />);
    await act(async () => {});
    expect(screen.getByText('Viaje en curso')).toBeTruthy();
    expect(screen.getByText('Recoge a Carlos · 4 min')).toBeTruthy();
    expect(screen.getByText('Tienes un viaje en curso')).toBeTruthy();
    expect(screen.queryByText('Buscando viajes cerca de ti')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Desconectarme' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: /^Viaje en curso\./ }));
    expect(mockNavigate).toHaveBeenCalledWith('Viaje', { solicitudId: 'sol-001' });
  });

  it('la franja cambia con la fase y el contador de espera sigue corriendo', async () => {
    useConductorStore.setState({
      isOnline: true,
      solicitudActual: mockSolicitudes[0],
      estadoViaje: 'esperando',
      esperandoDesde: Date.now() - 65_000,
    });
    render(<ConductorHomeScreen />);
    await act(async () => {});
    expect(screen.getByText('Esperando a Carlos · 1:05')).toBeTruthy();
    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(screen.getByText('Esperando a Carlos · 1:07')).toBeTruthy();

    await act(async () => { useConductorStore.setState({ estadoViaje: 'iniciado', esperandoDesde: null }); });
    expect(screen.getByText('Finaliza el viaje a Surco')).toBeTruthy();
  });

  it('al terminar el viaje la franja desaparece y vuelve "Buscando viajes"', async () => {
    useConductorStore.setState({ isOnline: true, solicitudActual: mockSolicitudes[0], estadoViaje: 'llegado' });
    render(<ConductorHomeScreen />);
    await act(async () => {});
    expect(screen.getByText('Cobra S/ 18.50 en efectivo')).toBeTruthy();
    await act(async () => { useConductorStore.setState({ estadoViaje: null }); });
    expect(screen.queryByText('Viaje en curso')).toBeNull();
    expect(screen.getByText('Buscando viajes cerca de ti')).toBeTruthy();
  });
});
