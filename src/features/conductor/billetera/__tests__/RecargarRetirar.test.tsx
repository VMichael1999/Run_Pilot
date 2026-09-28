import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RecargarScreen } from '../RecargarScreen';
import { RetirarScreen } from '../RetirarScreen';
import { limpiarMonto } from '@shared/components/ui';

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), NotificationFeedbackType: { Success: 's' } }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

const nav = () => ({ goBack: jest.fn() });

describe('limpiarMonto', () => {
  it.each([
    ['50', '50'],
    ['50,5', '50.5'],
    ['12.345', '12.34'],
    ['S/ 20', '20'],
    ['1.2.3', '1.23'],
  ])('%p -> %p', (entrada, salida) => expect(limpiarMonto(entrada)).toBe(salida));
});

describe('RecargarScreen', () => {
  it('monto rapido + metodo habilita el boton que repite ambos; confirmar muestra el resultado', () => {
    const navigation = nav();
    render(<RecargarScreen navigation={navigation as never} route={{} as never} />);
    const boton = () => screen.getByRole('button', { name: /^Recargar/ });
    expect(boton().props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(screen.getByRole('tab', { name: 'S/ 50' }));
    expect(screen.getByDisplayValue('50')).toBeTruthy();
    fireEvent.press(screen.getByRole('radio', { name: /^Yape/ }));

    fireEvent.press(screen.getByRole('button', { name: 'Recargar S/ 50.00 con Yape' }));
    expect(screen.getByText('Recarga en proceso')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Volver a la billetera' }));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('valida minimo y maximo', () => {
    render(<RecargarScreen navigation={nav() as never} route={{} as never} />);
    const campo = screen.getByLabelText('Monto en soles');
    fireEvent.changeText(campo, '5');
    expect(screen.getByText('El monto mínimo es S/ 10.00.')).toBeTruthy();
    fireEvent.changeText(campo, '900');
    expect(screen.getByText('El monto máximo por recarga es S/ 500.00.')).toBeTruthy();
  });
});

describe('RetirarScreen', () => {
  it('no deja retirar mas que el saldo; "Todo" usa el saldo completo; agente da un codigo', () => {
    render(<RetirarScreen navigation={nav() as never} route={{} as never} />);
    fireEvent.changeText(screen.getByLabelText('Monto en soles'), '100');
    expect(screen.getByText('No puedes retirar más que tu saldo disponible.')).toBeTruthy();

    fireEvent.press(screen.getByRole('tab', { name: 'Todo' }));
    expect(screen.getByDisplayValue('86.40')).toBeTruthy();
    fireEvent.press(screen.getByRole('radio', { name: /^Efectivo en agente/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Retirar S/ 86.40 en efectivo en agente' }));
    expect(screen.getByText('Código de retiro listo')).toBeTruthy();
  });
});
