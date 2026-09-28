import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { ViajeScreen } from '../ViajeScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import type { EstadoViaje } from '../../types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-maps', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const MapView = mockReact.forwardRef((props: object, _ref: unknown) => <View testID="map" {...props} />);
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: 'google', Marker: View, Polyline: View };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));
jest.mock('../services/directionsService', () => ({
  fetchRoute: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../components/PanelPago', () => {
  const { Text } = require('react-native');
  return { PanelPago: () => <Text>panel-pago</Text> };
});

const loc = Location as jest.Mocked<typeof Location>;
const solicitud = mockSolicitudes[0];
const navigation = { goBack: jest.fn(), replace: jest.fn() };

async function renderEn(estado: EstadoViaje) {
  useConductorStore.setState({ solicitudActual: solicitud, estadoViaje: estado });
  const r = render(
    <ViajeScreen
      navigation={navigation as never}
      route={{ key: 'v', name: 'Viaje', params: { solicitudId: solicitud.id } }}
    />,
  );
  // Deja resolver permisos de GPS y la ruta pedida al montar
  await act(async () => {});
  return r;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
});

afterEach(async () => {
  await act(async () => { jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
});

describe('ViajeScreen', () => {
  it.each([
    ['aceptado', 'Recoge a Carlos', 'Ir al punto de recojo'],
    ['en_camino', 'Recoge a Carlos', 'Llegué al punto de recojo'],
    ['esperando', 'Esperando a Carlos', 'Iniciar viaje'],
  ] as const)('%s: tarjeta "%s" y accion "%s"', async (estado, tarjeta, accion) => {
    await renderEn(estado);
    expect(screen.getByText(tarjeta)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: accion }));
    expect(useConductorStore.getState().estadoViaje).not.toBe(estado);
  });

  it('en viaje: destino, pasajero a bordo y deslizar para finalizar', async () => {
    await renderEn('iniciado');
    expect(screen.getByText('Destino')).toBeTruthy();
    expect(screen.getByText('Av. La Encalada 1388, Surco')).toBeTruthy();
    expect(screen.getByText('Carlos R. a bordo')).toBeTruthy();
    fireEvent(screen.getByLabelText('Finalizar viaje y pasar al cobro'), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    });
    expect(useConductorStore.getState().estadoViaje).toBe('llegado');
  });

  it('llegado muestra el cobro', async () => {
    await renderEn('llegado');
    expect(screen.getByText('panel-pago')).toBeTruthy();
  });

  it('llamar al pasajero abre el marcador', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderEn('en_camino');
    fireEvent.press(screen.getByRole('button', { name: 'Llamar a Carlos' }));
    expect(open).toHaveBeenCalledWith('tel:+51987654321');
  });

  describe('SOS', () => {
    it('un toque corto solo explica como usarlo', async () => {
      await renderEn('iniciado');
      await act(async () => {});
      fireEvent.press(screen.getByRole('button', { name: 'Botón de emergencia' }));
      expect(screen.getByText('Mantén presionado 1 s')).toBeTruthy();
      expect(screen.queryByText('Emergencia')).toBeNull();
    });

    it('mantener presionado abre la hoja y llama al 105', async () => {
      const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      await renderEn('iniciado');
      await act(async () => {});
      fireEvent(screen.getByRole('button', { name: 'Botón de emergencia' }), 'longPress');
      expect(screen.getByText('Emergencia')).toBeTruthy();
      fireEvent.press(screen.getByRole('button', { name: 'Llamar a la Policía · 105' }));
      expect(open).toHaveBeenCalledWith('tel:105');
    });
  });

  it('no deja el GPS activo si se sale antes de que arranque', async () => {
    const remove = jest.fn();
    let resolverWatch: (s: { remove: () => void }) => void = () => {};
    loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    loc.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -12.1, longitude: -77 } } as never);
    loc.watchPositionAsync.mockReturnValue(new Promise((r) => { resolverWatch = r; }) as never);

    const { unmount } = await renderEn('en_camino');
    unmount();
    await act(async () => { resolverWatch({ remove }); });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
