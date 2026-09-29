package expo.modules.burbujaflotante

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Puente con JS. La logica esta en [BurbujaManager]. */
class BurbujaFlotanteModule : Module() {
  private val contexto: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("BurbujaFlotante")

    Events("onTocar", "onCerrar")

    OnCreate {
      BurbujaManager.oyente = object : BurbujaManager.Oyente {
        override fun alTocar() = sendEvent("onTocar", emptyMap<String, Any?>())
        override fun alCerrar() = sendEvent("onCerrar", emptyMap<String, Any?>())
      }
    }

    OnDestroy {
      BurbujaManager.oyente = null
    }

    Function("tienePermiso") {
      BurbujaManager.tienePermiso(contexto)
    }

    Function("abrirAjustesPermiso") {
      BurbujaManager.abrirAjustesPermiso(contexto)
    }

    Function("mostrar") { opciones: Map<String, Any?> ->
      BurbujaManager.mostrar(contexto, BurbujaOpciones.desdeMapa(opciones))
    }

    Function("ocultar") {
      BurbujaManager.ocultar(contexto)
    }

    Function("estaVisible") {
      BurbujaManager.visible
    }
  }
}
