import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/** Preferencias del conductor que deben sobrevivir al cerrar la app. */
interface PreferenciasState {
  /** Notificacion cuando llega una solicitud con la app en segundo plano. */
  avisosSolicitudes: boolean;
  /** Android: traer Run Pilot al frente cuando llega una solicitud estando en otra app. */
  abrirAlRecibir: boolean;
  cargado: boolean;
  cargar: () => Promise<void>;
  setAvisosSolicitudes: (v: boolean) => void;
  setAbrirAlRecibir: (v: boolean) => void;
}

const CLAVE_AVISOS = 'runpilot.pref.avisosSolicitudes';
const CLAVE_ABRIR = 'runpilot.pref.abrirAlRecibir';

// Solo se guarda lo que el conductor apago; por defecto todo activado
const leer = (v: string | null) => v !== '0';

async function guardar(clave: string, v: boolean) {
  try {
    await SecureStore.setItemAsync(clave, v ? '1' : '0');
  } catch {
    // sin almacenamiento: la eleccion dura hasta cerrar la app
  }
}

export const usePreferenciasStore = create<PreferenciasState>((set) => ({
  avisosSolicitudes: true,
  abrirAlRecibir: true,
  cargado: false,
  cargar: async () => {
    try {
      const [avisos, abrir] = await Promise.all([
        SecureStore.getItemAsync(CLAVE_AVISOS),
        SecureStore.getItemAsync(CLAVE_ABRIR),
      ]);
      set({ avisosSolicitudes: leer(avisos), abrirAlRecibir: leer(abrir), cargado: true });
    } catch {
      set({ cargado: true });
    }
  },
  setAvisosSolicitudes: (v) => {
    set({ avisosSolicitudes: v });
    void guardar(CLAVE_AVISOS, v);
  },
  setAbrirAlRecibir: (v) => {
    set({ abrirAlRecibir: v });
    void guardar(CLAVE_ABRIR, v);
  },
}));
