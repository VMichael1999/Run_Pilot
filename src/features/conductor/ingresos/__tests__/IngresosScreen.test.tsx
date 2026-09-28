import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { IngresosScreen } from '../IngresosScreen';
import { BilleteraScreen } from '../../billetera/BilleteraScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

// Hora fija a media tarde para que "hoy" no dependa de cuando corre el test
const ahora = new Date(2026, 8, 23, 15, 0).getTime();
beforeEach(() => jest.useFakeTimers({ now: ahora }));
afterEach(() => jest.useRealTimers());

const conViajesHoy = () =>
  useConductorStore.setState({
    historial: [
      { id: 'a', fechaMs: ahora - 60_000, solicitud: mockSolicitudes[0], calificacion: 0 }, // efectivo 18.50
      { id: 'b', fechaMs: ahora - 120_000, solicitud: mockSolicitudes[1], calificacion: 5 }, // Yape 12.00
    ],
  });

describe('IngresosScreen', () => {
  it('abre en Semana con grafico y KPIs', () => {
    conViajesHoy();
    render(<IngresosScreen />);
    expect(screen.getByRole('tab', { name: 'Semana' }).props.accessibilityState).toMatchObject({ selected: true });
    expect(screen.getByLabelText(/^Ganancias: /)).toBeTruthy();
    expect(screen.getByText('conectado')).toBeTruthy();
    expect(screen.getByText('San Borja → Surco')).toBeTruthy();
  });

  it('Hoy suma la ganancia neta de hoy', () => {
    conViajesHoy();
    render(<IngresosScreen />);
    fireEvent.press(screen.getByRole('tab', { name: 'Hoy' }));
    expect(screen.getByText('S/ 25.92')).toBeTruthy(); // 15.72 + 10.20
    expect(screen.getByText('Hoy · 2 viajes')).toBeTruthy();
    expect(screen.queryByLabelText(/^Ganancias: /)).toBeNull();
  });

  it('sin viajes hoy muestra que hacer', () => {
    useConductorStore.setState({ historial: [] });
    render(<IngresosScreen />);
    fireEvent.press(screen.getByRole('tab', { name: 'Hoy' }));
    expect(screen.getByText('Aún no tienes viajes hoy')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Ir al inicio' }));
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('BilleteraScreen', () => {
  it('saldo y movimientos que dicen de que viaje vienen', () => {
    conViajesHoy();
    render(<BilleteraScreen navigation={{} as never} route={{ key: 'b', name: 'Billetera' } as never} />);
    expect(screen.getByLabelText('Saldo disponible S/ 86.40')).toBeTruthy();
    expect(screen.getByText('Comisión · San Borja → Surco')).toBeTruthy();
    expect(screen.getByText('− S/ 2.78')).toBeTruthy();
    expect(screen.getByText('Pago digital · Cercado de Lima → Jesús María')).toBeTruthy();
    expect(screen.getByText('+ S/ 10.20')).toBeTruthy();
    expect(screen.getByText('Recarga con Yape')).toBeTruthy();
  });

  it('Recargar avisa que aun no esta disponible', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useConductorStore.setState({ historial: [] });
    render(<BilleteraScreen navigation={{} as never} route={{ key: 'b', name: 'Billetera' } as never} />);
    fireEvent.press(screen.getByRole('button', { name: 'Recargar' }));
    expect(alert).toHaveBeenCalledWith('Recargar', expect.stringContaining('Todavía no'));
  });
});
