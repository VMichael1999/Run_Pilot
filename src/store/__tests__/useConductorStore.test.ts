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

  it('ingresosDia suma la ganancia neta (tarifa menos comision), no la tarifa', () => {
    useConductorStore.setState({ ingresosDia: 0 });
    useConductorStore.getState().setSolicitudActual(mockSolicitudes[0]); // S/ 18.50 al 15 %
    useConductorStore.getState().finalizarViaje();
    expect(useConductorStore.getState().ingresosDia).toBe(15.72);
  });

  it('setVehiculo cambia el vehiculo activo', () => {
    useConductorStore.getState().setVehiculo('veh-2');
    expect(useConductorStore.getState().vehiculoId).toBe('veh-2');
  });
});

describe('useConductorStore · cancelar', () => {
  it('cancelar limpia el viaje activo, no suma ganancia y registra el motivo', () => {
    useConductorStore.setState({ ingresosDia: 0, cancelaciones: [] });
    const historialAntes = useConductorStore.getState().historial.length;
    useConductorStore.getState().setSolicitudActual(mockSolicitudes[0]);
    useConductorStore.getState().avanzarEstado();
    useConductorStore.getState().avanzarEstado(); // esperando
    useConductorStore.getState().cancelarViaje('no_se_presento');
    const st = useConductorStore.getState();
    expect(st).toMatchObject({ solicitudActual: null, estadoViaje: null, esperandoDesde: null, ingresosDia: 0 });
    expect(st.historial).toHaveLength(historialAntes);
    expect(st.cancelaciones[0]).toMatchObject({ motivo: 'no_se_presento', solicitud: { id: 'sol-001' } });
  });

  it('sin viaje activo no hace nada', () => {
    useConductorStore.setState({ cancelaciones: [] });
    useConductorStore.getState().cancelarViaje('otro');
    expect(useConductorStore.getState().cancelaciones).toHaveLength(0);
  });
});
