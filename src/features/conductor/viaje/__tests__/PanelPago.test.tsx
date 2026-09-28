import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PanelPago } from '../components/PanelPago';
import { mockSolicitudes } from '../../data/mockSolicitudes';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

const efectivo = mockSolicitudes[0]; // S/ 18.50, Efectivo, San Borja -> Surco
const yape = mockSolicitudes[1];     // S/ 12.00, Yape

describe('PanelPago', () => {
  it('efectivo: monto primero, desglose y boton con el monto', () => {
    const onFinalizar = jest.fn();
    render(<PanelPago solicitud={efectivo} distanciaKm={6.8} onFinalizar={onFinalizar} />);
    expect(screen.getByText('Viaje finalizado')).toBeTruthy();
    expect(screen.getByText('6.8 km · San Borja → Surco')).toBeTruthy();
    expect(screen.getByText('Cobra en efectivo')).toBeTruthy();
    expect(screen.getByText('Carlos paga al bajar del auto')).toBeTruthy();
    expect(screen.getByText('− S/ 2.78')).toBeTruthy();
    expect(screen.getByText('S/ 15.72')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Cobré S/ 18.50' }));
    expect(onFinalizar).toHaveBeenCalledTimes(1);
  });

  it('efectivo: "Pagó con otro método" explica que aun no esta disponible', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<PanelPago solicitud={efectivo} onFinalizar={jest.fn()} />);
    fireEvent.press(screen.getByRole('button', { name: 'Pagó con otro método' }));
    expect(alert).toHaveBeenCalledWith('Pagó con otro método', expect.stringContaining('Todavía no'));
  });

  it('digital: no pide cobrar efectivo', () => {
    const onFinalizar = jest.fn();
    render(<PanelPago solicitud={yape} onFinalizar={onFinalizar} />);
    expect(screen.getByText('Pagado con Yape')).toBeTruthy();
    expect(screen.getByText('No tienes que cobrar nada en efectivo')).toBeTruthy();
    expect(screen.getByText('Recibirás S/ 10.20 en tu billetera.')).toBeTruthy();
    expect(screen.queryByText('Pagó con otro método')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(onFinalizar).toHaveBeenCalledTimes(1);
  });
});
