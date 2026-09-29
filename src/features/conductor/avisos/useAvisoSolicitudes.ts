import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Solicitud } from '../types';
import { BurbujaFlotante } from '@modules/burbuja-flotante';
import { usePreferenciasStore } from '@store/usePreferenciasStore';
import { reaccionSolicitud } from './reglas';
import { avisarSolicitud, quitarAviso } from './notificaciones';

/**
 * Cuando llega una solicitud con la app en segundo plano: notificacion y, si el conductor
 * lo eligio (solo Android), la app se abre sola. [mostrar] lleva a la pantalla de la
 * solicitud al tocar el aviso o al volver a la app.
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
  const idAviso = useRef<string | null>(null);

  const procesarReaccion = (sol: Solicitud, estado: AppStateStatus, retrasoSegundos = 0) => {
    const r = reaccionSolicitud({
      estadoApp: estado,
      ...prefs.current,
      puedeAbrir: BurbujaFlotante.disponible && BurbujaFlotante.tienePermiso(),
    });
    if (r.notificar && !idAviso.current) {
      void avisarSolicitud(sol, retrasoSegundos).then((id) => {
        if (!pendiente.current) {
          void quitarAviso(id);
        } else {
          idAviso.current = id;
        }
      });
    }
    if (r.abrir) {
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
      BurbujaFlotante.cancelarApertura?.();
      void quitarAviso(idAviso.current);
      idAviso.current = null;
      return;
    }
    const esSegundoPlano = AppState.currentState !== 'active';
    procesarReaccion(solicitud, AppState.currentState, esSegundoPlano ? 4 : 0);
    return () => {
      BurbujaFlotante.cancelarApertura?.();
      void quitarAviso(idAviso.current);
      idAviso.current = null;
    };
  }, [solicitud]);

  useEffect(() => {
    // Tocar el aviso abre la app: llevar a la solicitud
    const alTocar = Notifications.addNotificationResponseReceivedListener((resp) => {
      const data = resp.notification.request.content.data as { tipo?: string } | undefined;
      if (data?.tipo === 'solicitud') mostrarRef.current();
    });

    // Cambios de estado de la app:
    // - Al pasar a segundo plano con solicitud pendiente: avisar y/o abrir la app
    // - Al volver a primer plano con solicitud pendiente: quitar aviso y asegurar vista
    const alCambiarEstado = AppState.addEventListener('change', (estado) => {
      if (!pendiente.current) return;

      if (estado === 'active') {
        BurbujaFlotante.cancelarApertura?.();
        void quitarAviso(idAviso.current);
        idAviso.current = null;
        mostrarRef.current();
      } else {
        procesarReaccion(pendiente.current, estado);
      }
    });

    return () => {
      alTocar.remove();
      alCambiarEstado.remove();
    };
  }, []);
}
