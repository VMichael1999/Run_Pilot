package expo.modules.burbujaflotante

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import java.util.concurrent.atomic.AtomicInteger

/**
 * Punto unico para mostrar y ocultar la burbuja. Se puede llamar desde cualquier hilo:
 * el trabajo con vistas se hace en el hilo principal, en el orden en que se pidio.
 */
object BurbujaManager {
  internal const val TAG = "BurbujaFlotante"

  interface Oyente {
    fun alTocar()
    fun alCerrar()
  }

  @Volatile var oyente: Oyente? = null

  /** Lo que se pidio por ultima vez (la vista se crea un instante despues, en el hilo principal). */
  @Volatile var visible = false
    private set

  private const val ESPERA_MS = 250L
  private const val MAX_INTENTOS = 6

  private val principal = Handler(Looper.getMainLooper())
  private var vista: BurbujaVista? = null
  /** Cada mostrar/ocultar invalida los reintentos pendientes del pedido anterior. */
  private val ultimoPedido = AtomicInteger(0)

  fun tienePermiso(ctx: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(ctx)

  /** Abre la pantalla del sistema "Mostrar sobre otras apps" de esta app. */
  fun abrirAjustesPermiso(ctx: Context) {
    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${ctx.packageName}"))
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      ctx.startActivity(intent)
    } catch (e: Exception) {
      // Algunos fabricantes no tienen la pantalla por app: se abre la de la app
      ctx.startActivity(
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}"))
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }
  }

  /** @return false si falta el permiso; true si la burbuja se mostrara (o ya estaba). */
  fun mostrar(ctx: Context, opciones: BurbujaOpciones): Boolean {
    val app = ctx.applicationContext
    if (!tienePermiso(app)) return false
    visible = true
    val pedido = ultimoPedido.incrementAndGet()
    principal.post { intentarMostrar(app, opciones, pedido, intentos = 0) }
    return true
  }

  /**
   * React Native avisa "background" en cuanto la actividad se pausa, y eso tambien pasa con un
   * dialogo del sistema encima de la app. La burbuja solo se muestra cuando la app ya no esta
   * visible; si tras ~1.5 s sigue visible (dialogo), no se muestra.
   */
  private fun intentarMostrar(app: Context, opciones: BurbujaOpciones, pedido: Int, intentos: Int) {
    if (!visible || pedido != ultimoPedido.get() || vista != null) return
    if (appVisible()) {
      if (intentos < MAX_INTENTOS) {
        principal.postDelayed({ intentarMostrar(app, opciones, pedido, intentos + 1) }, ESPERA_MS)
      } else {
        visible = false
      }
      return
    }
    lateinit var nueva: BurbujaVista
    nueva = BurbujaVista(
      app,
      opciones,
      alTocar = { tocada(app) },
      alCerrar = { cerradaPorUsuario(app) },
      // Android 15 solo deja iniciar el servicio desde segundo plano con la ventana ya visible
      alHacerseVisible = { if (vista === nueva && visible) BurbujaServicio.iniciar(app, opciones) },
    )
    try {
      nueva.agregar()
    } catch (e: Exception) {
      Log.w(TAG, "No se pudo mostrar la burbuja", e)
      visible = false
      return
    }
    vista = nueva
  }

  /** true si alguna actividad de la app sigue en pantalla (aunque este pausada). */
  private fun appVisible(): Boolean {
    val estado = ActivityManager.RunningAppProcessInfo()
    ActivityManager.getMyMemoryState(estado)
    return estado.importance <= ActivityManager.RunningAppProcessInfo.IMPORTANCE_VISIBLE
  }

  fun ocultar(ctx: Context) {
    val app = ctx.applicationContext
    visible = false
    ultimoPedido.incrementAndGet()
    principal.post {
      vista?.quitar()
      vista = null
      BurbujaServicio.detener(app)
    }
  }

  private fun tocada(app: Context) {
    abrirApp(app)
    ocultar(app)
    oyente?.alTocar()
  }

  private fun cerradaPorUsuario(app: Context) {
    ocultar(app)
    oyente?.alCerrar()
  }

  /**
   * Trae la app al frente como lo haria el lanzador (misma tarea, mismo estado).
   * Desde segundo plano Android solo lo permite con el permiso "Mostrar sobre otras apps".
   * @return false si falta el permiso o Android no lo permitio.
   */
  fun abrirApp(ctx: Context): Boolean {
    val app = ctx.applicationContext
    if (!tienePermiso(app)) return false
    val intent = app.packageManager.getLaunchIntentForPackage(app.packageName) ?: return false
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
    return try {
      app.startActivity(intent)
      true
    } catch (e: Exception) {
      Log.w(TAG, "No se pudo abrir la app", e)
      false
    }
  }
}
