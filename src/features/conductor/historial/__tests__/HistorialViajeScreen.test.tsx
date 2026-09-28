import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { HistorialViajeScreen } from '../HistorialViajeScreen';
import { HistorialDetalleScreen } from '../HistorialDetalleScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('react-native-maps', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const MapView = mockReact.forwardRef((props: object, _ref: unknown) => <View testID="map" {...props} />);
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: 'google', Marker: View, Polyline: View };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('@features/conductor/viaje/services/directionsService', () => ({
  fetchRoute: jest.fn(() => new Promise(() => {})),
}));

const ahora = new Date(2026, 8, 27, 23, 0).getTime();
beforeEach(() => jest.useFakeTimers({ now: ahora }));
afterEach(() => jest.useRealTimers());

const navigation = { navigate: jest.fn(), goBack: jest.fn() };

function conHistorial() {
  useConductorStore.setState({
    estadoViaje: null,
    historial: [
      { id: 'v1', fechaMs: new Date(2026, 8, 27, 22, 44).getTime(), solicitud: mockSolicitudes[0], calificacion: 0 },
      { id: 'v2', fechaMs: new Date(2026, 8, 27, 21, 58).getTime(), solicitud: mockSolicitudes[1], calificacion: 5 },
      { id: 'v3', fechaMs: new Date(2026, 8, 26, 20, 5).getTime(), solicitud: mockSolicitudes[2], calificacion: 4 },
    ],
  });
}

describe('HistorialViajeScreen', () => {
  beforeEach(() => navigation.navigate.mockClear());

  it('agrupa por dia con total ganado y marca lo pendiente de calificar', () => {
    conHistorial();
    render(<HistorialViajeScreen navigation={navigation as never} route={{} as never} />);
    expect(screen.getByText('Hoy · 2 viajes')).toBeTruthy();
    expect(screen.getByText('S/ 25.92 ganados')).toBeTruthy();
    expect(screen.getByText('Ayer · 1 viaje')).toBeTruthy();
    expect(screen.getByText('22:44')).toBeTruthy();
    expect(screen.getByText('San Borja → Surco')).toBeTruthy();
    expect(screen.getByText('Sin calificar')).toBeTruthy();
    expect(screen.getByText('Le diste 5')).toBeTruthy();
  });

  it('Calificar lleva a calificar ese viaje; tocar la fila abre el detalle', () => {
    conHistorial();
    render(<HistorialViajeScreen navigation={navigation as never} route={{} as never} />);
    fireEvent.press(screen.getByRole('button', { name: 'Calificar a Carlos' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Calificar', { solicitudId: 'v1' });
    fireEvent.press(screen.getByRole('button', { name: /^21:58, Cercado de Lima/ }));
    expect(navigation.navigate).toHaveBeenCalledWith('HistorialDetalle', { viajeId: 'v2' });
  });

  it('vacio', () => {
    useConductorStore.setState({ historial: [] });
    render(<HistorialViajeScreen navigation={navigation as never} route={{} as never} />);
    expect(screen.getByText('Todavía no tienes viajes')).toBeTruthy();
  });
});

describe('HistorialDetalleScreen', () => {
  it('muestra paradas, pasajero y desglose', () => {
    conHistorial();
    render(<HistorialDetalleScreen navigation={navigation as never} route={{ params: { viajeId: 'v1' } } as never} />);
    expect(screen.getByText('Hoy 22:44')).toBeTruthy();
    expect(screen.getByText('Av. La Encalada 1388, Surco')).toBeTruthy();
    expect(screen.getByText('Carlos Ramírez')).toBeTruthy();
    expect(screen.getByText('− S/ 2.78')).toBeTruthy();
    expect(screen.getByText('S/ 15.72')).toBeTruthy();
    expect(screen.getByText(/Referencia TRP-/)).toBeTruthy();
  });

  it('viaje inexistente', () => {
    conHistorial();
    render(<HistorialDetalleScreen navigation={navigation as never} route={{ params: { viajeId: 'nope' } } as never} />);
    expect(screen.getByText('No encontramos este viaje')).toBeTruthy();
  });
});
