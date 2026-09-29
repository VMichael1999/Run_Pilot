import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BurbujaFlotante } from '@modules/burbuja-flotante';

const CLAVE_PREGUNTADO = 'runpilot.burbuja.preguntado';

/** Si ya se le mostro al conductor la pantalla del permiso (se muestra una sola vez). */
export async function yaSePreguntoPermiso(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(CLAVE_PREGUNTADO)) === '1';
  } catch {
    return true; // ante la duda, no insistir
  }
}

export async function marcarPermisoPreguntado(): Promise<void> {
  try {
    await SecureStore.setItemAsync(CLAVE_PREGUNTADO, '1');
  } catch {
    // sin almacenamiento: a lo sumo se vuelve a preguntar
  }
}

/** Estado del permiso "Mostrar sobre otras apps", refrescado al volver de Ajustes. */
export function usePermisoBurbuja() {
  const [permiso, setPermiso] = useState(() => BurbujaFlotante.tienePermiso());
  const refrescar = useCallback(() => setPermiso(BurbujaFlotante.tienePermiso()), []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') refrescar();
    });
    return () => sub.remove();
  }, [refrescar]);

  return { disponible: BurbujaFlotante.disponible, permiso, refrescar };
}
