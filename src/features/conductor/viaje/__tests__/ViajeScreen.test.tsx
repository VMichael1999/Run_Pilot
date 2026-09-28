import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { ViajeScreen } from '../ViajeScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import type { EstadoViaje } from '../../types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('react-native-maps', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  const MapView = mockReact.forwardRef((props: object, _ref: unknown) => <View testID="map" {...props} />);
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: 'google', Marker: View, Polyline: View };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));
jest.mock('../services/directionsService', () => ({
  fetchRoute: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../components/PanelPago', () => {
  const { Text } = require('react-native');
  return {
    PanelPago: ({ onFinalizar }: { onFinalizar: () => void }) => (
      <Text accessibilityRole="button" onPress={onFinalizar}>panel-pago</Text>
    ),
  };
});

const loc = Location as jest.Mocked<typeof Location>;
const solicitud = mockSolicitudes[0];
const navigation = { goBack: jest.fn(), replace: jest.fn(), reset: jest.fn() };

async function renderEn(estado: EstadoViaje, esperandoDesde: number | null = null) {
  useConductorStore.setState({ solicitudActual: solicitud, estadoViaje: estado, esperandoDesde, cancelaciones: [] });
  const r = render(
    <ViajeScreen
      navigation={navigation as never}
      route={{ key: 'v', name: 'Viaje', params: { solicitudId: solicitud.id } }}
    />,
  );
  // Deja resolver permisos de GPS y la ruta pedida al montar
  await act(async () => {});
  return r;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
});

