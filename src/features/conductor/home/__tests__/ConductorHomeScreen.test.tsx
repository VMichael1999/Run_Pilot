import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ConductorHomeScreen } from '../ConductorHomeScreen';
import { useConductorStore } from '@store/useConductorStore';

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
  useConductorStore.setState({ isOnline: false, historial: [] });
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
