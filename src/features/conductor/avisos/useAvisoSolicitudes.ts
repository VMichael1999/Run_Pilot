import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Solicitud } from '../types';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { usePreferenciasStore } from '@store/usePreferenciasStore';
import { reaccionSolicitud } from './reglas';
import { avisarSolicitud, quitarAviso } from './notificaciones';

/** Segundos de espera antes de avisar y abrir al llegar una solicitud en segundo plano. */
const RETRASO_SEGUNDO_PLANO = 4;

/**
 * Cuando llega una solicitud con la app en segundo plano: notificacion y, si el conductor
 * lo eligio (solo Android), la app se abre sola. Si el conductor sale de la app con una
 * solicitud en pantalla solo se le recuerda con la notificacion: la app no se reabre.
 * [mostrar] lleva a la pantalla de la solicitud al tocar el aviso o al volver a la app.
 */
export function useAvisoSolicitudes(solicitud: Solicitud | null, mostrar: () => void) {
  const avisos = usePreferenciasStore((s) => s.avisosSolicitudes);
  const abrirAlRecibir = usePreferenciasStore((s) => s.abrirAlRecibir);
  const prefs = useRef({ avisos, abrirAlRecibir });
  prefs.current = { avisos, abrirAlRecibir };
  const pendiente = useRef(solicitud);
  pendiente.current = solicitud;
  const mostrarRef = useRef(mostrar);
  mostrarRef.current = mostrar;
  // Solicitud cuyo aviso ya se pidio (se marca antes de que llegue el id) y el id del aviso
  const avisada = useRef<Solicitud | null>(null);
  const idAviso = useRef<string | null>(null);

  const quitarAvisoActual = () => {
    BurbujaFlotante.cancelarApertura?.();
    void quitarAviso(idAviso.current);
    idAviso.current = null;
    avisada.current = null;
  };

  const procesarReaccion = (
    sol: Solicitud,
    estado: AppStateStatus,
    { retrasoSegundos = 0, permitirAbrir = true } = {},
  ) => {
    const r = reaccionSolicitud({
      estadoApp: estado,
      ...prefs.current,
      puedeAbrir: BurbujaFlotante.disponible && BurbujaFlotante.tienePermiso(),
    });
    if (r.notificar && avisada.current !== sol) {
      avisada.current = sol;
      void avisarSolicitud(sol, retrasoSegundos).then((id) => {
        // El id llega tarde: si mientras tanto la solicitud cambio o se quito el aviso, se descarta
        if (pendiente.current === sol && avisada.current === sol) {
          idAviso.current = id;
        } else {
          void quitarAviso(id);
        }
      });
    }
    if (r.abrir && permitirAbrir) {
      if (retrasoSegundos > 0) {
        BurbujaFlotante.programarApertura?.(retrasoSegundos);
      } else {
        BurbujaFlotante.abrirApp();
      }
    }
  };

  // Cada solicitud nueva; al aceptarse, rechazarse o expirar se quita su aviso
  useEffect(() => {
    if (!solicitud) {
      quitarAvisoActual();
      return;
    }
    const enSegundoPlano = AppState.currentState === 'background';
    procesarReaccion(solicitud, AppState.currentState, {
      retrasoSegundos: enSegundoPlano ? RETRASO_SEGUNDO_PLANO : 0,
    });
    return quitarAvisoActual;
  }, [solicitud]);

  useEffect(() => {
    // Tocar el aviso abre la app: llevar a la solicitud
    const alTocar = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data = resp.notification.request.content.data as { tipo?: string } | undefined;
      if (data?.tipo === 'solicitud') mostrarRef.current();
    });

    // Cambios de estado de la app ('inactive' de iOS no cuenta: el conductor sigue en la app):
    // - Al salir de la app con solicitud pendiente: recordarla con la notificacion
    // - Al volver a primer plano con solicitud pendiente: quitar aviso y asegurar vista
    const alCambiarEstado = AppState.addEventListener('change', (estado) => {
      if (!pendiente.current) return;

      if (estado === 'active') {
        quitarAvisoActual();
        mostrarRef.current();
      } else if (estado === 'background') {
        procesarReaccion(pendiente.current, estado, { permitirAbrir: false });
      }
    });

    return () => {
      alTocar.remove();
      alCambiarEstado.remove();
    };
  }, []);
}
