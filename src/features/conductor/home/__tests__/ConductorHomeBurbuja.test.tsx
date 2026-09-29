import React from 'react';
import { act, render } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
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

const mockBurbuja = { disponible: true, tienePermiso: jest.fn(() => false) };
jest.mock('@modules/burbuja-flotante', () => ({
  get BurbujaFlotante() { return mockBurbuja; },
}));

const store = SecureStore as jest.Mocked<typeof SecureStore>;

async function abrirInicio() {
  render(<ConductorHomeScreen />);
  // permiso de ubicacion + lectura de "ya preguntado"
  await act(async () => {});
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.disponible = true;
  mockBurbuja.tienePermiso.mockReturnValue(false);
  store.getItemAsync.mockResolvedValue(null);
  useConductorStore.setState({ isOnline: false, solicitudActual: null, estadoViaje: null });
});

describe('ConductorHomeScreen · permiso de la burbuja', () => {
  it('la primera vez ofrece la burbuja y lo recuerda', async () => {
    await abrirInicio();
    expect(mockNavigate).toHaveBeenCalledWith('PermisoBurbuja');
    expect(store.setItemAsync).toHaveBeenCalledWith('runpilot.burbuja.preguntado', '1');
  });

  it('si ya se pregunto, no insiste', async () => {
    store.getItemAsync.mockResolvedValue('1');
    await abrirInicio();
    expect(mockNavigate).not.toHaveBeenCalledWith('PermisoBurbuja');
  });

  it('con el permiso ya concedido no la ofrece', async () => {
    mockBurbuja.tienePermiso.mockReturnValue(true);
    await abrirInicio();
    expect(mockNavigate).not.toHaveBeenCalledWith('PermisoBurbuja');
  });

  it('en iOS o Expo Go (sin modulo) no la ofrece', async () => {
    mockBurbuja.disponible = false;
    await abrirInicio();
    expect(mockNavigate).not.toHaveBeenCalledWith('PermisoBurbuja');
  });
});
