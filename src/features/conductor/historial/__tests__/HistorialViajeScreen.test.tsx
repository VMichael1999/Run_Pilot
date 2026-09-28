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

const conParada = {
  ...mockSolicitudes[1],
  paradas: [
    mockSolicitudes[1].paradas[0],
    { id: 'x', direccion: 'Av. Arequipa 2080, Lince', coordenadas: { latitude: 0, longitude: 0 }, esOrigen: false },
    mockSolicitudes[1].paradas[1],
  ],
};

function conHistorial() {
  useConductorStore.setState({
    estadoViaje: null,
    historial: [
      { id: 'v1', fechaMs: new Date(2026, 8, 27, 22, 44).getTime(), solicitud: mockSolicitudes[0], calificacion: 0 },
      { id: 'v2', fechaMs: new Date(2026, 8, 27, 21, 58).getTime(), solicitud: conParada, calificacion: 5 },
      { id: 'v3', fechaMs: new Date(2026, 8, 26, 20, 5).getTime(), solicitud: mockSolicitudes[2], calificacion: 4 },
    ],
    cancelaciones: [
      { solicitud: mockSolicitudes[2], motivo: 'no_se_presento', fechaMs: new Date(2026, 8, 27, 20, 10).getTime() },
    ],
  });
}

const renderLista = () => render(<HistorialViajeScreen navigation={navigation as never} route={{} as never} />);

describe('HistorialViajeScreen', () => {
  beforeEach(() => navigation.navigate.mockClear());

  it('agrupa por dia con total ganado; los cancelados se cuentan aparte y no suman', () => {
    conHistorial();
    renderLista();
    expect(screen.getByText('Hoy · 2 viajes · 1 cancelado')).toBeTruthy();
    expect(screen.getByText('S/ 25.92 ganados')).toBeTruthy();
    expect(screen.getByText('Ayer · 1 viaje')).toBeTruthy();
  });

  it('tarjeta: pasajero, pago, ruta con etiquetas, ganancia neta, cobrado y estado', () => {
    conHistorial();
    renderLista();
    expect(screen.getByText('22:44')).toBeTruthy();
    expect(screen.getByText('Carlos Ramírez')).toBeTruthy();
    expect(screen.getByText('Sin calificar')).toBeTruthy();
    expect(screen.getByText('Le diste 5')).toBeTruthy();
    expect(screen.getByText('Av. Javier Prado Este 2465, San Borja')).toBeTruthy();
    expect(screen.getByText('S/ 15.72')).toBeTruthy();
    expect(screen.getByText('cobrado S/ 18.50')).toBeTruthy();
    expect(screen.getAllByText('Completado')).toHaveLength(3);
    // Parada extra entre recogida y destino
    expect(screen.getByText('Parada extra')).toBeTruthy();
    expect(screen.getByLabelText('Parada extra: Av. Arequipa 2080, Lince')).toBeTruthy();
  });

  it('un viaje cancelado muestra el motivo, sin ganancia y sin menu', () => {
    conHistorial();
    renderLista();
    expect(screen.getByText('Cancelado')).toBeTruthy();
    expect(screen.getByText('El pasajero no se presentó')).toBeTruthy();
    expect(screen.getByText('Sin ganancia')).toBeTruthy();
    // Luis tiene un viaje completado (con menu) y uno cancelado (sin menu)
    expect(screen.getAllByRole('button', { name: 'Más opciones del viaje con Luis' })).toHaveLength(1);
  });

  it('tocar la tarjeta abre el detalle', () => {
    conHistorial();
    renderLista();
    fireEvent.press(screen.getByRole('button', { name: /^21:58, María Torres/ }));
    expect(navigation.navigate).toHaveBeenCalledWith('HistorialDetalle', { viajeId: 'v2' });
  });

  it('el menu permite ver detalle y calificar al pasajero pendiente', () => {
    conHistorial();
    renderLista();
    fireEvent.press(screen.getByRole('button', { name: 'Más opciones del viaje con Carlos' }));
    fireEvent.press(screen.getByRole('button', { name: 'Calificar a Carlos' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Calificar', { solicitudId: 'v1' });

    fireEvent.press(screen.getByRole('button', { name: 'Más opciones del viaje con María' }));
    expect(screen.getByRole('button', { name: 'Cambiar calificación' })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Ver detalle' }));
    expect(navigation.navigate).toHaveBeenCalledWith('HistorialDetalle', { viajeId: 'v2' });
  });

  it('vacio', () => {
    useConductorStore.setState({ historial: [], cancelaciones: [] });
    renderLista();
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

describe('HistorialDetalleScreen · parada extra', () => {
  it('lista recogida, parada extra y el destino real', () => {
    conHistorial();
    render(<HistorialDetalleScreen navigation={navigation as never} route={{ params: { viajeId: 'v2' } } as never} />);
    expect(screen.getByLabelText('Parada extra: Av. Arequipa 2080, Lince')).toBeTruthy();
    expect(screen.getByLabelText('Destino: Av. Brasil 2000, Jesús María')).toBeTruthy();
  });
});
