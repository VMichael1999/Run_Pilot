import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { useConductorStore } from '@store/useConductorStore';
import { accionBurbuja, hayViajeEnCurso, OPCIONES_BURBUJA } from './reglas';

/**
 * Atajo para volver al viaje: con un viaje en curso, al salir de la app aparece
 * la burbuja; al volver (tocandola o por cualquier otro camino) desaparece.
 * Solo Android con development build; en el resto no hace nada.
 */
export function useBurbujaViaje() {
  const enCurso = useConductorStore((s) => hayViajeEnCurso(s.solicitudActual, s.estadoViaje));
  const enCursoRef = useRef(enCurso);
  enCursoRef.current = enCurso;

  useEffect(() => {
    if (!BurbujaFlotante.disponible) return;
    const sub = AppState.addEventListener('change', (estado) => {
      const accion = accionBurbuja(estado, enCursoRef.current, BurbujaFlotante.tienePermiso());
      if (accion === 'mostrar') BurbujaFlotante.mostrar(OPCIONES_BURBUJA);
      else if (accion === 'ocultar') BurbujaFlotante.ocultar();
    });
    return () => {
      sub.remove();
      BurbujaFlotante.ocultar();
    };
  }, []);

  // Si el viaje termina o se cancela, no debe quedar ninguna burbuja
  useEffect(() => {
    if (!enCurso && BurbujaFlotante.disponible) BurbujaFlotante.ocultar();
  }, [enCurso]);
}
