# Estado de pruebas unitarias

| Modulo | Archivo de test | Estado |
|--------|----------------|--------|
| ThemeColors (roles y contraste) | src/theme/__tests__/colors.test.ts | 27 tests, en verde |
| useAuthStore | pendiente | sin tests |
| useThemeStore | src/store/__tests__/useThemeStore.test.ts | 5 tests, en verde |
| ConductorHomeScreen | src/features/conductor/home/__tests__/ConductorHomeScreen.test.tsx | 3 tests (render), en verde |
| IncomingRequestOverlay | src/features/conductor/home/__tests__/IncomingRequestOverlay.test.tsx | 4 tests (render, rechazar, aceptar accesible, expira), en verde |
| PanelPago (efectivo, digital, otro método) | src/features/conductor/viaje/__tests__/PanelPago.test.tsx | 3 tests, en verde |
| cobro (desglose, distrito, efectivo) | src/shared/utils/__tests__/cobro.test.ts | 6 tests, en verde |
| geo (distancia, restante, formato) | src/shared/utils/__tests__/geo.test.ts | 11 tests, en verde |
| ViajeScreen (fases, SOS, llamar, fuga de GPS) | src/features/conductor/viaje/__tests__/ViajeScreen.test.tsx | 9 tests, en verde |
| format (soles, viajes, tiempo) | src/shared/utils/__tests__/format.test.ts | 9 tests, en verde |
| CalificarScreen (estrellas, etiquetas, enviar, omitir, desde historial) | src/features/conductor/calificar/__tests__/CalificarScreen.test.tsx | 5 tests, en verde |
| HistorialViaje + HistorialDetalle | src/features/conductor/historial/__tests__/HistorialViajeScreen.test.tsx | 5 tests, en verde |
| agrupar historial por día | src/features/conductor/historial/__tests__/agrupar.test.ts | 1 test, en verde |
| LoginScreen | pendiente | sin tests |
| LoginVerificacionScreen | pendiente | sin tests |
| SolicitudesScreen | pendiente | sin tests |
| IngresosScreen + BilleteraScreen | src/features/conductor/ingresos/__tests__/IngresosScreen.test.tsx | 5 tests, en verde |
| resumen de ingresos (hoy, semana, mes) | src/features/conductor/ingresos/__tests__/resumen.test.ts | 4 tests, en verde |
| fecha (hoy/ayer, semana, mes, título de día) | src/shared/utils/__tests__/fecha.test.ts | 5 tests, en verde |
| ExperienciaScreen | pendiente | sin tests |
| CuentaScreen | pendiente | sin tests |

> Actualizar este archivo cada vez que se agregen o completen tests.
