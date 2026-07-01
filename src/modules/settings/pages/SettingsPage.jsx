import { useState } from 'react'
import { CreditCard, Moon, Save, Store, Sun, Phone, MapPin } from 'lucide-react'
import Input from '../../../components/ui/Input'
import { getTheme, setTheme as saveTheme } from '../../../services/themeService'

const INITIAL = {
  nombre: 'Calzacaribe',
  nit: '900.123.456-7',
  email: 'ventas@calzacaribe.co',
  telefono: '315-555-0001',
  ciudad: 'Barranquilla',
  direccion: 'Cra 54 # 72-150, Piso 2',
  sitioWeb: 'www.calzacaribe.co',
  moneda: 'COP',
  envioBase: '12000',
  envioGratis: '200000',
  whatsapp: '3155550001',
}

export default function SettingsPage() {
  const [form, setForm] = useState(INITIAL)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState(() => getTheme())

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(saveTheme(isDark ? 'light' : 'dark'))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Apariencia */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={16} className="text-gray-500" /> : <Sun size={16} className="text-gray-500" />}
              <div>
                <h2 className="text-sm font-bold text-black">Apariencia</h2>
                <p className="text-xs text-gray-400 mt-0.5">Activa o desactiva el modo oscuro del panel admin.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative h-7 w-14 rounded-full transition-colors flex-shrink-0 ${isDark ? 'bg-lime-300' : 'bg-gray-200'}`}
              aria-pressed={isDark}
              aria-label="Cambiar modo oscuro"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Info de la tienda */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Información de la tienda</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre de la tienda" value={form.nombre} onChange={set('nombre')} />
            <Input label="NIT / RUT" value={form.nit} onChange={set('nit')} />
          </div>
        </div>

        {/* Contacto */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Phone size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Contacto</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email de ventas" type="email" value={form.email} onChange={set('email')} />
            <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} />
            <Input label="WhatsApp (solo números)" value={form.whatsapp} onChange={set('whatsapp')} />
            <Input label="Sitio web" value={form.sitioWeb} onChange={set('sitioWeb')} />
          </div>
        </div>

        {/* Ubicación */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Ubicación</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ciudad" value={form.ciudad} onChange={set('ciudad')} />
            <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
          </div>
        </div>

        {/* Envíos y pagos */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Envíos y pagos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Moneda</label>
              <select value={form.moneda} onChange={set('moneda')} className="input-field bg-white">
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>
            <Input label="Costo de envío base (COP)" type="number" value={form.envioBase} onChange={set('envioBase')} />
            <Input label="Compra mín. para envío gratis (COP)" type="number" value={form.envioGratis} onChange={set('envioGratis')} />
          </div>
        </div>

        {/* Zona peligrosa */}
        <div className="section-card p-5 border-l-4 border-red-500">
          <h2 className="text-sm font-bold text-red-600 mb-1">Zona de riesgo</h2>
          <p className="text-xs text-gray-500 mb-3">Estas acciones son irreversibles. Úsalas con cuidado.</p>
          <button type="button" onClick={() => confirm('¿Resetear todos los datos al estado inicial?') && localStorage.clear() && window.location.reload()} className="btn-danger text-xs">
            Resetear todos los datos
          </button>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" className={`btn-primary ${saved ? 'bg-lime-500 hover:bg-lime-600' : ''}`}>
            <Save size={15} />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
