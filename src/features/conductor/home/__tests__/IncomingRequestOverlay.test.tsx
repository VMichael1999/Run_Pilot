import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { IncomingRequestOverlay } from '../components/IncomingRequestOverlay';
import { mockSolicitudes } from '../../data/mockSolicitudes';

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
jest.mock('@features/conductor/viaje/services/directionsService', () => ({
  fetchRoute: jest.fn(() => Promise.resolve([])),
}));

const solicitud = mockSolicitudes[0]; // Carlos Ramírez, S/ 18.50, efectivo, 30 s

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

function renderOverlay() {
  const onAceptar = jest.fn();
  const onRechazar = jest.fn();
  render(<IncomingRequestOverlay solicitud={solicitud} onAceptar={onAceptar} onRechazar={onRechazar} />);
  return { onAceptar, onRechazar };
}

describe('IncomingRequestOverlay', () => {
  it('muestra precio, recojo, paradas, pasajero y pago', async () => {
    renderOverlay();
    await act(async () => {});
    expect(screen.getByLabelText('Tarifa S/ 18.50')).toBeTruthy();
    expect(screen.getByText(/Recojo a 4 min/)).toBeTruthy();
    expect(screen.getByText('Av. Javier Prado Este 2465, San Borja')).toBeTruthy();
    expect(screen.getByText('Frente al Banco de la Nación')).toBeTruthy();
    expect(screen.getByText('Carlos R.')).toBeTruthy();
    expect(screen.getByText('Efectivo')).toBeTruthy();
    expect(screen.getByLabelText('Quedan 30 segundos para aceptar')).toBeTruthy();
  });

  it('rechazar es un toque', async () => {
    const { onRechazar, onAceptar } = renderOverlay();
    await act(async () => {});
    fireEvent.press(screen.getByRole('button', { name: 'Rechazar viaje' }));
    expect(onRechazar).toHaveBeenCalledTimes(1);
    expect(onAceptar).not.toHaveBeenCalled();
  });

  it('aceptar funciona con lector de pantalla (accion activate)', async () => {
    const { onAceptar } = renderOverlay();
    await act(async () => {});
    fireEvent(screen.getByLabelText('Aceptar viaje por S/ 18.50'), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    });
    expect(onAceptar).toHaveBeenCalledTimes(1);
  });

  it('al llegar a 0 se descarta sola', async () => {
    const { onRechazar } = renderOverlay();
    await act(async () => { jest.advanceTimersByTime(29_000); });
    expect(screen.getByLabelText('Quedan 1 segundos para aceptar')).toBeTruthy();
    expect(onRechazar).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1_000); });
    expect(onRechazar).toHaveBeenCalledTimes(1);
  });
});
