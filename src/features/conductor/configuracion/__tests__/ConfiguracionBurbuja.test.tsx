import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ConfiguracionScreen } from '../ConfiguracionScreen';
import { usePreferenciasStore } from '@store/usePreferenciasStore';

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
  usePreferenciasStore.setState({ avisosSolicitudes: true, abrirAlRecibir: true });
});

describe('ConfiguracionScreen · burbuja', () => {
  it('muestra el estado y lleva a la pantalla del permiso', () => {
    mockBurbuja.tienePermiso.mockReturnValue(false);
    renderConfig();
    expect(screen.getByText('Desactivada: falta el permiso para mostrarse sobre otras apps')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Burbuja de acceso directo, desactivada' }));
    expect(navigation.navigate).toHaveBeenCalledWith('PermisoBurbuja');
  });

  it('con permiso aparece activada', () => {
    mockBurbuja.tienePermiso.mockReturnValue(true);
    renderConfig();
    expect(screen.getByRole('button', { name: 'Burbuja de acceso directo, activada' })).toBeTruthy();
  });

  it('sin el modulo (iOS, Expo Go) la opcion no existe', () => {
    mockBurbuja.disponible = false;
    renderConfig();
    expect(screen.queryByText('Burbuja de acceso directo')).toBeNull();
  });
});

describe('ConfiguracionScreen · abrir al recibir un viaje', () => {
  it('con permiso: el switch se puede apagar y el texto lo explica', () => {
    mockBurbuja.tienePermiso.mockReturnValue(true);
    renderConfig();
    expect(screen.getByText('Si estás en otra app, Run Pilot se abre solo con la solicitud.')).toBeTruthy();
    fireEvent(screen.getByLabelText('Abrir Run Pilot al recibir un viaje'), 'valueChange', false);
    expect(usePreferenciasStore.getState().abrirAlRecibir).toBe(false);
    expect(screen.getByText('Si estás en otra app, solo te llega la notificación.')).toBeTruthy();
  });

  it('sin permiso: switch apagado y la fila lleva a concederlo', () => {
    mockBurbuja.tienePermiso.mockReturnValue(false);
    renderConfig();
    expect(screen.getByLabelText('Abrir Run Pilot al recibir un viaje').props.value).toBe(false);
    fireEvent.press(screen.getByRole('button', { name: 'Abrir Run Pilot al recibir un viaje: falta el permiso. Toca para activarlo' }));
    expect(navigation.navigate).toHaveBeenCalledWith('PermisoBurbuja');
  });

  it('el switch de nuevas solicitudes se guarda', () => {
    renderConfig();
    fireEvent(screen.getByLabelText('Avisos de nuevas solicitudes'), 'valueChange', false);
    expect(usePreferenciasStore.getState().avisosSolicitudes).toBe(false);
  });

  it('sin el modulo (iOS, Expo Go) no existe la opcion de abrir', () => {
    mockBurbuja.disponible = false;
    renderConfig();
    expect(screen.queryByText('Abrir Run Pilot al recibir un viaje')).toBeNull();
    expect(screen.getByText('Nuevas solicitudes')).toBeTruthy();
  });
});