afterEach(async () => {
  await act(async () => { jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
});

describe('ViajeScreen', () => {
  const deslizar = (label: string) =>
    fireEvent(screen.getByLabelText(label), 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });

  it.each([
    ['aceptado', 'Recoge a Carlos', 'Empezar a ir al punto de recojo'],
    ['en_camino', 'Recoge a Carlos', 'Confirmar que llegaste al punto de recojo'],
    ['esperando', 'Esperando a Carlos', 'El pasajero subió, iniciar viaje'],
  ] as const)('%s: tarjeta "%s" y se avanza deslizando', async (estado, tarjeta, accion) => {
    await renderEn(estado);
    expect(screen.getByText(tarjeta)).toBeTruthy();
    deslizar(accion);
    expect(useConductorStore.getState().estadoViaje).not.toBe(estado);
  });

  it('muestra pasajero, cobro y notas del recojo', async () => {
    await renderEn('en_camino');
    expect(screen.getByText('Carlos Ramírez')).toBeTruthy();
    expect(screen.getByText('4.8 · 127 viajes')).toBeTruthy();
    expect(screen.getByLabelText('cobra en efectivo: S/ 18.50')).toBeTruthy();
    expect(screen.getByText('Frente al Banco de la Nación')).toBeTruthy();
  });

  it('esperando muestra la espera sin costo', async () => {
    await renderEn('esperando');
    expect(screen.getByLabelText('espera sin costo: 5:00')).toBeTruthy();
  });

  it('en viaje: destino, pasajero a bordo y deslizar para finalizar', async () => {
    await renderEn('iniciado');
    expect(screen.getByText('Destino')).toBeTruthy();
    expect(screen.getByText('Av. La Encalada 1388, Surco')).toBeTruthy();
    expect(screen.getByText('Carlos Ramírez · a bordo')).toBeTruthy();
    deslizar('Finalizar viaje y pasar al cobro');
    expect(useConductorStore.getState().estadoViaje).toBe('llegado');
  });

  it('llegado muestra el cobro', async () => {
    await renderEn('llegado');
    expect(screen.getByText('panel-pago')).toBeTruthy();
  });

  it('llamar al pasajero abre el marcador', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderEn('en_camino');
    fireEvent.press(screen.getByRole('button', { name: 'Llamar a Carlos' }));
    expect(open).toHaveBeenCalledWith('tel:+51987654321');
  });

  describe('SOS', () => {
    it('un toque corto solo explica como usarlo', async () => {
      await renderEn('iniciado');
      await act(async () => {});
      fireEvent.press(screen.getByRole('button', { name: 'Botón de emergencia' }));
      expect(screen.getByText('Mantén presionado 1 s')).toBeTruthy();
      expect(screen.queryByText('Emergencia')).toBeNull();
    });

    it('mantener presionado abre la hoja y llama al 105', async () => {
      const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      await renderEn('iniciado');
      await act(async () => {});
      fireEvent(screen.getByRole('button', { name: 'Botón de emergencia' }), 'longPress');
      expect(screen.getByText('Emergencia')).toBeTruthy();
      fireEvent.press(screen.getByRole('button', { name: 'Llamar a la Policía · 105' }));
      expect(open).toHaveBeenCalledWith('tel:105');
    });
  });

  it('no deja el GPS activo si se sale antes de que arranque', async () => {
    const remove = jest.fn();
    let resolverWatch: (s: { remove: () => void }) => void = () => {};
    loc.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    loc.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -12.1, longitude: -77 } } as never);
    loc.watchPositionAsync.mockReturnValue(new Promise((r) => { resolverWatch = r; }) as never);

    const { unmount } = await renderEn('en_camino');
    unmount();
    await act(async () => { resolverWatch({ remove }); });
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe('ViajeScreen · cancelar viaje', () => {
  it.each(['aceptado', 'en_camino', 'esperando'] as const)('%s: se puede cancelar', async (estado) => {
    await renderEn(estado, estado === 'esperando' ? Date.now() : null);
    expect(screen.getByRole('button', { name: 'Cancelar viaje' })).toBeTruthy();
  });

  it('con el pasajero a bordo ya no se puede cancelar', async () => {
    await renderEn('iniciado');
    expect(screen.queryByRole('button', { name: 'Cancelar viaje' })).toBeNull();
  });

  it('"no se presento" se habilita recien a los 5 min de espera', async () => {
    await renderEn('esperando', Date.now() - 4 * 60_000);
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar viaje' }));
    expect(screen.getByText('Disponible en 1:00 (espera mínima de 5 min)')).toBeTruthy();
    const noShow = () => screen.getByRole('radio', { name: /El pasajero no se presentó/ });
    expect(noShow().props.accessibilityState).toMatchObject({ disabled: true });

    await act(async () => { jest.advanceTimersByTime(60_000); });
    expect(noShow().props.accessibilityState).toMatchObject({ disabled: false });
    expect(screen.getByText('No afecta tu tasa de cancelación')).toBeTruthy();
  });

  it('confirmar cancela con el motivo y vuelve al inicio', async () => {
    await renderEn('esperando', Date.now() - 5 * 60_000);
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar viaje' }));
    fireEvent.press(screen.getByRole('radio', { name: /El pasajero no se presentó/ }));
    const confirmar = screen.getAllByRole('button', { name: 'Cancelar viaje' });
    fireEvent.press(confirmar[confirmar.length - 1]);

    const st = useConductorStore.getState();
    expect(st.estadoViaje).toBeNull();
    expect(st.cancelaciones[0]).toMatchObject({ motivo: 'no_se_presento', solicitud: { id: solicitud.id } });
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'ConductorHome' }] });
  });

  it('sin motivo no se puede confirmar y "Volver al viaje" no cancela', async () => {
    await renderEn('en_camino');
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar viaje' }));
    const confirmar = screen.getAllByRole('button', { name: 'Cancelar viaje' });
    expect(confirmar[confirmar.length - 1]).toBeDisabled();
    fireEvent.press(screen.getByRole('button', { name: 'Volver al viaje' }));
    expect(useConductorStore.getState().cancelaciones).toHaveLength(0);
    expect(navigation.reset).not.toHaveBeenCalled();
  });
});

describe('ViajeScreen · finalizar', () => {
  it('lleva a calificar el viaje recien guardado (su id, no el de la solicitud)', async () => {
    await renderEn('llegado');
    fireEvent.press(screen.getByText('panel-pago'));
    const viaje = useConductorStore.getState().historial[0];
    expect(viaje.solicitud.id).toBe(solicitud.id);
    expect(viaje.id).not.toBe(solicitud.id);
    expect(navigation.replace).toHaveBeenCalledWith('Calificar', { solicitudId: viaje.id });
  });
});
