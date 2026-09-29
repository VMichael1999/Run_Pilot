import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { useConductorStore } from '@store/useConductorStore';
import { accionBurbuja, hayViajeEnCurso, opcionesBurbuja } from './reglas';

/**
 * Atajo para volver a Run Pilot: conectado (con o sin viaje), al salir de la app aparece
 * la burbuja; al volver (tocandola o por cualquier otro camino) desaparece.
 * Solo Android con development build; en el resto no hace nada.
 */
export function useBurbujaConductor() {
  const enCurso = useConductorStore((s) => hayViajeEnCurso(s.solicitudActual, s.estadoViaje));
  const conectado = useConductorStore((s) => s.isOnline);
  const activo = conectado || enCurso;
  const estadoRef = useRef({ activo, enCurso });
  estadoRef.current = { activo, enCurso };

  useEffect(() => {
    if (!BurbujaFlotante.disponible) return;
    const sub = AppState.addEventListener('change', (estadoApp) => {
      const { activo: activoAhora, enCurso: enCursoAhora } = estadoRef.current;
      const accion = accionBurbuja(estadoApp, activoAhora, BurbujaFlotante.tienePermiso());
      if (accion === 'mostrar') BurbujaFlotante.mostrar(opcionesBurbuja(enCursoAhora));
      else if (accion === 'ocultar') BurbujaFlotante.ocultar();
    });
    return () => {
      sub.remove();
      BurbujaFlotante.ocultar();
    };
  }, []);

  // Al desconectarse (sin viaje) no debe quedar ninguna burbuja
  useEffect(() => {
    if (!activo && BurbujaFlotante.disponible) BurbujaFlotante.ocultar();
  }, [activo]);
}
