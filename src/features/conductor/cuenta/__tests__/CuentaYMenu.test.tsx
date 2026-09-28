import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { CuentaScreen } from '../CuentaScreen';
import { ConfiguracionScreen } from '../../configuracion/ConfiguracionScreen';
import { SeleccionarVehiculoScreen } from '../../vehiculo/SeleccionarVehiculoScreen';
import { ExperienciaScreen } from '../../experiencia/ExperienciaScreen';
import { DrawerMenu } from '../../home/DrawerMenu';
import { useAuthStore } from '@store/useAuthStore';
import { useConductorStore } from '@store/useConductorStore';
import { useThemeStore } from '@store/useThemeStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({ notificationAsync: jest.fn(), NotificationFeedbackType: { Success: 's' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => jest.clearAllMocks());

describe('CuentaScreen', () => {
  it('perfil con telefono formateado y vehiculo activo', () => {
    useAuthStore.setState({ phone: '987654321', countryCode: '+51' });
    render(<CuentaScreen />);
    expect(screen.getByText('Luis Quispe')).toBeTruthy();
    expect(screen.getByText('+51 987 654 321')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/Cambiar vehículo$/));
    expect(mockNavigate).toHaveBeenCalledWith('SeleccionarVehiculo');
  });

  it('cerrar sesion pide confirmacion', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useAuthStore.setState({ isAuthenticated: true });
    render(<CuentaScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(alert).toHaveBeenCalledWith('¿Cerrar sesión?', expect.any(String), expect.any(Array));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    const botones = alert.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    act(() => botones.find((b) => b.text === 'Cerrar sesión')?.onPress?.());
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('ConfiguracionScreen', () => {
  it('Automatico / Claro / Oscuro cambian la preferencia', () => {
    useThemeStore.setState({ preference: 'system' });
    render(<ConfiguracionScreen navigation={{ goBack: jest.fn() } as never} route={{} as never} />);
    expect(screen.getByText('Sigue el modo claro u oscuro de tu teléfono.')).toBeTruthy();
    fireEvent.press(screen.getByRole('tab', { name: 'Oscuro' }));
    expect(useThemeStore.getState().preference).toBe('dark');
    fireEvent.press(screen.getByRole('tab', { name: 'Automático' }));
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('el catalogo de componentes no aparece como opcion', () => {
    render(<ConfiguracionScreen navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never} route={{} as never} />);
    expect(screen.queryByText(/Catálogo/)).toBeNull();
  });
});

describe('SeleccionarVehiculoScreen', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('elegir un vehiculo lo deja activo y vuelve, sin conectarse', async () => {
    const goBack = jest.fn();
    useConductorStore.setState({ isOnline: false, vehiculoId: 'veh-1' });
    render(<SeleccionarVehiculoScreen navigation={{ goBack } as never} route={{} as never} />);
    expect(screen.getByText(/Luego conéctate desde el inicio/)).toBeTruthy();
    expect(screen.queryByText(/Al elegirlo te conectas/)).toBeNull();
    fireEvent.press(screen.getByLabelText(/^Kia Rio/));
    await act(async () => { jest.advanceTimersByTime(400); });
    expect(useConductorStore.getState().vehiculoId).toBe('veh-2');
    expect(useConductorStore.getState().isOnline).toBe(false);
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('Cuenta muestra el vehiculo elegido', () => {
    jest.useRealTimers();
    useConductorStore.setState({ vehiculoId: 'veh-3' });
    render(<CuentaScreen />);
    expect(screen.getByText('Hyundai Accent')).toBeTruthy();
    expect(screen.getByText('BSR-688')).toBeTruthy();
  });
});

describe('ExperienciaScreen', () => {
  it('calificacion, indicadores y ultimas calificaciones', () => {
    render(<ExperienciaScreen />);
    expect(screen.getByLabelText('Tu calificación es 4.92 de 5')).toBeTruthy();
    expect(screen.getByText('95 %')).toBeTruthy();
    expect(screen.getByText('Luis G.')).toBeTruthy();
    expect(screen.getByText('hace 1 día')).toBeTruthy();
  });
});

describe('DrawerMenu', () => {
  const perfil = {
    nombre: 'Luis', apellido: 'Quispe', calificacion: 4.92, viajes: '1,208 viajes',
    placa: 'BKL-482', vehiculo: 'Toyota Yaris', vehiculoDetalle: 'gris · 2021',
  };

  it('oculto no renderiza; visible muestra perfil, opciones y cierra con el fondo', () => {
    const onClose = jest.fn();
    const onItem = jest.fn();
    const items = [
      { label: 'Billetera', icono: 'wallet-outline' as const, badge: 'S/ 86.40', onPress: onItem },
      { label: 'Cerrar sesión', icono: 'log-out-outline' as const, salida: true, onPress: jest.fn() },
    ];
    const { rerender } = render(<DrawerMenu visible={false} onClose={onClose} items={items} perfil={perfil} onPerfil={jest.fn()} />);
    expect(screen.queryByText('Run Pilot')).toBeNull();
    rerender(<DrawerMenu visible onClose={onClose} items={items} perfil={perfil} onPerfil={jest.fn()} />);
    expect(screen.getByText('Luis Quispe')).toBeTruthy();
    expect(screen.getByText('BKL-482')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Billetera, S/ 86.40' }));
    expect(onItem).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
