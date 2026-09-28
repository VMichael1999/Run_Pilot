import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { CalificarScreen } from '../CalificarScreen';
import { useConductorStore } from '@store/useConductorStore';
import { mockSolicitudes } from '../../data/mockSolicitudes';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

const solicitud = mockSolicitudes[0];
// Como lo guarda finalizarViaje: id del viaje distinto al de la solicitud
const viajeId = `${solicitud.id}-1790600000000`;
const navigation = { reset: jest.fn(), goBack: jest.fn(), canGoBack: jest.fn(() => true) };

function renderScreen(conSolicitudActual = true) {
  useConductorStore.setState({
    estadoViaje: null,
    solicitudActual: conSolicitudActual ? solicitud : null,
    historial: [{ id: viajeId, fechaMs: Date.now(), solicitud, calificacion: 0 }],
  });
  render(
    <CalificarScreen
      navigation={navigation as never}
      route={{ key: 'c', name: 'Calificar', params: { solicitudId: viajeId } }}
    />,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  navigation.canGoBack.mockReturnValue(true);
});
afterEach(() => jest.useRealTimers());

describe('CalificarScreen', () => {
  it('sin pila de navegacion vuelve al inicio', () => {
    navigation.canGoBack.mockReturnValue(false);
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Omitir' }));
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'ConductorHome' }] });
  });

  it('desde el historial encuentra el viaje aunque ya no sea el actual', () => {
    renderScreen(false);
    expect(screen.getByText('¿Cómo fue el viaje con Carlos?')).toBeTruthy();
  });

  it('no se puede enviar sin estrellas', () => {
    renderScreen();
    expect(screen.getByText('¿Cómo fue el viaje con Carlos?')).toBeTruthy();
    const enviar = screen.getByRole('button', { name: 'Enviar calificación' });
    expect(enviar.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('elegir 4 estrellas, marcar etiquetas y enviar guarda la nota y vuelve al inicio', async () => {
    renderScreen();
    fireEvent.press(screen.getByRole('radio', { name: '4 estrellas' }));
    expect(screen.getByLabelText('Calificación: 4 de 5')).toBeTruthy();

    const puntual = screen.getByRole('checkbox', { name: 'Puntual' });
    fireEvent.press(puntual);
    expect(screen.getByRole('checkbox', { name: 'Puntual' }).props.accessibilityState).toMatchObject({ checked: true });

    fireEvent.press(screen.getByRole('button', { name: 'Enviar calificación' }));
    expect(useConductorStore.getState().historial[0].calificacion).toBe(4);
    expect(screen.getByText('Calificación enviada')).toBeTruthy();

    await act(async () => { jest.advanceTimersByTime(1200); });
    expect(navigation.goBack).toHaveBeenCalled();
    expect(useConductorStore.getState().solicitudActual).toBeNull();
  });

  it('omitir vuelve al inicio sin calificar', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Omitir' }));
    expect(navigation.goBack).toHaveBeenCalled();
    expect(useConductorStore.getState().historial[0].calificacion).toBe(0);
  });
});
