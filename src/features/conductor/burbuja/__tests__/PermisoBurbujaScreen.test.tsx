import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { PermisoBurbujaScreen } from '../PermisoBurbujaScreen';

const mockBurbuja = {
  disponible: true,
  tienePermiso: jest.fn(() => false),
  abrirAjustesPermiso: jest.fn(),
};
jest.mock('@modules/burbuja-flotante', () => ({
  get BurbujaFlotante() { return mockBurbuja; },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

let oyente: ((s: AppStateStatus) => void) | null = null;
jest.spyOn(AppState, 'addEventListener').mockImplementation((_t, cb) => {
  oyente = cb as (s: AppStateStatus) => void;
  return { remove: jest.fn() } as never;
});

const navigation = { goBack: jest.fn() };
const renderPantalla = () =>
  render(<PermisoBurbujaScreen navigation={navigation as never} route={{ key: 'p', name: 'PermisoBurbuja' } as never} />);

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.tienePermiso.mockReturnValue(false);
});

describe('PermisoBurbujaScreen', () => {
  it('sin permiso explica los pasos y "Activar burbuja" abre Ajustes', () => {
    renderPantalla();
    expect(screen.getByText('Vuelve a tu viaje con un toque')).toBeTruthy();
    expect(screen.getByText('En la lista, busca Run Pilot.')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Activar burbuja' }));
    expect(mockBurbuja.abrirAjustesPermiso).toHaveBeenCalled();
  });

  it('al volver de Ajustes con el permiso concedido muestra "Burbuja activada"', () => {
    renderPantalla();
    mockBurbuja.tienePermiso.mockReturnValue(true);
    act(() => { oyente?.('active'); });
    expect(screen.getByText('Burbuja activada')).toBeTruthy();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    fireEvent.press(screen.getByRole('button', { name: 'Listo' }));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('"Ahora no" vuelve sin abrir Ajustes', () => {
    renderPantalla();
    fireEvent.press(screen.getByRole('button', { name: 'Ahora no' }));
    expect(navigation.goBack).toHaveBeenCalled();
    expect(mockBurbuja.abrirAjustesPermiso).not.toHaveBeenCalled();
  });

  it('si ya tenia permiso no vibra al abrir', () => {
    mockBurbuja.tienePermiso.mockReturnValue(true);
    renderPantalla();
    expect(screen.getByText('Burbuja activada')).toBeTruthy();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
