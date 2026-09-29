import * as SecureStore from 'expo-secure-store';
import { usePreferenciasStore } from '../usePreferenciasStore';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn(() => Promise.resolve()) }));
const store = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
  usePreferenciasStore.setState({ avisosSolicitudes: true, abrirAlRecibir: true, cargado: false });
});

describe('usePreferenciasStore', () => {
  it('por defecto todo activado', async () => {
    store.getItemAsync.mockResolvedValue(null);
    await usePreferenciasStore.getState().cargar();
    expect(usePreferenciasStore.getState()).toMatchObject({ avisosSolicitudes: true, abrirAlRecibir: true, cargado: true });
  });

  it('recuerda lo que el conductor apago', async () => {
    store.getItemAsync.mockImplementation((k: string) => Promise.resolve(k.endsWith('abrirAlRecibir') ? '0' : '1'));
    await usePreferenciasStore.getState().cargar();
    expect(usePreferenciasStore.getState()).toMatchObject({ avisosSolicitudes: true, abrirAlRecibir: false });
  });

  it('cambiar un switch lo guarda', () => {
    usePreferenciasStore.getState().setAbrirAlRecibir(false);
    expect(usePreferenciasStore.getState().abrirAlRecibir).toBe(false);
    expect(store.setItemAsync).toHaveBeenCalledWith('runpilot.pref.abrirAlRecibir', '0');
  });

  it('si el almacenamiento falla, queda con los valores por defecto', async () => {
    store.getItemAsync.mockRejectedValue(new Error('x'));
    await usePreferenciasStore.getState().cargar();
    expect(usePreferenciasStore.getState()).toMatchObject({ avisosSolicitudes: true, abrirAlRecibir: true, cargado: true });
  });
});
