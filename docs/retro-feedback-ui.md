# Retrospectiva: observaciones de la revisión en dispositivo

Rama: `fix/feedback-rediseno-ui` (sale de `claude/sharp-cannon-freqef`).
Origen: 4 capturas en iOS (solicitud entrante, cobro, billetera, inicio conectado) y comentarios de la revisión.

## 1. Observaciones, causa y solución

| # | Observación | Causa raíz | Solución | Commit |
|---|---|---|---|---|
| 1 | El precio sale cortado arriba (solicitud, cobro, saldo) | "S/" y el monto eran dos `Text` anidados con alturas de línea distintas; iOS recorta los ascendentes de General Sans cuando `lineHeight` ≈ `fontSize` | Componente `Price`: símbolo y monto como hermanos alineados por la base; alturas de línea holgadas en `price`, `priceXL`, `hero`, `display`, `currency` | `fix(ui)` |
| 2 | El mapa se ve gris, sin colores | Se aplicó el estilo "apagado" del HTML (`customMapStyle`) | Se quitó el estilo en todos los mapas: Google Maps por defecto | `fix(map)` |
| 3 | La polilínea no es negra | Dos mapas no tenían borde y el color venía de un token que no era negro puro | `RoutePolyline` único: negra con borde blanco (día) y verde con borde negro (noche), en los 3 mapas con ruta | `fix(map)` |
| 4 | Círculo, rayita y cuadrado separados | La línea tenía 3 dp de margen arriba y abajo | La línea sale pegada al círculo y entra en la fila siguiente hasta tocar el cuadrado | `fix(map)` |
| 5 | Acceso directo al tablero desde el inicio | No existía; solo estaba en el menú | Botón flotante "Tablero" con contador sobre el panel | `feat(home)` |
| 6 | Pasos del viaje con botones | Solo "Finalizar" era deslizable | Ir al recojo, Llegué, Iniciar y Finalizar son deslizables | `feat(trip)` |
| 7 | Poca información del pasajero; la barra de progreso no aporta | Se siguió el HTML, que muestra solo nombre y progreso | Panel con nombre, calificación, viajes, contacto, 3 datos por fase y notas del pasajero | `feat(trip)` |
| 8 | Recargar/Retirar no hacen nada y el saldo sale cortado | Solo mostraban un aviso; el saldo tenía el problema #1 | Pantallas nuevas de Recargar y Retirar; el saldo usa `Price` | `feat(wallet)` / `fix(ui)` |

## 2. Flujos

### Viaje (todas las acciones se deslizan)

```
Solicitud entrante ──desliza "Aceptar"──▶ Ir al recojo
  Ir al recojo      ──desliza "Ir al punto de recojo"──▶ En camino
  En camino         ──desliza "Llegué al punto de recojo"──▶ Esperando (cuenta 5:00 sin costo)
  Esperando         ──desliza "Iniciar viaje"──▶ En viaje
  En viaje          ──desliza "Finalizar viaje"──▶ Cobro ──"Cobré S/ …"──▶ Calificar ──▶ Inicio
```

Panel del pasajero por fase:

| Fase | Dato 1 | Dato 2 | Dato 3 | Notas |
|---|---|---|---|---|
| Recojo | Cobro (efectivo en verde) | Servicio | Distancia al recojo | Referencia del recojo, comentario |
| Esperando | Espera sin costo (5:00 → 0:00, luego "excedida" en rojo) | Cobro | Duración del viaje | Referencia del recojo, comentario |
| En viaje | Hora de llegada | Km que faltan | Cobro | Comentario |

Referencias: Uber y DiDi usan deslizar para iniciar y terminar el viaje; en el recojo muestran nombre, calificación, notas del pasajero y un temporizador de espera de 5 min en UberX.

### Recargar

```
Billetera ─▶ Recargar ─▶ monto (escrito o S/ 20 · 50 · 100) ─▶ método (Yape · Plin · Tarjeta · Agente)
          ─▶ "Recargar S/ 50.00 con Yape" ─▶ Recarga en proceso | Código de pago (agente) ─▶ Billetera
```
Validación: mínimo S/ 10, máximo S/ 500.

### Retirar

```
Billetera ─▶ Retirar ─▶ monto (escrito o S/ 20 · 50 · Todo) ─▶ destino (Cuenta · Yape · Plin · Efectivo en agente)
          ─▶ "Retirar S/ 50.00 a Yape" ─▶ Retiro solicitado | Código de retiro (agente, 24 h) ─▶ Billetera
```
Validación: mínimo S/ 10, máximo el saldo disponible.

## 3. Retrospectiva

**Qué falló**
- Se dio por terminado el rediseño sin verlo en un dispositivo. `tsc`, los tests y el empaquetado no detectan recortes de texto ni colores del mapa.
- Se siguió el HTML al pie de la letra en decisiones que el HTML no podía validar: el mapa apagado era un dibujo SVG, no Google Maps real.
- La ruta se dibujaba de 3 formas distintas en 3 archivos; por eso 2 mapas quedaron sin borde.
- En la pantalla de viaje se priorizó "casi nada que tocar" (HTML) sobre la información que el conductor necesita (cobro, notas, espera).

**Qué cambia**
- Componentes únicos para lo que se repite: `Price` (cifras grandes) y `RoutePolyline` (rutas).
- Antes de dar una pantalla por terminada: captura en iOS y Android, en claro y oscuro, y con texto grande. Si no se puede capturar, decirlo en la entrega.
- Cuando el diseño de referencia contradice el uso real (mapa, información en viaje), preguntar antes de copiarlo.

## 4. Pendiente y dudas abiertas

- **Polilínea azul en la captura**: el color configurado era casi negro (`#111519`) y en la captura se ve azul oscuro. No encontré la causa en el código. Ahora es `#000000` puro; si sigue azul en tu dispositivo, puede ser un build viejo en caché (`npx expo start -c`).
- Recargar y Retirar **no procesan pagos**: el resultado se muestra como solicitado y el saldo no cambia. Hace falta la pasarela (Yape/Plin/Niubiz o similar) y un backend.
- Los códigos de agente (482 931, 715 208) son de ejemplo.
- La espera sin costo de 5 min es una referencia de Uber, no una regla de Run Pilot. Confirmar el tiempo real y si hay cobro por espera.
- El modo oscuro del mapa de Google no se oscurece solo: con el mapa por defecto, de noche el mapa queda claro. Si quieres mapa oscuro de noche, se puede aplicar el estilo oscuro de Google solo en ese modo.
