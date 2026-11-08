import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

// Avisos flotantes del panel. Se llaman desde cualquier parte con toast.success('...') o
// toast.error('...'); <Toaster /> (montado una sola vez en main.jsx) es quien los dibuja.
// Sobreviven a un cambio de página, así un "Producto creado" se ve aunque se navegue enseguida.

let siguienteId = 1
const oyentes = new Set()

function emitir(tipo, mensaje) {
  const aviso = { id: siguienteId++, tipo, mensaje }
  oyentes.forEach((fn) => fn(aviso))
}

export const toast = {
  success: (mensaje) => emitir('success', mensaje),
  error: (mensaje) => emitir('error', mensaje),
}

const DURACION_MS = { success: 3000, error: 6000 }

export function Toaster() {
  const [avisos, setAvisos] = useState([])

  useEffect(() => {
    const quitar = (id) => setAvisos((a) => a.filter((x) => x.id !== id))
    const agregar = (aviso) => {
      setAvisos((a) => [...a, aviso])
      setTimeout(() => quitar(aviso.id), DURACION_MS[aviso.tipo])
    }
    oyentes.add(agregar)
    return () => oyentes.delete(agregar)
  }, [])

  if (avisos.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col items-end gap-2 pointer-events-none" aria-live="polite">
      {avisos.map((a) => {
        const Icono = a.tipo === 'success' ? CheckCircle2 : AlertCircle
        return (
          <div
            key={a.id}
            role={a.tipo === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto w-full sm:w-80 flex items-start gap-3 px-4 py-3 shadow-xl border-l-4 bg-white text-sm text-gray-800 ${
              a.tipo === 'success' ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <Icono size={18} className={`flex-shrink-0 mt-0.5 ${a.tipo === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            <p className="flex-1">{a.mensaje}</p>
            <button
              type="button"
              onClick={() => setAvisos((lista) => lista.filter((x) => x.id !== a.id))}
              className="text-gray-400 hover:text-black"
              aria-label="Cerrar aviso"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
