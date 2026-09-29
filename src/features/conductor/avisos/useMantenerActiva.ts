import { useEffect } from 'react';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { useConductorStore } from '@store/useConductorStore';
import { hayViajeEnCurso } from '../burbuja/reglas';

/**
 * Conectado (o con un viaje en curso) la app se mantiene viva en segundo plano para recibir
 * solicitudes. No depende de la burbuja flotante ni de su permiso. Solo Android.
 */
export function useMantenerActiva() {
  const activo = useConductorStore((s) => s.isOnline || hayViajeEnCurso(s.solicitudActual, s.estadoViaje));
  const enCurso = useConductorStore((s) => hayViajeEnCurso(s.solicitudActual, s.estadoViaje));

  useEffect(() => {
    if (!BurbujaFlotante.disponible) return;
    if (activo) {
      BurbujaFlotante.mantenerActiva({
        tituloNotificacion: enCurso ? 'Viaje en curso' : 'Conectado · buscando viajes',
        textoNotificacion: 'Toca para volver a Run Pilot',
      });
    } else {
      BurbujaFlotante.soltarActiva();
    }
  }, [activo, enCurso]);

  useEffect(() => () => BurbujaFlotante.soltarActiva(), []);
}
