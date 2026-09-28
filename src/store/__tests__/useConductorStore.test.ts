import { useConductorStore } from '../useConductorStore';
import { mockSolicitudes } from '@features/conductor/data/mockSolicitudes';

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 8, 28, 10, 0).getTime() });
  useConductorStore.setState({ solicitudActual: null, estadoViaje: null, esperandoDesde: null });
});
afterEach(() => jest.useRealTimers());

describe('useConductorStore · viaje', () => {
  it('recorre las fases y guarda cuando se llego al recojo', () => {
    const s = useConductorStore.getState();
    s.setSolicitudActual(mockSolicitudes[0]);
    expect(useConductorStore.getState()).toMatchObject({ estadoViaje: 'aceptado', esperandoDesde: null });

    useConductorStore.getState().avanzarEstado(); // en_camino
    useConductorStore.getState().avanzarEstado(); // esperando
    expect(useConductorStore.getState()).toMatchObject({
      estadoViaje: 'esperando',
      esperandoDesde: new Date(2026, 8, 28, 10, 0).getTime(),
    });

    useConductorStore.getState().avanzarEstado(); // iniciado
    expect(useConductorStore.getState()).toMatchObject({ estadoViaje: 'iniciado', esperandoDesde: null });
  });

  it('finalizar limpia el viaje activo y lo agrega al historial', () => {
    const antes = useConductorStore.getState().historial.length;
    useConductorStore.getState().setSolicitudActual(mockSolicitudes[0]);
    useConductorStore.getState().finalizarViaje();
    const st = useConductorStore.getState();
    expect(st.estadoViaje).toBeNull();
    expect(st.esperandoDesde).toBeNull();
    expect(st.historial).toHaveLength(antes + 1);
  });
});
