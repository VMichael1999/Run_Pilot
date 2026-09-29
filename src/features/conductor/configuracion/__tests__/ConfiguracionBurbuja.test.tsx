import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ConfiguracionScreen } from '../ConfiguracionScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ goBack: jest.fn() }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockBurbuja = { disponible: true, tienePermiso: jest.fn(() => false) };
jest.mock('@modules/burbuja-flotante', () => ({
  get BurbujaFlotante() { return mockBurbuja; },
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn() };
const renderConfig = () => render(<ConfiguracionScreen navigation={navigation as never} route={{} as never} />);

beforeEach(() => {
  jest.clearAllMocks();
  mockBurbuja.disponible = true;
});

describe('ConfiguracionScreen · burbuja', () => {
  it('muestra el estado y lleva a la pantalla del permiso', () => {
    mockBurbuja.tienePermiso.mockReturnValue(false);
    renderConfig();
    expect(screen.getByText('Desactivada: falta el permiso para mostrarse sobre otras apps')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Burbuja para volver al viaje, desactivada' }));
    expect(navigation.navigate).toHaveBeenCalledWith('PermisoBurbuja');
  });

  it('con permiso aparece activada', () => {
    mockBurbuja.tienePermiso.mockReturnValue(true);
    renderConfig();
    expect(screen.getByRole('button', { name: 'Burbuja para volver al viaje, activada' })).toBeTruthy();
  });

  it('sin el modulo (iOS, Expo Go) la opcion no existe', () => {
    mockBurbuja.disponible = false;
    renderConfig();
    expect(screen.queryByText('Burbuja para volver al viaje')).toBeNull();
  });
});
