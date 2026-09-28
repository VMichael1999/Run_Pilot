import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SolicitudesScreen } from '../SolicitudesScreen';
import { SolicitudDetalleScreen } from '../../solicitud-detalle/SolicitudDetalleScreen';
import { ServiciosProgramadosScreen } from '../../servicios-programados/ServiciosProgramadosScreen';
import { useConductorStore } from '@store/useConductorStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
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
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 's', Warning: 'w', Error: 'e' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('@features/conductor/viaje/services/directionsService', () => ({
  fetchRoute: jest.fn(() => new Promise(() => {})),
}));

beforeEach(() => jest.clearAllMocks());

describe('SolicitudesScreen', () => {
  it('lista resumida; tocar una tarjeta abre el detalle (no acepta directo)', () => {
    render(<SolicitudesScreen />);
    expect(screen.getByText('3 solicitudes cerca de ti')).toBeTruthy();
    expect(screen.getByText('S/ 18.50')).toBeTruthy();
    expect(screen.getByText('Tengo maleta grande')).toBeTruthy();
    expect(screen.queryByText(/ACEPTAR/i)).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: /^S\/ 18\.50/ }));
    expect(mockNavigate).toHaveBeenCalledWith('SolicitudDetalle', { solicitudId: 'sol-001' });
  });
});

describe('SolicitudDetalleScreen', () => {
  const navigation = { replace: jest.fn(), goBack: jest.fn(), canGoBack: () => true };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('aceptar inicia el viaje; volver regresa al tablero', async () => {
    render(<SolicitudDetalleScreen navigation={navigation as never} route={{ params: { solicitudId: 'sol-002' } } as never} />);
    await act(async () => {});
    fireEvent(screen.getByLabelText('Aceptar viaje por S/ 12.00'), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    });
    expect(useConductorStore.getState().solicitudActual?.id).toBe('sol-002');
    expect(navigation.replace).toHaveBeenCalledWith('Viaje', { solicitudId: 'sol-002' });

    fireEvent.press(screen.getByRole('button', { name: 'Volver al tablero' }));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

describe('ServiciosProgramadosScreen', () => {
  it('agrupa proximos por dia y deja los completados al final', () => {
    render(<ServiciosProgramadosScreen navigation={{ goBack: jest.fn() } as never} route={{} as never} />);
    expect(screen.getByText('Mañana')).toBeTruthy();
    expect(screen.getByText('Confirmado')).toBeTruthy();
    expect(screen.getByText('Por confirmar')).toBeTruthy();
    expect(screen.getByText('Completados')).toBeTruthy();
    expect(screen.getByText('12:50')).toBeTruthy();
  });
});
