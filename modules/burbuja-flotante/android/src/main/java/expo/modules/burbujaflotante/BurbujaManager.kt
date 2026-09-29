package expo.modules.burbujaflotante

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log

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

  private val principal = Handler(Looper.getMainLooper())
  private var vista: BurbujaVista? = null

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
    principal.post {
      if (!visible || vista != null) return@post
      val nueva = BurbujaVista(app, opciones, alTocar = { tocada(app) }, alCerrar = { cerradaPorUsuario(app) })
      try {
        nueva.agregar()
      } catch (e: Exception) {
        Log.w(TAG, "No se pudo mostrar la burbuja", e)
        visible = false
        return@post
      }
      vista = nueva
      // Despues de que la burbuja es visible: Android 15 solo deja iniciar el servicio
      // desde segundo plano si la app ya tiene una ventana superpuesta visible.
      BurbujaServicio.iniciar(app, opciones)
    }
    return true
  }

  fun ocultar(ctx: Context) {
    val app = ctx.applicationContext
    visible = false
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

  /** Trae la app al frente como lo haria el lanzador (misma tarea, mismo estado). */
  internal fun abrirApp(app: Context) {
    val intent = app.packageManager.getLaunchIntentForPackage(app.packageName) ?: return
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
    try {
      app.startActivity(intent)
    } catch (e: Exception) {
      Log.w(TAG, "No se pudo abrir la app", e)
    }
  }
}
