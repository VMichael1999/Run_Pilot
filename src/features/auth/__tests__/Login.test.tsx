import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { LoginVerificacionScreen } from '../LoginVerificacionScreen';
import { useAuthStore } from '@store/useAuthStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), NotificationFeedbackType: { Error: 'e' } }));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isAuthenticated: false, token: null, phone: '', countryCode: '+51' });
});

describe('LoginScreen', () => {
  it('agrupa el numero y solo habilita con 9 digitos que empiezan con 9', () => {
    render(<LoginScreen />);
    const input = screen.getByLabelText('Número de celular');
    const enviar = () => screen.getByRole('button', { name: 'Enviar código' });

    fireEvent.changeText(input, '98765');
    expect(screen.getByDisplayValue('987 65')).toBeTruthy();
    expect(enviar().props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.changeText(input, '987 654 321');
    expect(screen.getByDisplayValue('987 654 321')).toBeTruthy();
    fireEvent.press(enviar());
    expect(mockNavigate).toHaveBeenCalledWith('LoginVerificacion', { phone: '987654321', countryCode: '+51' });
    expect(useAuthStore.getState().phone).toBe('987654321');
  });

  it('un numero que no empieza con 9 muestra por que', () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByLabelText('Número de celular'), '812345678');
    expect(screen.getByText('Los celulares en Perú empiezan con 9.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enviar código' }).props.accessibilityState).toMatchObject({ disabled: true });
  });
});

describe('LoginVerificacionScreen', () => {
  const navigation = { goBack: jest.fn() };
  const route = { key: 'v', name: 'LoginVerificacion', params: { phone: '987654321', countryCode: '+51' } };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('muestra el numero, escribe con el teclado propio y entra al completar 4 digitos', async () => {
    render(<LoginVerificacionScreen navigation={navigation as never} route={route as never} />);
    expect(screen.getByText('Escribe el código que enviamos al +51 987 654 321')).toBeTruthy();
    for (const d of ['4', '8', '1']) fireEvent.press(screen.getByRole('button', { name: d }));
    expect(screen.getByLabelText('Código de verificación, 3 de 4 dígitos')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Borrar' }));
    expect(screen.getByLabelText('Código de verificación, 2 de 4 dígitos')).toBeTruthy();
    for (const d of ['1', '7']) fireEvent.press(screen.getByRole('button', { name: d }));
    await act(async () => {});
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('reenviar aparece a los 30 s', async () => {
    render(<LoginVerificacionScreen navigation={navigation as never} route={route as never} />);
    expect(screen.getByLabelText('Reenviar código en 30 segundos')).toBeTruthy();
    for (let i = 0; i < 30; i++) {
      await act(async () => { jest.advanceTimersByTime(1000); });
    }
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeTruthy();
  });
});
