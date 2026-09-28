import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../useThemeStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const mocked = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
  useThemeStore.setState({ preference: 'system', hasHydrated: false });
});

describe('useThemeStore', () => {
  it('sin preferencia guardada sigue al sistema', async () => {
    mocked.getItemAsync.mockResolvedValueOnce(null);
    await useThemeStore.getState().loadTheme();
    expect(useThemeStore.getState()).toMatchObject({ preference: 'system', hasHydrated: true });
  });

  it('respeta una eleccion manual guardada', async () => {
    mocked.getItemAsync.mockResolvedValueOnce('dark');
    await useThemeStore.getState().loadTheme();
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('un valor desconocido vuelve a sistema', async () => {
    mocked.getItemAsync.mockResolvedValueOnce('azul');
    await useThemeStore.getState().loadTheme();
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('si falla la lectura igual termina de hidratar', async () => {
    mocked.getItemAsync.mockRejectedValueOnce(new Error('keystore'));
    await useThemeStore.getState().loadTheme();
    expect(useThemeStore.getState()).toMatchObject({ preference: 'system', hasHydrated: true });
  });

  it('guarda la eleccion manual y borra la clave al volver a sistema', () => {
    useThemeStore.getState().setPreference('light');
    expect(mocked.setItemAsync).toHaveBeenCalledWith('runpilot.theme', 'light');
    useThemeStore.getState().setPreference('system');
    expect(mocked.deleteItemAsync).toHaveBeenCalledWith('runpilot.theme');
    expect(useThemeStore.getState().preference).toBe('system');
  });
});
